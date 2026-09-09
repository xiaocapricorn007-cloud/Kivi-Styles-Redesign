import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Terminal, Briefcase, MessageCircle, Mail, ChevronRight, ChevronLeft, Check, Compass, Globe, Sparkles, Plus, ChevronUp, ChevronDown } from 'lucide-react';

interface TutorialProps {
  onComplete: () => void;
}

export default function Tutorial({ onComplete }: TutorialProps) {
  const [slide, setSlide] = useState(0);
  const totalSlides = 10;

  const nextSlide = useCallback(() => {
    if (slide < totalSlides - 1) {
      setSlide(s => s + 1);
    }
  }, [slide, totalSlides]);

  const prevSlide = useCallback(() => {
    if (slide > 0) {
      setSlide(s => s - 1);
    }
  }, [slide]);

  // Global Keyboard navigation: Left/Right Arrow, Space, Enter, Backspace, Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return;
      }

      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (slide < totalSlides - 1) {
          nextSlide();
        } else if (e.key === 'Enter' || e.key === ' ') {
          onComplete();
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'Backspace') {
        e.preventDefault();
        prevSlide();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onComplete();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [slide, totalSlides, nextSlide, prevSlide, onComplete]);

  const tutorialContent = (
    <div className="fixed inset-0 z-[9999] bg-[#f4ece1] text-[#3e2723] flex flex-col justify-between overflow-hidden font-sans">
      {/* Top Bar */}
      <div className="flex justify-between items-center p-8 z-10">
        <button 
          onClick={onComplete}
          className="text-[#3e2723]/60 hover:text-[#3e2723] font-mono text-sm tracking-widest border-b-2 border-transparent hover:border-[#8d6e63] transition-all pb-1 flex items-center gap-1.5"
          title="Skip tutorial (Esc)"
        >
          <span>skip</span>
          <span className="text-[10px] opacity-60 font-sans">[Esc]</span>
        </button>

        {/* Keyboard navigation hint */}
        <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-[#3e2723]/50 bg-[#3e2723]/5 px-3.5 py-1.5 rounded-full border border-[#3e2723]/10 shadow-xs">
          <span>Navigate with</span>
          <kbd className="px-1.5 py-0.5 bg-white rounded border border-[#3e2723]/20 shadow-xs text-[#3e2723] font-bold">←</kbd>
          <kbd className="px-1.5 py-0.5 bg-white rounded border border-[#3e2723]/20 shadow-xs text-[#3e2723] font-bold">→</kbd>
          <span>or</span>
          <kbd className="px-1.5 py-0.5 bg-white rounded border border-[#3e2723]/20 shadow-xs text-[#3e2723] font-bold">Space</kbd>
        </div>

        <div className="text-[#3e2723]/60 font-mono text-sm tracking-widest">
          {String(slide + 1).padStart(2, '0')} / {String(totalSlides).padStart(2, '0')}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex flex-col items-center w-full max-w-5xl"
          >
            {renderSlideContent(slide, onComplete)}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Controls */}
      <div className="absolute inset-y-0 left-0 w-32 flex items-center justify-center z-20 pointer-events-none">
        {slide > 0 && (
          <button 
            onClick={prevSlide}
            className="pointer-events-auto p-4 text-[#3e2723]/40 hover:text-[#8d6e63] transition-all flex flex-col items-center gap-1 group cursor-pointer"
            title="Previous slide (← or Backspace)"
          >
            <ChevronLeft size={48} strokeWidth={1} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[11px] font-mono tracking-wider opacity-60 group-hover:opacity-100 transition-opacity bg-white/70 px-2 py-0.5 rounded-md border border-[#3e2723]/10 shadow-xs">
              ← Left
            </span>
          </button>
        )}
      </div>
      <div className="absolute inset-y-0 right-0 w-32 flex items-center justify-center z-20 pointer-events-none">
        {slide < totalSlides - 1 && (
          <button 
            onClick={nextSlide}
            className="pointer-events-auto p-4 text-[#3e2723]/40 hover:text-[#8d6e63] transition-all flex flex-col items-center gap-1 group cursor-pointer"
            title="Next slide (→, Space, or Enter)"
          >
            <ChevronRight size={48} strokeWidth={1} className="group-hover:translate-x-1 transition-transform" />
            <span className="text-[11px] font-mono tracking-wider opacity-60 group-hover:opacity-100 transition-opacity bg-white/70 px-2 py-0.5 rounded-md border border-[#3e2723]/10 shadow-xs">
              Right →
            </span>
          </button>
        )}
      </div>

      {/* Progress Dots */}
      <div className="flex justify-center gap-3 pb-12 z-10">
        {Array.from({ length: totalSlides }).map((_, i) => (
          <div 
            key={i} 
            className={`h-1 rounded-full transition-all duration-500 ${
              i === slide ? 'w-8 bg-[#8d6e63]' : 'w-2 bg-[#3e2723]/20'
            }`}
          />
        ))}
      </div>
    </div>
  );

  return createPortal(tutorialContent, document.body);
}

function renderSlideContent(index: number, onComplete: () => void) {
  switch (index) {
    case 0:
      return (
        <div className="flex flex-col items-start justify-center -mt-8 max-w-4xl text-left">
          <h1 className="text-7xl font-serif font-medium tracking-tight mb-8">
            Meet <span className="relative z-10 before:content-[''] before:absolute before:inset-x-0 before:bottom-2 before:h-4 before:bg-[#d7ccc8] before:-z-10">WhisPURR.</span>
          </h1>
          <div className="border-l-4 border-[#8d6e63]/30 pl-8 ml-2">
            <p className="text-3xl text-[#3e2723] font-serif italic mb-6">
              Your thoughts, seamlessly translated into work.
            </p>
            <p className="text-xl text-[#3e2723]/70 font-sans mb-6 leading-relaxed">
              WhisPURR stays quietly in the background as you move between modes. Speak naturally, and it adapts your words to where you are.
            </p>
            <p className="text-2xl text-[#3e2723] font-serif font-bold italic">
              Fast. Flexible. Quietly there.
            </p>
          </div>
          <div className="mt-16 self-center w-32 h-32 rounded-full flex items-center justify-center shadow-[0_0_80px_rgba(141,110,99,0.3)] overflow-hidden border-4 border-[#3e2723]">
            <img src="/kivi_icon.png" className="w-full h-full object-cover" />
          </div>
        </div>
      );
    case 1:
      return (
        <div className="flex flex-col items-center justify-center -mt-16 text-center">
          <h1 className="text-7xl font-serif font-medium tracking-tight mb-6 flex items-center gap-4">
            Hold <span className="px-5 py-2 bg-[#a1887f] text-[#f4ece1] rounded-2xl text-5xl font-sans font-bold shadow-md">Alt</span> to Speak.
          </h1>
          <p className="text-2xl text-[#3e2723]/60 font-serif italic mb-12 max-w-2xl">
            - press and hold to speak. WhisPURR opens a bottom floating dialogue, transcribing in real-time, and automatically types directly into your active app or lets you copy.
          </p>
          <div className="flex items-center justify-center w-28 h-28 rounded-full bg-white border border-[#3e2723]/10 mb-6 shadow-xl">
            <Mic size={44} className="text-[#8d6e63] animate-pulse" />
          </div>
          <div className="px-8 py-3.5 bg-white rounded-2xl border border-[#3e2723]/20 shadow-md text-[#3e2723]/70 font-mono text-sm">
            Press and hold <strong className="text-[#3e2723]">Alt / Option</strong> anywhere on your desktop
          </div>
        </div>
      );
    case 2:
      return <RadialDialsDemoSlide />;
    case 3:
      return (
        <div className="flex flex-col items-center justify-center -mt-12 text-center">
          <h1 className="text-6xl font-serif font-medium tracking-tight mb-4">Pick Your <span className="relative z-10 before:content-[''] before:absolute before:inset-x-0 before:bottom-2 before:h-4 before:bg-[#d7ccc8] before:-z-10">Paws.</span></h1>
          <p className="text-2xl text-[#3e2723]/60 font-serif italic mb-14 max-w-2xl">
            - customize the shortcuts you'll use to trigger dictation and radial dials every day.
          </p>
          <p className="text-xs font-bold text-[#3e2723]/40 uppercase tracking-widest mb-6">Active desktop shortcuts</p>
          <div className="flex flex-wrap gap-6 justify-center">
            <div className="px-8 py-6 bg-[#8d6e63]/10 border-2 border-[#8d6e63] rounded-3xl flex flex-col items-center cursor-pointer hover:bg-[#8d6e63]/20 transition-colors shadow-md">
              <span className="text-sm opacity-60 mb-2 font-serif italic">Hold to Talk</span>
              <span className="text-3xl font-sans font-bold text-[#3e2723]">Alt</span>
            </div>
            <div className="px-8 py-6 bg-white border-2 border-[#3e2723]/10 rounded-3xl flex flex-col items-center cursor-pointer hover:border-[#3e2723]/30 transition-colors">
              <span className="text-sm opacity-60 mb-2 font-serif italic">Mode Dial</span>
              <span className="text-3xl font-sans font-bold text-[#3e2723]/70">Alt + Scroll</span>
            </div>
            <div className="px-8 py-6 bg-white border-2 border-[#3e2723]/10 rounded-3xl flex flex-col items-center cursor-pointer hover:border-[#3e2723]/30 transition-colors">
              <span className="text-sm opacity-60 mb-2 font-serif italic">Language Dial</span>
              <span className="text-3xl font-sans font-bold text-[#3e2723]/70">Alt + Right Click</span>
            </div>
          </div>
        </div>
      );
    case 4:
      return (
        <div className="flex flex-col items-center justify-center -mt-12 text-center">
          <h1 className="text-6xl font-serif font-medium tracking-tight mb-4">Shape Your <span className="relative z-10 before:content-[''] before:absolute before:inset-x-0 before:bottom-2 before:h-4 before:bg-[#d7ccc8] before:-z-10">Companion.</span></h1>
          <p className="text-2xl text-[#3e2723]/60 font-serif italic mb-16 max-w-2xl">
            - choose how WhisPURR visually anchors to your screen while you work.
          </p>
          <p className="text-sm font-bold text-[#3e2723]/40 uppercase tracking-widest mb-8">Click the form you'd like to keep on screen.</p>
          <div className="flex gap-6">
            {['Orb', 'Mini', 'Pill'].map((opt, i) => (
              <div key={i} className={`w-40 h-40 rounded-[2.5rem] border-2 flex flex-col items-center justify-center cursor-pointer transition-all ${i === 0 ? 'border-[#8d6e63] bg-[#8d6e63]/10 text-[#3e2723] shadow-lg scale-105' : 'border-[#3e2723]/10 bg-white text-[#3e2723]/60 hover:border-[#3e2723]/30'}`}>
                <span className="text-2xl font-bold">{opt}</span>
              </div>
            ))}
          </div>
        </div>
      );
    case 5:
      return <SurveySlide title="Developer Blueprints." icon={<Terminal size={32} />} subtext="Pick how WhisPURR structures your technical prompts and terminal commands." options={[
        { n: 'Clear', d: 'The full instruction, plainly.' },
        { n: 'Concise', d: 'The fewest words possible.' },
        { n: 'Structured', d: 'Goal, changes, validation.' }
      ]} />;
    case 6:
      return <SurveySlide title="Chat Registers." icon={<MessageCircle size={32} />} subtext="Choose how WhisPURR adapts your voice for fast-twitch channels like Slack or Teams." options={[
        { n: 'Clear', d: 'Clean sentences; shorthand kept.' },
        { n: 'Casual', d: 'Lowercase workplace shorthand.' },
        { n: 'Formal', d: 'Everything spelled out properly.' }
      ]} />;
    case 7:
      return <SurveySlide title="Inbox Registers." icon={<Mail size={32} />} subtext="Set the baseline tone WhisPURR uses to draft high-context emails." options={[
        { n: 'Professional', d: 'Conventional and to the point.' },
        { n: 'Friendly', d: 'The same note, with warmth.' },
        { n: 'Formal', d: 'Highest formality, full forms.' }
      ]} />;
    case 8:
      return <SurveySlide title="Global Modes." icon={<Briefcase size={32} />} subtext="Pick WhisPURR's default structural baseline when prowling through other applications." options={[
        { n: 'Balanced', d: 'Cleaned, but still your voice.' },
        { n: 'Minimal', d: 'Compressed to fragments.' },
        { n: 'Polished', d: 'Composed, complete sentences.' }
      ]} />;
    case 9:
      return (
        <div className="flex flex-col items-center justify-center -mt-16 text-center">
          <h1 className="text-7xl font-serif font-medium tracking-tight mb-6 text-[#3e2723]">You're Ready to <span className="relative z-10 before:content-[''] before:absolute before:inset-x-0 before:bottom-2 before:h-4 before:bg-[#d7ccc8] before:-z-10">Pounce.</span></h1>
          <p className="text-3xl text-[#3e2723]/60 font-serif italic mb-20 max-w-2xl">
            - I'll be resting quietly at the bottom of your screen. Just hold your shortcut and speak.
          </p>
          <button 
            onClick={onComplete}
            className="px-10 py-5 bg-[#8d6e63] hover:bg-[#795548] text-[#f4ece1] font-bold rounded-2xl flex items-center gap-4 transition-all hover:scale-105 text-2xl shadow-xl hover:shadow-2xl cursor-pointer"
          >
            <img src="/kivi_icon.png" className="w-8 h-8 rounded-full shadow-sm" alt="Icon" />
            <span>Launch WhisPURR</span>
            <span className="text-sm opacity-60 font-mono font-normal bg-black/10 px-2 py-1 rounded-lg ml-1">[Enter ↵]</span>
          </button>
        </div>
      );
    default:
      return null;
  }
}

function SurveySlide({ title, icon, subtext, options }: { title: string, icon: React.ReactNode, subtext: string, options: { n: string, d: string }[] }) {
  const [selected, setSelected] = useState(0);
  
  return (
    <div className="flex flex-col items-center w-full text-center -mt-8">
      <div className="flex items-center gap-4 mb-4">
        <span className="text-[#3e2723]/40">{icon}</span>
        <h2 className="text-2xl font-mono text-[#3e2723]/40 tracking-tight">modes survey.</h2>
      </div>
      <h1 className="text-6xl font-serif font-medium tracking-tight mb-6">{title}</h1>
      <p className="text-2xl text-[#3e2723]/70 font-serif italic mb-16 max-w-3xl">- {subtext}</p>
      
      <div className="flex gap-6 w-full justify-center">
        {options.map((opt, i) => (
          <div 
            key={i} 
            onClick={() => setSelected(i)}
            className={`relative w-72 h-64 rounded-3xl border-2 p-8 cursor-pointer transition-all flex flex-col justify-end ${
              selected === i 
                ? 'border-[#8d6e63] bg-[#8d6e63]/10 text-[#3e2723] scale-105 shadow-xl z-10' 
                : 'border-[#3e2723]/10 bg-white text-[#3e2723]/70 hover:border-[#3e2723]/30 hover:shadow-md'
            }`}
          >
            {selected === i && (
              <div className="absolute -top-4 -right-4 w-10 h-10 bg-[#8d6e63] rounded-full flex items-center justify-center text-[#f4ece1] shadow-lg">
                <Check size={24} strokeWidth={3} />
              </div>
            )}
            <div className="flex-1 bg-[#f4ece1] rounded-2xl mb-6 p-5 border border-[#3e2723]/5 flex flex-col justify-center shadow-inner">
              <div className="w-12 h-2 bg-[#3e2723]/10 rounded-full mb-4"></div>
              <div className="w-full h-2 bg-[#3e2723]/20 rounded-full mb-3"></div>
              <div className="w-3/4 h-2 bg-[#3e2723]/20 rounded-full"></div>
            </div>
            <h3 className="text-2xl font-bold mb-2 font-sans">{opt.n}</h3>
            <p className="text-base opacity-80 font-serif italic leading-snug">{opt.d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function RadialDialsDemoSlide() {
  const [activeDial, setActiveDial] = useState<0 | 1>(0); // 0: Modes (right arc), 1: Languages (left arc)
  const [modeRotation, setModeRotation] = useState(0);
  const [langRotation, setLangRotation] = useState(0);

  const [moodsEnabled, setMoodsEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('whispurr_moods') === 'true';
    } catch (e) {
      return false;
    }
  });

  useEffect(() => {
    const handleMoodsChanged = (e: Event) => {
      const custom = e as CustomEvent;
      if (custom.detail && typeof custom.detail.enabled === 'boolean') {
        setMoodsEnabled(custom.detail.enabled);
      } else {
        try {
          setMoodsEnabled(localStorage.getItem('whispurr_moods') === 'true');
        } catch {}
      }
    };
    window.addEventListener('whispurr_moods_changed', handleMoodsChanged);
    return () => window.removeEventListener('whispurr_moods_changed', handleMoodsChanged);
  }, []);

  const toggleMoods = () => {
    const next = !moodsEnabled;
    setMoodsEnabled(next);
    try {
      localStorage.setItem('whispurr_moods', String(next));
      window.dispatchEvent(new CustomEvent('whispurr_moods_changed', { detail: { enabled: next } }));
    } catch (e) {}
  };

  const MODE_EMOJIS: Record<string, string> = {
    Formal: '🤝',
    Casual: '☕',
    Developer: '💻',
    Prompts: '🤖',
    'Other apps': '📂',
    Academic: '🎓',
    Concise: '⚡',
    Warm: '💖'
  };

  const MODE_SAMPLES: Record<string, { plain: string; mood: string }> = {
    Formal: {
      plain: "Let's align our deliverables by next Tuesday.",
      mood: "Let's align our deliverables by next Tuesday. 🤝📅"
    },
    Casual: {
      plain: "Hey, sounds awesome, count me in!",
      mood: "Hey, sounds awesome, count me in! 🙌✨"
    },
    Developer: {
      plain: "Refactored the async hook and merged the PR.",
      mood: "Refactored the async hook and merged the PR. 🚀💻"
    },
    Prompts: {
      plain: "Act as a senior system architect and evaluate trade-offs.",
      mood: "Act as a senior system architect and evaluate trade-offs. 🧠🤖"
    },
    'Other apps': {
      plain: "Pasted formatted summary into Notion notes.",
      mood: "Pasted formatted summary into Notion notes. 📂✨"
    },
    Academic: {
      plain: "Empirical analysis demonstrates statistically significant variance.",
      mood: "Empirical analysis demonstrates statistically significant variance. 📚🎓"
    },
    Concise: {
      plain: "Done. Fixed bug in auth flow.",
      mood: "Done. Fixed bug in auth flow. 👍"
    },
    Warm: {
      plain: "Thank you so much for your thoughtful feedback, really appreciate it!",
      mood: "Thank you so much for your thoughtful feedback, really appreciate it! 💖🌸"
    }
  };

  const LANG_SAMPLES: Record<string, string> = {
    AutoDetect: 'Auto-detecting your spoken language in real-time... 🌐',
    English: 'Hello! How can I help you today? 👋',
    Hindi: 'नमस्ते! आज मैं आपकी क्या सहायता कर सकता हूँ? 🙏',
    Spanish: '¡Hola! ¿En qué puedo ayudarte hoy? 🇪🇸',
    French: "Bonjour ! Comment puis-je vous aider aujourd'hui ? 🇫🇷",
    German: 'Hallo! Wie kann ich Ihnen heute helfen? 🇩🇪',
    Japanese: 'こんにちは！今日はどのようなご用件でしょうか？ 🇯🇵',
    Mandarin: '你好！今天有什么我可以帮你的吗？ 🇨🇳',
    Italian: 'Ciao! Come posso aiutarti oggi? 🇮🇹',
    Portuguese: 'Olá! Como posso ajudar você hoje? 🇵🇹'
  };

  const ALL_DIAL_LANGUAGES = [
    'AutoDetect',
    'English',
    'Hindi',
    'Spanish',
    'French',
    'German',
    'Japanese',
    'Mandarin',
    'Italian',
    'Portuguese'
  ];

  const ALL_DIAL_MODES = [
    'Formal',
    'Casual',
    'Developer',
    'Prompts',
    'Other apps',
    'Academic',
    'Concise',
    'Warm'
  ];

  const [dialLanguages, setDialLanguages] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('whispurr_dial_languages');
      return saved ? JSON.parse(saved) : ['AutoDetect', 'English', 'Hindi'];
    } catch (e) {
      return ['AutoDetect', 'English', 'Hindi'];
    }
  });

  const [dialModes, setDialModes] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('whispurr_dial_modes');
      return saved ? JSON.parse(saved) : ['Formal', 'Casual', 'Developer', 'Prompts'];
    } catch (e) {
      return ['Formal', 'Casual', 'Developer', 'Prompts'];
    }
  });

  const toggleDialLanguage = (lang: string) => {
    setDialLanguages(prev => {
      let next: string[];
      if (prev.includes(lang)) {
        if (prev.length <= 1) return prev;
        next = prev.filter(l => l !== lang);
      } else {
        next = [...prev, lang];
      }
      try {
        localStorage.setItem('whispurr_dial_languages', JSON.stringify(next));
        window.dispatchEvent(new CustomEvent('whispurr_dial_config_changed'));
      } catch (e) {}
      return next;
    });
  };

  const toggleDialMode = (m: string) => {
    setDialModes(prev => {
      let next: string[];
      if (prev.includes(m)) {
        if (prev.length <= 1) return prev;
        next = prev.filter(x => x !== m);
      } else {
        next = [...prev, m];
      }
      try {
        localStorage.setItem('whispurr_dial_modes', JSON.stringify(next));
        window.dispatchEvent(new CustomEvent('whispurr_dial_config_changed'));
      } catch (e) {}
      return next;
    });
  };

  const cycle = (direction: 1 | -1) => {
    if (activeDial === 0) {
      setModeRotation(prev => {
        let nextRot = prev + direction;
        if (nextRot < 0) nextRot = 0;
        if (nextRot > dialModes.length - 1) nextRot = Math.max(0, dialModes.length - 1);
        return nextRot;
      });
    } else {
      setLangRotation(prev => {
        let nextRot = prev + direction;
        if (nextRot < 0) nextRot = 0;
        if (nextRot > dialLanguages.length - 1) nextRot = Math.max(0, dialLanguages.length - 1);
        return nextRot;
      });
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    cycle(e.deltaY > 0 ? 1 : -1);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setActiveDial(prev => (prev === 0 ? 1 : 0));
  };

  const currentMode = dialModes[modeRotation] || 'Formal';
  const currentLang = dialLanguages[langRotation] || 'English';

  return (
    <div className="flex flex-col items-center w-full max-w-4xl text-center select-none">
      <h1 className="text-3xl md:text-4xl font-serif font-medium tracking-tight mb-1 text-[#3e2723] flex items-center justify-center gap-2.5">
        <span>Seamless <span className="relative z-10 before:content-[''] before:absolute before:inset-x-0 before:bottom-1 before:h-2.5 before:bg-[#d7ccc8] before:-z-10">Radial Dials.</span></span>
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#8d6e63]/15 border border-[#8d6e63]/30 text-[#3e2723] text-[11px] font-sans font-semibold tracking-wider uppercase shadow-xs">
          <Sparkles className="w-3 h-3 text-[#8d6e63]" />
          Demo
        </span>
      </h1>
      <p className="text-sm md:text-base text-[#3e2723]/70 font-serif italic mb-3 max-w-2xl">
        - hold <strong className="text-[#3e2723] font-sans font-bold">Alt</strong> anywhere to spin modes, or <strong className="text-[#3e2723] font-sans font-bold">right-click</strong> to spin languages.
      </p>

      {/* Main Interactive Dial Simulator Card */}
      <div 
        onWheel={handleWheel}
        onContextMenu={handleContextMenu}
        className="w-full bg-white/85 backdrop-blur-md rounded-3xl border border-[#3e2723]/15 shadow-xl p-4 md:p-5 flex flex-col gap-3 relative overflow-hidden"
      >
        {/* Dial Switcher Bar */}
        <div className="flex items-center justify-between border-b border-[#3e2723]/10 pb-2.5 flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setActiveDial(0)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeDial === 0
                  ? 'bg-[#5D4037] text-[#E8D5B5] shadow-md scale-[1.02]'
                  : 'bg-[#3e2723]/5 text-[#3e2723]/70 hover:bg-[#3e2723]/10'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Modes</span>
              <span className="px-1.5 py-0.5 rounded bg-black/20 text-[10px] font-mono font-normal">Alt + Scroll</span>
            </button>

            <button
              onClick={() => setActiveDial(1)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeDial === 1
                  ? 'bg-[#5D4037] text-[#E8D5B5] shadow-md scale-[1.02]'
                  : 'bg-[#3e2723]/5 text-[#3e2723]/70 hover:bg-[#3e2723]/10'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Languages</span>
              <span className="px-1.5 py-0.5 rounded bg-black/20 text-[10px] font-mono font-normal">Alt + → / Right-Click</span>
            </button>

            <button
              type="button"
              role="switch"
              aria-checked={moodsEnabled}
              onClick={toggleMoods}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                moodsEnabled
                  ? 'bg-[#5D4037] text-[#E8D5B5] border-[#3E2723] shadow-md scale-[1.02]'
                  : 'bg-[#3e2723]/5 text-[#3e2723]/70 border-transparent hover:bg-[#3e2723]/10'
              }`}
              title="Toggle Moods: adds expressive emojis based on your emotions and undertones"
            >
              <Sparkles className={`w-3.5 h-3.5 ${moodsEnabled ? 'text-amber-300' : 'text-[#8d6e63]'}`} />
              <span>Moods: {moodsEnabled ? 'ON' : 'OFF'}</span>
              <span>{moodsEnabled ? '✨' : '🎭'}</span>
            </button>
          </div>

          <span className="text-[11px] text-[#3e2723]/50 font-serif italic hidden lg:inline">
            Scroll or right-click to spin
          </span>
        </div>

        {/* Live Radial Arc Interactive Area */}
        <div className="relative h-36 w-full flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#f4ece1]/40 to-[#e8d5b5]/30 rounded-2xl border border-[#3e2723]/10">
          <div className="absolute top-2 left-3 text-[10px] font-mono uppercase tracking-wider text-[#3e2723]/50 font-bold">
            {activeDial === 0 ? 'Mode Selector (Right Arc)' : 'Language Selector (Left Arc)'}
          </div>

          {/* Center Indicator */}
          <div className="flex flex-col items-center justify-center pointer-events-none z-10">
            <div className="w-9 h-9 rounded-full bg-[#5D4037] text-[#E8D5B5] flex items-center justify-center shadow-lg border-2 border-[#E8D5B5]/40 mb-0.5">
              {activeDial === 0 ? <Compass className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
            </div>
            <span className="text-[9px] font-mono uppercase tracking-widest text-[#3e2723]/60 font-bold">
              {activeDial === 0 ? 'Modes' : 'Languages'}
            </span>
          </div>

          {/* Dial Items mapped along arc */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {activeDial === 0 ? (
              <>
                <svg className="absolute pointer-events-none" style={{ width: 220, height: 220 }}>
                  <path d="M 110 20 A 90 90 0 0 1 110 200" fill="none" stroke="#8d6e63" strokeWidth="2" strokeDasharray="3 3" opacity="0.4" />
                </svg>
                {dialModes.map((m, i) => {
                  const diff = i - modeRotation;
                  const distance = Math.abs(diff);
                  const angle = diff * 26;
                  const angleRad = angle * (Math.PI / 180);
                  const radius = 110;
                  const x = Math.cos(angleRad) * radius;
                  const y = Math.sin(angleRad) * radius;
                  const isActive = diff === 0;
                  const opacity = distance === 0 ? 1 : distance === 1 ? 0.65 : distance === 2 ? 0.25 : 0;
                  const emoji = MODE_EMOJIS[m] || '✨';
                  const displayLabel = moodsEnabled ? `${m} ${emoji}` : m;
                  return (
                    <motion.div
                      key={m}
                      className="absolute"
                      animate={{ x, y, scale: isActive ? 1.08 : 0.85, opacity }}
                      transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                    >
                      <div className={`-translate-y-1/2 px-3 py-1 whitespace-nowrap text-xs font-bold transition-all ${
                        isActive
                          ? 'rounded-xl shadow-lg bg-[#5D4037] text-[#E8D5B5] border border-[#3E2723]'
                          : 'text-[#5D4037] drop-shadow-xs'
                      }`}>
                        {displayLabel}
                      </div>
                    </motion.div>
                  );
                })}
              </>
            ) : (
              <>
                <svg className="absolute pointer-events-none" style={{ width: 220, height: 220 }}>
                  <path d="M 110 20 A 90 90 0 0 0 110 200" fill="none" stroke="#8d6e63" strokeWidth="2" strokeDasharray="3 3" opacity="0.4" />
                </svg>
                {dialLanguages.map((l, i) => {
                  const diff = i - langRotation;
                  const distance = Math.abs(diff);
                  const angle = 180 - diff * 26;
                  const angleRad = angle * (Math.PI / 180);
                  const radius = 110;
                  const x = Math.cos(angleRad) * radius;
                  const y = Math.sin(angleRad) * radius;
                  const isActive = diff === 0;
                  const opacity = distance === 0 ? 1 : distance === 1 ? 0.65 : distance === 2 ? 0.25 : 0;
                  return (
                    <motion.div
                      key={l}
                      className="absolute"
                      animate={{ x, y, scale: isActive ? 1.08 : 0.85, opacity }}
                      transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                    >
                      <div className={`-translate-y-1/2 px-3 py-1 whitespace-nowrap text-xs font-bold transition-all ${
                        isActive
                          ? 'rounded-xl shadow-lg bg-[#5D4037] text-[#E8D5B5] border border-[#3E2723]'
                          : 'text-[#5D4037] drop-shadow-xs'
                      }`}>
                        {l}
                      </div>
                    </motion.div>
                  );
                })}
              </>
            )}
          </div>

          {/* Quick cycle arrow buttons */}
          <div className="absolute right-3 flex flex-col gap-1.5 z-20">
            <button
              onClick={(e) => { e.stopPropagation(); cycle(-1); }}
              className="w-7 h-7 rounded-lg bg-white/80 hover:bg-white text-[#3e2723] border border-[#3e2723]/20 flex items-center justify-center shadow-xs cursor-pointer"
              title="Cycle Up"
            >
              <ChevronUp size={16} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); cycle(1); }}
              className="w-7 h-7 rounded-lg bg-white/80 hover:bg-white text-[#3e2723] border border-[#3e2723]/20 flex items-center justify-center shadow-xs cursor-pointer"
              title="Cycle Down"
            >
              <ChevronDown size={16} />
            </button>
          </div>
        </div>

        {/* Live Output Preview Strip */}
        <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#f4ece1]/80 to-[#e8d5b5]/50 border border-[#3e2723]/10 text-xs">
          <div className="flex items-center gap-2 overflow-hidden text-left flex-1 mr-2">
            <span className="px-2 py-0.5 rounded-md bg-[#5D4037] text-[#E8D5B5] text-[10px] font-mono font-bold uppercase shrink-0">
              {activeDial === 0 ? currentMode : currentLang}
            </span>
            <span className="text-[#3e2723] font-medium truncate font-sans">
              {activeDial === 0
                ? (moodsEnabled
                    ? (MODE_SAMPLES[currentMode]?.mood || `${MODE_SAMPLES[currentMode]?.plain || 'Your adapted thoughts will flow here.'} ✨`)
                    : (MODE_SAMPLES[currentMode]?.plain || 'Your adapted thoughts will flow here.'))
                : (LANG_SAMPLES[currentLang] || 'Your translated voice appears here in real-time.')}
            </span>
          </div>
          {activeDial === 0 && (
            <span className="text-[10px] font-mono text-[#8d6e63] font-bold shrink-0 hidden sm:inline">
              {moodsEnabled ? '✨ Moods Active' : 'Neutral Tone'}
            </span>
          )}
        </div>

        {/* Customization Chips Section */}
        <div className="flex flex-col gap-2 pt-2 border-t border-[#3e2723]/10 text-left">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#3e2723] tracking-tight">
              {activeDial === 0 ? 'Customise Showcased Modes' : 'Customise Showcased Languages'}
            </span>
            <span className="text-[11px] text-[#3e2723]/60 font-serif italic">
              Click chips to showcase or hide on dial
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 min-h-[56px] max-h-[56px] overflow-y-auto pr-1 custom-scrollbar">
            {activeDial === 0 ? (
              ALL_DIAL_MODES.map(m => {
                const isSelected = dialModes.includes(m);
                const emoji = MODE_EMOJIS[m] || '✨';
                return (
                  <button
                    key={m}
                    onClick={() => toggleDialMode(m)}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-medium transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-[#5D4037]/15 text-[#3e2723] border-[#5D4037]/40 font-bold'
                        : 'bg-black/5 text-[#3e2723]/40 border-transparent hover:bg-black/10'
                    }`}
                  >
                    {isSelected ? <Check className="w-3 h-3 text-[#5D4037]" /> : <Plus className="w-3 h-3 opacity-40" />}
                    <span>{m} {moodsEnabled ? emoji : ''}</span>
                  </button>
                );
              })
            ) : (
              ALL_DIAL_LANGUAGES.map(l => {
                const isSelected = dialLanguages.includes(l);
                return (
                  <button
                    key={l}
                    onClick={() => toggleDialLanguage(l)}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-medium transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-[#5D4037]/15 text-[#3e2723] border-[#5D4037]/40 font-bold'
                        : 'bg-black/5 text-[#3e2723]/40 border-transparent hover:bg-black/10'
                    }`}
                  >
                    {isSelected ? <Check className="w-3 h-3 text-[#5D4037]" /> : <Plus className="w-3 h-3 opacity-40" />}
                    <span>{l}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
