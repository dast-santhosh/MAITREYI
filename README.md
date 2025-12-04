# 🕉️ Maitreyi - The AI Teacher

<div align="center">

  <a href="https://ibb.co/Q77tGnC5">
    <img src="https://i.ibb.co/Q77tGnC5/Gemini-Generated-Image-2l7jmq2l7jmq2l7j.png" alt="Maitreyi Logo" width="250">
  </a>

  <br />
  <br />

  **An Immersive, Multimodal Virtual Classroom**
  
  *Bridging the gap between asking a question and truly understanding the concept.*

  [Demo Link] • [Report Bug] • [Request Feature]
</div>

---

## 📖 What is Maitreyi?

**Maitreyi** is not just a chatbot; it is a reimagining of the traditional Indian classroom experience using cutting-edge Generative AI. 

Designed by **Sandy Softwares (Santhosh)**, this app ensures that high-quality, interactive, and emotionally resonant tutoring is available to anyone with an internet connection. It bridges the gap between raw information and deep understanding through sight, sound, and emotional connection.

---

## ❤️ The "Soul": The Persona

Unlike generic AI assistants that sound robotic, Maitreyi possesses a distinct, warm personality:

* **👩‍🏫 The "Mam" Persona:** She acts as an emotional, caring, and passionate Indian school teacher.
* **🗣️ Local Connection:** She speaks the language of the student. Whether it's **Hinglish** (Hindi + English) or **Tanglish** (Tamil + English), she uses familiar phrases like *"Dekho beta"* (Look here, child) or *"Purinjidha?"* (Understood?) to build rapport.
* **🎙️ The Voice:** Utilizing Indian-accented Text-to-Speech, the auditory experience feels familiar, homegrown, and comforting.

---

## 🧠 The "Brain": The Technology

Maitreyi is a marvel of client-side engineering, powered by Google's most advanced models.

* **⚡ Powered by DeepMind:** The core logic runs on DeepMind.
* **🎨 Multimodal Logic:** It doesn't just output text. It "thinks" in educational steps:
    * Writes explanations on the board (HTML/SVG).
    * Creates **Hand-Drawn Diagrams** or **Realistic Images** on the fly (Gemini Image Generation).
* **🌐 Serverless Architecture:** The entire app runs in your browser using **React + Vite**. It communicates directly with Google's API, ensuring privacy and speed without heavy backend infrastructure.

---

## 🚀 The "Experience": Key Features

### 1. The Blackboard UI
A nostalgic, dark-textured interface where text appears in neon chalk colors (Pink, Yellow, Cyan). It brings the feel of a physical classroom to the digital screen.

### 2. Dynamic Visuals
The lesson flow strictly alternates between Text and Images to maintain engagement.
> *Example:* You see a definition of a rocket ➡️ followed immediately by a generated image of a rocket launching.

### 3. Karaoke Subtitles
As "Mam" speaks, the subtitles highlight word-by-word (or clause-by-clause), mimicking a real-time lecture and aiding in reading comprehension.

### 4. Deep Interactivity
* **Zoom & Rotate:** Interact with generated diagrams.
* **Sticky Notes:** Click on specific terms to generate instant, deep-dive definitions without leaving the flow of the lesson.

---

## 🛠️ Tech Stack

* **Frontend Framework:** React.js
* **Build Tool:** Vite
* **AI Model:** Google Gemini 2.5 Flash
* **Styling:** CSS3 (Custom Blackboard Aesthetic)
* **Speech:** Web Speech API / Custom TTS Integration

---

## 💻 Installation & Setup

Follow these steps to run Maitreyi locally on your machine.

### Prerequisites
* Node.js (v18 or higher)
* npm or yarn
* A Google Gemini API Key

### Steps

1.  **Clone the Repository**
    ```bash
    git clone [https://github.com/your-username/maitreyi-ai-teacher.git](https://github.com/your-username/maitreyi-ai-teacher.git)
    cd maitreyi-ai-teacher
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory and add your API key:
    ```env
    VITE_GEMINI_API_KEY=your_actual_google_api_key_here
    ```

4.  **Run the App**
    ```bash
    npm run dev
    ```
    Open your browser and navigate to `http://localhost:5173` (or the port shown in your terminal).

---

## 🔮 Future Roadmap

- [ ] Support for more Indian regional languages (Telugu, Bengali, Marathi).
- [ ] "Homework" mode: AI generates quizzes based on the taught session.
- [ ] Voice Input: Students can speak their questions instead of typing.
- [ ] Save Session: Ability to download the "Blackboard" as a PDF.

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">

  **Created with ❤️ by Sandy Softwares (Santhosh)**
  
  *Empowering education through AI.*

</div>
