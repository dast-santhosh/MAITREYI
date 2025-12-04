import React, { useState } from 'react';
import { LessonPlan } from './types';
import { solveOnBlackboard } from './services/geminiService';
import Blackboard from './components/Blackboard';
import InputTab from './components/InputTab';
import { Menu, X } from 'lucide-react';

const App: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [language, setLanguage] = useState('English');
  
  // State for content
  const [lessonPlan, setLessonPlan] = useState<LessonPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [tabOpen, setTabOpen] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setLessonPlan(null); // Clear previous

    // On mobile, close tab to see result automatically
    if (window.innerWidth < 768) {
        setTabOpen(false);
    }
    
    try {
      const result = await solveOnBlackboard(prompt, language);
      setLessonPlan(result);
    } catch (error) {
      console.error(error);
      setLessonPlan({
          steps: [
              { board: "Error", spoken: "Sorry beta, kuch technical problem hai.", visualType: 'html' }
          ]
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setLessonPlan(null);
    setPrompt('');
    window.speechSynthesis.cancel();
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 relative">
      
      {/* Toggle Sidebar Button (Visible on Desktop too) */}
      <button 
        onClick={() => setTabOpen(!tabOpen)}
        className="absolute top-4 left-4 z-50 bg-white text-slate-900 p-2 rounded-full shadow-lg hover:bg-yellow-100 transition-colors"
        title={tabOpen ? "Close Sidebar" : "Open Sidebar"}
      >
        {tabOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* 
        Layout Grid: 
        Left Column: Input Tab (Collapsible)
      */}
      <div 
        className={`
          fixed md:relative z-40 h-full shadow-2xl flex-shrink-0 transition-all duration-300 ease-in-out overflow-hidden
          ${tabOpen ? 'translate-x-0 w-80 md:w-96' : '-translate-x-full md:translate-x-0 w-0 md:w-0'}
        `}
      >
        <div className="w-80 md:w-96 h-full"> {/* Inner container to maintain width during transition */}
            <InputTab 
              prompt={prompt}
              setPrompt={setPrompt}
              language={language}
              setLanguage={setLanguage}
              onSubmit={handleSubmit}
              loading={loading}
            />
        </div>
      </div>

      {/* 2. Right Column: Blackboard (Flex Grow) */}
      <main className="flex-1 h-full relative min-w-0 bg-slate-900">
        <Blackboard 
          lessonPlan={lessonPlan}
          loading={loading}
          onClear={handleClear}
          language={language}
        />
      </main>

      {/* Overlay for mobile when tab is open */}
      {tabOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-30 backdrop-blur-sm"
          onClick={() => setTabOpen(false)}
        />
      )}
    </div>
  );
};

export default App;