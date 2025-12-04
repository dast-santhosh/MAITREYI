import React from 'react';
import { Send, Book, Pencil, Languages } from 'lucide-react';

interface InputTabProps {
  prompt: string;
  setPrompt: (s: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  language: string;
  setLanguage: (l: string) => void;
}

const InputTab: React.FC<InputTabProps> = ({ prompt, setPrompt, onSubmit, loading, language, setLanguage }) => {
  return (
    <div className="w-full h-full bg-[#fefce8] border-r-4 border-slate-300 flex flex-col shadow-2xl relative z-20 font-chalk">
      
      {/* SPIRAL BINDING */}
      <div className="absolute left-0 top-0 bottom-0 w-12 bg-[#292524] flex flex-col items-center py-4 gap-3 z-10 shadow-xl mask-spiral">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="w-8 h-4 rounded-full bg-gray-300 shadow-inner border-2 border-gray-400 rotate-[-5deg]"></div>
        ))}
      </div>

      <div className="pl-14 pr-6 py-4 flex flex-col h-full bg-[url('https://www.transparenttextures.com/patterns/notebook.png')] overflow-y-auto">
        
        {/* Header Badge */}
        <div className="mb-4 transform rotate-[-1deg] shrink-0 mt-4">
          <div className="bg-yellow-300 inline-block px-4 py-2 shadow-md border-2 border-black rounded-sm">
             <h2 className="text-2xl font-black text-black flex items-center gap-2">
                <Book className="text-blue-600" size={24} />
                Class Notes
             </h2>
          </div>
          <div className="mt-1 ml-4">
             <span className="bg-pink-400 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow transform rotate-2 inline-block">Important</span>
             <span className="bg-blue-400 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow transform -rotate-2 inline-block ml-2">Exam Prep</span>
          </div>
        </div>

        {/* Input Area (Lined Paper) */}
        <form onSubmit={onSubmit} className="flex-1 flex flex-col relative mt-2 gap-4 min-h-[300px]">
          
          {/* Language Selector */}
          <div className="relative shrink-0">
             <div className="absolute -top-3 left-2 bg-white px-2 z-10 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <Languages size={10} /> Language
             </div>
             <div className="bg-white border-2 border-slate-300 rounded-lg shadow-sm p-1">
                <select 
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full p-2 bg-yellow-50 font-chalk text-lg focus:outline-none cursor-pointer rounded text-slate-800"
                    style={{ fontFamily: '"Patrick Hand", cursive' }}
                >
                    <option value="English">English (Indian)</option>
                    <option value="Hindi">Hindi (Hinglish)</option>
                    <option value="Tamil">Tamil (Tanglish)</option>
                </select>
             </div>
          </div>

          <div className="flex-1 relative flex flex-col">
            <div className="absolute -top-3 left-4 bg-white px-2 z-10 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Question
            </div>
            
            <div className="flex-1 bg-white border-2 border-blue-200 rounded-lg shadow-sm overflow-hidden relative">
                {/* Blue Lines */}
                <div className="absolute inset-0 pointer-events-none opacity-50" 
                    style={{
                        backgroundImage: "linear-gradient(#bfdbfe 1px, transparent 1px)",
                        backgroundSize: "100% 2.5rem",
                        marginTop: "2.5rem"
                    }}>
                </div>
                {/* Red Margin Line */}
                <div className="absolute left-8 top-0 bottom-0 w-[1px] bg-red-300 z-0"></div>

                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Ask Mam! (e.g., 'Rockets kaise udte hain?', 'Show me a Tiger')"
                    className="w-full h-full p-4 pl-12 bg-transparent resize-none text-slate-800 text-xl leading-[2.5rem] focus:outline-none relative z-10 font-chalk"
                    style={{ fontFamily: '"Patrick Hand", cursive' }}
                />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="shrink-0 w-full bg-yellow-400 hover:bg-yellow-300 text-black font-black py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black active:translate-y-1 active:shadow-none"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-4 border-black/20 border-t-black rounded-full animate-spin"></div>
                <span className="text-xl">Thinking...</span>
              </>
            ) : (
              <>
                <Send size={24} />
                <span className="text-xl">Ask Mam!</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-slate-600 shrink-0 pb-4">
           <h3 className="text-lg font-bold flex items-center justify-center gap-2">
             MAITREYI (मैत्रेयी) 
             <Pencil className="opacity-50" size={18} />
             <span className="text-[10px] font-normal opacity-70">[Beta]</span>
           </h3>
           <p className="text-sm font-semibold mt-1">Sandy Softwares - Santhosh</p>
           <p className="text-[10px] font-sans mt-2 opacity-40">Powered by DeepMind LLM</p>
        </div>
      </div>
    </div>
  );
};

export default InputTab;