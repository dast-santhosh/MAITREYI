import React, { useEffect, useState, useMemo, useRef } from 'react';
import { LessonPlan } from '../types';
import { RefreshCw, Pause, Play, ZoomIn, ZoomOut, RotateCw, X } from 'lucide-react';

interface BlackboardProps {
  lessonPlan: LessonPlan | null;
  loading: boolean;
  onClear: () => void;
  language: string;
}

interface TooltipData {
    x: number;
    y: number;
    text: string;
}

const Blackboard: React.FC<BlackboardProps> = ({ lessonPlan, loading, onClear, language }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isErasing, setIsErasing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);
  
  // Interaction State
  const [imgScale, setImgScale] = useState(1);
  const [imgRotation, setImgRotation] = useState(0);
  const [activeTooltip, setActiveTooltip] = useState<TooltipData | null>(null);
  
  // Karaoke State
  const [spokenCharCount, setSpokenCharCount] = useState(0);
  
  const currentStep = lessonPlan?.steps[currentStepIndex];

  // TTS State
  const synth = window.speechSynthesis;
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    const updateVoices = () => {
      const available = synth.getVoices();
      setVoices(available);
    };
    updateVoices();
    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = updateVoices;
    }
  }, [synth]);

  // Voice Selection: Prioritize Female Indian voices
  const getInstructorVoice = () => {
    // 1. Specific Indian Female voices (e.g. Microsoft Heera on Edge)
    const indianFemale = voices.find(v => (v.lang === 'hi-IN' || v.lang === 'en-IN') && v.name.includes('Female'));
    if (indianFemale) return indianFemale;

    // 2. Hindi India (Almost always Google Hindi which is Female and has good accent)
    const hindiVoice = voices.find(v => v.lang === 'hi-IN');
    if (hindiVoice) return hindiVoice;

    // 3. Fallback: English India (Usually female too)
    const indianEnglish = voices.find(v => v.lang === 'en-IN');
    if (indianEnglish) return indianEnglish;

    // 4. Global Fallback
    return voices[0];
  };

  useEffect(() => {
    if (lessonPlan) {
      setCurrentStepIndex(0);
      setIsErasing(false);
      setIsPlaying(false);
      setSpokenCharCount(0);
      setActiveTooltip(null);
      resetImageTransforms();
      synth.cancel();
      if (autoPlay) {
         playStep(0);
      }
    }
  }, [lessonPlan]);

  const resetImageTransforms = () => {
      setImgScale(1);
      setImgRotation(0);
  };

  // Utility to clean text for speech
  const stripHtml = (html: string) => {
      return html.replace(/<[^>]*>?/gm, '');
  };

  const playStep = (index: number) => {
    if (!lessonPlan || !lessonPlan.steps[index]) return;
    
    setIsPlaying(true);
    setIsErasing(false);
    setSpokenCharCount(0);
    setActiveTooltip(null);
    resetImageTransforms();

    // Safety: Strip any HTML tags that might have leaked into 'spoken'
    const textToSpeak = stripHtml(lessonPlan.steps[index].spoken);
    
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utteranceRef.current = utterance;
    
    const voice = getInstructorVoice();
    if (voice) {
        utterance.voice = voice;
        utterance.pitch = 1.0; 
    }

    utterance.rate = 1.0; 

    // Karaoke Sync Event
    utterance.onboundary = (event) => {
        if (event.name === 'word' || event.name === 'sentence') {
            setSpokenCharCount(event.charIndex + (event.charLength || 0));
        }
    };

    utterance.onend = () => {
      setSpokenCharCount(textToSpeak.length); // Ensure full completion
      if (index < lessonPlan.steps.length - 1) {
        triggerNextStep(index + 1);
      } else {
        setIsPlaying(false);
      }
    };
    
    utterance.onerror = () => {
        setIsPlaying(false);
    };

    synth.cancel();
    synth.speak(utterance);
  };

  const triggerNextStep = (nextIndex: number) => {
     setIsErasing(true);
     setTimeout(() => {
        setCurrentStepIndex(nextIndex);
        playStep(nextIndex);
     }, 1500);
  };

  const handleReplay = () => {
    playStep(currentStepIndex);
  };

  const toggleAutoPlay = () => {
      setAutoPlay(!autoPlay);
      if (isPlaying) {
          synth.cancel();
          setIsPlaying(false);
      } else {
          playStep(currentStepIndex);
      }
  }

  // Interaction Handlers
  const handleBoardClick = (e: React.MouseEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement;
      // Check for data-tooltip on target or closest parent (for svg paths)
      const trigger = target.closest('[data-tooltip]');
      
      if (trigger) {
          const text = trigger.getAttribute('data-tooltip');
          if (text) {
              // Calculate relative position within the board
              const rect = trigger.getBoundingClientRect();
              const boardRect = e.currentTarget.getBoundingClientRect();
              
              setActiveTooltip({
                  x: rect.left - boardRect.left + (rect.width / 2),
                  y: rect.top - boardRect.top,
                  text
              });
              return;
          }
      }
      // Click elsewhere closes tooltip
      setActiveTooltip(null);
  };

  // Determine if current content is an image
  const isImage = useMemo(() => {
      if (!currentStep) return false;
      return currentStep.visualType === 'image' || currentStep.board.startsWith('data:');
  }, [currentStep]);

  // Content Parser
  const parsedContent = useMemo(() => {
    if (!currentStep?.board || isImage) return null;

    let html = currentStep.board;
    // Keep SVGs but sanitize other tags if needed. 
    return { __html: html };
  }, [currentStep, isImage]);


  // Subtitle Renderer (Sentence by Sentence)
  const renderSubtitles = () => {
      if (!currentStep) return null;
      
      // Safety: Strip HTML for subtitles too
      const fullText = stripHtml(currentStep.spoken);
      
      // Split text into smaller chunks (clauses) for shorter subtitles on mobile
      const chunks = fullText.match(/[^.!?,\n:;]+[.!?,\n:;]+['"]?|[^.!?,\n:;]+$/g) || [fullText];
      
      let currentChunk = "";
      let accumulatedLength = 0;

      for (const chunk of chunks) {
          if (spokenCharCount >= accumulatedLength && spokenCharCount < (accumulatedLength + chunk.length)) {
              currentChunk = chunk;
              break;
          }
          accumulatedLength += chunk.length;
      }

      // Fallback if finished but calculation drifts slightly
      if (!currentChunk && spokenCharCount >= fullText.length) {
          currentChunk = chunks[chunks.length - 1];
      }
      // Fallback for beginning
      if (!currentChunk) currentChunk = chunks[0];

      return (
          <p className="text-sm md:text-lg font-bold leading-relaxed font-sans text-center transition-all duration-300">
              <span className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] bg-black/40 px-2 py-1 rounded box-decoration-clone">
                  {currentChunk.trim()}
              </span>
          </p>
      );
  };

  return (
    <div className="relative w-full h-full p-2 md:p-6 flex flex-col bg-slate-900">
      <style>{`
        .board-content h1 {
            color: #f472b6; /* Pink */
            font-size: 3rem;
            line-height: 1.1;
            font-weight: bold;
            margin-bottom: 0.5rem;
            letter-spacing: 0.05em;
            text-shadow: 2px 2px 0px rgba(0,0,0,0.5);
        }
        .board-content h2 {
            color: #facc15; /* Yellow */
            font-size: 2.25rem;
            line-height: 1.2;
            font-weight: bold;
            margin-bottom: 0.5rem;
        }
        .board-content b {
            color: #fde047; /* Bright Yellow */
            font-weight: 900;
        }
        .board-content i {
            color: #67e8f9; /* Cyan */
            font-style: normal;
            font-family: 'Inter', sans-serif; /* Contrast font for 'notes' */
            font-size: 0.8em;
            background: rgba(255,255,255,0.1);
            padding: 2px 6px;
            border-radius: 4px;
        }
        /* Styles for text/element tooltips */
        .board-content span[data-tooltip], .board-content b[data-tooltip] {
            cursor: pointer;
            border-bottom: 2px dashed rgba(253, 224, 71, 0.7);
            position: relative;
        }
        .board-content span[data-tooltip]:hover, .board-content b[data-tooltip]:hover {
            background: rgba(253, 224, 71, 0.2);
            color: #fef08a;
        }

        /* Chalk SVG Styles */
        .board-content svg {
            stroke: white;
            stroke-width: 2;
            fill: none;
            stroke-linecap: round;
            stroke-linejoin: round;
            filter: drop-shadow(0 0 2px rgba(255,255,255,0.5));
            margin: 0 auto;
            max-height: 300px;
            width: 100%;
            overflow: visible;
        }
        .board-content path {
            stroke-dasharray: 1000;
            stroke-dashoffset: 0;
            animation: dash 3s linear forwards;
            pointer-events: visibleStroke;
        }
        /* Interactive SVG Paths */
        .board-content svg [data-tooltip] {
            cursor: pointer;
            transition: stroke 0.2s, stroke-width 0.2s;
            pointer-events: all; 
        }
        .board-content svg [data-tooltip]:hover {
            stroke: #facc15 !important;
            stroke-width: 4;
            filter: drop-shadow(0 0 5px #facc15);
        }
        
        @keyframes dash {
            from { stroke-dashoffset: 1000; opacity: 0; }
            to { stroke-dashoffset: 0; opacity: 1; }
        }
        @media (max-width: 768px) {
            .board-content h1 { font-size: 2rem; }
            .board-content h2 { font-size: 1.5rem; }
        }
      `}</style>
      
      {/* WOOD FRAME */}
      <div className="flex-1 rounded-xl border-[16px] border-[#5d4037] shadow-2xl relative overflow-hidden bg-[#1e2923] flex flex-col box-border">
        
        {/* Chalk Texture */}
        <div className="absolute inset-0 opacity-30 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] z-0"></div>
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/dust.png')] z-0"></div>

        {/* Top Tray */}
        <div className="absolute top-0 left-0 right-0 h-10 bg-black/20 z-10 flex justify-between items-center px-4">
             <div className="flex items-center gap-2 text-white/50 font-mono text-xs uppercase tracking-wider">
                <span>Step: {currentStepIndex + 1} / {lessonPlan?.steps.length || '?'}</span>
                {isPlaying && <span className="animate-pulse text-red-400 font-bold">• ON AIR</span>}
             </div>
             <div className="flex gap-2">
                 <button onClick={toggleAutoPlay} className="text-white/40 hover:text-white transition">
                     {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                 </button>
             </div>
        </div>

        {/* MAIN BOARD AREA */}
        <div 
            className="flex-1 flex items-center justify-center relative z-0 p-8 overflow-hidden"
            onClick={handleBoardClick} // Click Delegation
        >
            {/* Tooltip Popup (Sticky Note) */}
            {activeTooltip && (
                <div 
                    className="absolute z-50 bg-yellow-200 text-black p-4 shadow-[5px_5px_10px_rgba(0,0,0,0.5)] rotate-[-2deg] max-w-[200px] animate-in fade-in zoom-in duration-200"
                    style={{ 
                        left: activeTooltip.x, 
                        top: activeTooltip.y - 10, 
                        transform: 'translate(-50%, -100%) rotate(-2deg)' 
                    }}
                    onClick={(e) => { e.stopPropagation(); setActiveTooltip(null); }}
                >
                    <div className="w-2 h-2 rounded-full bg-red-400 opacity-50 absolute top-[-5px] left-[50%] ml-[-4px] shadow-sm"></div>
                    <p className="font-chalk text-lg leading-tight">{activeTooltip.text}</p>
                </div>
            )}

            {loading ? (
                <div className="text-center">
                    <div className="inline-block w-16 h-16 border-4 border-white/20 border-t-yellow-400 rounded-full animate-spin mb-4"></div>
                    <p className="font-chalk text-2xl text-yellow-200 animate-pulse">Thinking...</p>
                </div>
            ) : !currentStep ? (
                <div className="text-center opacity-40 select-none">
                    <h1 className="font-chalk text-7xl text-white mb-2 rotate-[-2deg]">Class is Open!</h1>
                    <p className="font-chalk text-2xl text-white/80">Ask a question to start.</p>
                </div>
            ) : (
                <div 
                    className={`transition-all duration-1000 ease-in-out w-full h-full flex items-center justify-center ${
                        isErasing ? 'opacity-0 blur-lg scale-95' : 'opacity-100 blur-0 scale-100'
                    }`}
                >
                    {isImage ? (
                        <div className="relative group">
                            {/* Image Controls */}
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur rounded-full px-4 py-2 flex gap-4 text-white opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                <button onClick={() => setImgScale(s => Math.min(s + 0.2, 3))} className="hover:text-yellow-400"><ZoomIn size={20} /></button>
                                <button onClick={() => setImgScale(s => Math.max(s - 0.2, 0.5))} className="hover:text-yellow-400"><ZoomOut size={20} /></button>
                                <button onClick={() => setImgRotation(r => r + 90)} className="hover:text-yellow-400"><RotateCw size={20} /></button>
                                <button onClick={resetImageTransforms} className="hover:text-red-400"><X size={20} /></button>
                            </div>
                            <img 
                                src={currentStep.board} 
                                alt="Board Diagram" 
                                className="max-h-[60vh] rounded shadow-lg border-2 border-white/20 bg-black/20 transition-transform duration-300"
                                style={{ transform: `scale(${imgScale}) rotate(${imgRotation}deg)` }}
                            />
                        </div>
                    ) : (
                        <div 
                            className="board-content font-chalk text-white leading-relaxed text-4xl md:text-5xl text-center w-full"
                            dangerouslySetInnerHTML={parsedContent!}
                        />
                    )}
                </div>
            )}
        </div>

        {/* SUBTITLE OVERLAY */}
        {currentStep && !loading && (
            <div className={`absolute bottom-2 left-2 right-2 md:bottom-6 md:left-6 md:right-6 transition-opacity duration-500 z-10 ${isErasing ? 'opacity-0' : 'opacity-100'}`}>
                <div className="bg-black/60 backdrop-blur-md rounded-xl p-2 md:p-4 shadow-2xl border border-white/10 flex flex-col items-center">
                    <div className="flex gap-4 items-center w-full">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-yellow-500 border-2 border-yellow-300 flex items-center justify-center shrink-0 shadow-lg animate-bounce">
                            <span className="text-black font-black text-sm md:text-lg">I</span>
                        </div>
                        <div className="flex-1 text-center min-w-0">
                            <h4 className="text-yellow-400 text-[10px] font-bold uppercase tracking-widest mb-1 opacity-50">Mam's Note</h4>
                            {renderSubtitles()}
                        </div>
                        <button onClick={handleReplay} className="text-white/30 hover:text-white transition shrink-0">
                            <RefreshCw size={18} />
                        </button>
                    </div>
                </div>
            </div>
        )}

      </div>
      
      {/* Chalk Tray */}
      <div className="h-4 mx-8 bg-[#6d4c41] rounded-b-lg shadow-lg relative z-10 flex justify-center gap-12">
           <div className="w-20 h-2 bg-white rounded-full opacity-80 mt-1 shadow-sm"></div>
           <div className="w-20 h-2 bg-yellow-200 rounded-full opacity-80 mt-1 shadow-sm rotate-1"></div>
           <div className="w-20 h-2 bg-pink-300 rounded-full opacity-80 mt-1 shadow-sm -rotate-1"></div>
      </div>
    </div>
  );
};

export default Blackboard;