import { GoogleGenAI, Type } from "@google/genai";
import { LessonPlan, LessonStep } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to generate image for a specific step
const generateStepImage = async (prompt: string): Promise<string> => {
  try {
    // We removed "photorealistic" to allow the model to request "hand-drawn chalk diagrams" if it wants.
    const imagePrompt = `Educational illustration: ${prompt}. High quality, clear, suitable for a classroom context.`;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: imagePrompt }] },
      config: { imageConfig: { aspectRatio: "4:3" } },
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
        }
      }
    }
    return "";
  } catch (e) {
    console.error("Image gen failed", e);
    return ""; // Fallback will result in empty board or error text handled by UI
  }
};

export const solveOnBlackboard = async (prompt: string, language: string = 'English'): Promise<LessonPlan> => {
  try {
    let spokenInstruction = "Spoken Language: **English** (Simple, clear, engaging, Indian accent preferred).";
    let addressInstruction = "Students";
    
    if (language === 'Hindi') {
        spokenInstruction = "Spoken Language: **Hinglish** (English + Hindi phrases like 'Dekho beta', 'Samjhe?').";
        addressInstruction = "Beta/Students";
    } else if (language === 'Tamil') {
        spokenInstruction = "Spoken Language: **Tanglish** (English + Tamil phrases like 'Paarunga students', 'Purinjidha?', 'Gavaninga').";
        addressInstruction = "Thambi/Thangachi/Students";
    }

    // 1. Generate the Lesson Plan (Text + Image Prompts)
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            steps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  visualType: {
                    type: Type.STRING,
                    enum: ["html", "image"],
                    description: "Use 'image' for realistic photos OR chalk diagrams. Use 'html' for text/svg explanations."
                  },
                  board: {
                    type: Type.STRING,
                    description: "If 'html': Return HTML/SVG content in ENGLISH. If 'image': Return a prompt description (e.g., 'A chalk diagram of...').",
                  },
                  spoken: {
                    type: Type.STRING,
                    description: "Explanation in the requested Spoken Language. PLAIN TEXT ONLY. NO HTML TAGS.",
                  }
                },
                required: ["visualType", "board", "spoken"]
              }
            }
          },
          required: ["steps"],
        },
        systemInstruction: `You are an Emotional and Caring Indian School Teacher ("Mam").
        
        PERSONA:
        - **Role**: Passionate Indian Science/Math teacher ("Mam").
        - **Tone**: Emotional, human-like, brief, and punchy.
        - ${spokenInstruction}
        - **Board Language**: **STRICT ENGLISH**. All text written on the blackboard must be in English.
        - **Address**: Call users "${addressInstruction}".
        
        CRITICAL RULES FOR CONTENT:
        1. **LENGTH**: You MUST generate a **DETAILED LESSON**. 
           - **MINIMUM STEPS: 8**
           - **MAXIMUM STEPS: 15**
           - Break the concept down into very small, logical parts.
        
        2. **STRICT ALTERNATING PATTERN**: 
           - You MUST alternate between text explanation and image/diagram steps.
           - **Sequence**: 
             Step 1: HTML (Introduction/Concept)
             Step 2: IMAGE (Visual of Step 1)
             Step 3: HTML (Next Point)
             Step 4: IMAGE (Visual of Step 3)
             ...and so on.
           - This is mandatory. Visuals are key.
        
        3. **IMAGES**:
           - Use 'image' for REALISTIC PHOTOS (e.g., "A realistic photo of a tiger").
           - Use 'image' for HAND-DRAWN DIAGRAMS (e.g., "A hand-drawn chalk diagram of a cell").
        
        INTERACTIVITY RULES:
        - DO NOT use <data-tooltip> tags. They are invalid.
        - ONLY use <b data-tooltip="Definition">Term</b> or <span data-tooltip="Definition">Term</span>.
        
        FORMATTING (Board Only): 
        - Use <h1>Pink Title</h1> for main topics.
        - Use <h2>Yellow Subtitle</h2> for key points.
        - Use <i>Cyan Note</i> for extra info.
        - The text inside these tags MUST be English.
        
        SPOKEN TEXT:
        - MUST BE PLAIN TEXT.
        - DO NOT include HTML tags (like <b>, <i>, <h1>) in the 'spoken' field.
        `,
      }
    });
    
    const text = response.text || "{}";
    let cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    // Simple extraction if markdown wraps it
    const firstBrace = cleanText.indexOf('{');
    const lastBrace = cleanText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      cleanText = cleanText.substring(firstBrace, lastBrace + 1);
    }

    let json: LessonPlan;
    try {
      json = JSON.parse(cleanText);
    } catch (e) {
      return {
        steps: [{ board: "<h1>Network Issue</h1>", spoken: "Arre beta, connection toot gaya. Phir se try karte hain.", visualType: 'html' }]
      };
    }

    if (!json.steps || !Array.isArray(json.steps)) {
       return { steps: [] };
    }

    // 2. Post-Process: Generate Images for 'image' steps
    // Process sequentially to avoid rate limits / network errors with multiple concurrent requests
    const processedSteps: LessonStep[] = [];
    
    for (const step of json.steps) {
      if (step.visualType === 'image') {
        try {
            const imageUrl = await generateStepImage(step.board);
            if (imageUrl) {
                processedSteps.push({ ...step, board: imageUrl });
            } else {
                processedSteps.push({ ...step, visualType: 'html', board: "<h1>[Image Unavailable]</h1><p>Visual could not be generated.</p>" });
            }
        } catch (err) {
            console.error("Step visual generation failed", err);
            processedSteps.push({ ...step, visualType: 'html', board: "<h1>[Image Error]</h1>" });
        }
      } else {
        processedSteps.push(step);
      }
    }

    return { steps: processedSteps };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};