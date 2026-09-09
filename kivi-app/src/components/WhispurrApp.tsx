import { useState, useEffect, useRef } from 'react';
import { PanelLeftClose, Keyboard, PanelLeft, Home, BookOpen, Zap, Palette, Clock, FileText, X, Mic, Pencil, User, Settings, Shield, LayoutTemplate, CreditCard, PlayCircle, Square, Trash2, Sparkles, Copy, Check, Info, PawPrint, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Tutorial from './Tutorial';
import StylesManager from './styles/StylesManager';
import FootprintManager from './FootprintManager';
import KiviCatIcon from './KiviCatIcon';
import { transformText } from '../transformEngine';

const CAT_FACTS = [
  "Cats lack a rigid collarbone, meaning that if their head can squeeze through a gap, their whole body is probably going along for the ride!",
  "They have 32 muscles in *each* ear (compared to our measly six) and can independently swivel them 180 degrees to pinpoint exactly which room you just opened the treat bag in.",
  "Don't let their lazy demeanor fool you—a healthy cat can leap up to six times their own height in a single, effortless bound.",
  "A cat’s purr rumbles at a frequency between 25 and 150 Hertz, which veterinary studies show can actually help heal bones, repair tissues, and reduce swelling. They are literally vibrating little medics!",
  "Just like human fingerprints, no two cat nose prints are exactly alike. Every kitty is walking around with a completely unique, boopable ID card on their face.",
  "Adult cats rarely ever meow at each other. They use body language and scent for kitty-to-kitty chats, and developed the \"meow\" almost entirely to communicate with (and successfully manipulate) us humans!",
  "They spend roughly 70% of their lives snoozing, which means a 9-year-old cat has been awake for barely three years of its life.",
  "Because of a genetic mutation that wiped out their sweet receptors, cats physically cannot taste sugar. If they try to steal a lick of your ice cream, they are just in it for the delicious fat and texture!",
  "Over short distances, a domestic house cat can hit speeds of up to 30 mph, which is actually slightly faster than Olympic sprinter Usain Bolt.",
  "Just like we are left- or right-handed, cats tend to have a preferred paw. Behavioral studies suggest that male cats often favor their left paw, while female cats tend to favor their right."
];
let hasShownTutorialThisSession = false;

const FUN_SUBTITLES = [
  "Your invisible translation layer is purring and ready to pounce.",
  "Ears perked, whiskers twitching, standing by to transcribe.",
  "Translating your thoughts at the speed of 3 AM zoomies ⚡",
  "99.9% speech accuracy, 0.1% cat nap energy 💤",
  "Kneading your spoken words into purr-fect prose ✨",
  "Ready to catch every word like a red laser dot 🔴",
  "Fueled by curiosity, warm coffee, and clean audio ☕",
  "Zero hisses, all purrs. Speak whenever you're ready! 🐾"
];

const BOOP_REACTIONS = [
  '🐾 *purr*',
  '💖 +10 Purrs!',
  '✨ Boop!',
  '😸 Purr-fect!',
  '🐭 *happy squeak*',
  '🐾 Pounce!'
];

const getTimeGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return { text: 'Good morning', icon: '☀️' };
  if (hour >= 12 && hour < 17) return { text: 'Good afternoon', icon: '🌮' };
  if (hour >= 17 && hour < 22) return { text: 'Good evening', icon: '🌙' };
  return { text: 'Late night creativity', icon: '✨' };
};

const playCatChime = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;
    
    // Note 1: gentle warm chirp
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, now);
    osc1.frequency.exponentialRampToValueAtTime(659.25, now + 0.08);
    gain1.gain.setValueAtTime(0.08, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.18);

    // Note 2: high sparkle chime
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(783.99, now + 0.1);
    osc2.frequency.exponentialRampToValueAtTime(1046.5, now + 0.22);
    gain2.gain.setValueAtTime(0.09, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.1);
    osc2.stop(now + 0.32);
  } catch {
    // Silently ignore
  }
};

const TOUR_STEPS = [
    { id: 'Home', title: 'The Home Base', text: 'Watch WhisPURR in action! See your speech turn into text live and access your quick controls.' },
    { id: 'History', title: 'Chat Registers', text: 'Look back at everything you\'ve said. You can easily copy or reuse your past words here.' },
    { id: 'Dictionary', title: 'Your Custom Dictionary', text: 'Teach WhisPURR your unique vocabulary, like tricky names, special acronyms, or work-specific words.' },
    { id: 'ShortHand', title: 'ShortHand Macros', text: 'Create quick voice shortcuts! For example, say "sig" to automatically type out your entire email signature.' },
    { id: 'Modes', title: 'Global Modes', text: 'Set up custom modes so WhisPURR always uses the right tone for your current task, like writing emails, chatting, or coding.' },
    { id: 'ScratchPad', title: 'ScratchPad', text: 'Your personal sandbox! Quickly jot down ideas or play around to test your new custom modes.' },
    { id: 'Profile', title: 'Your Profile', text: 'Manage your account details, billing, and tweak your overall settings just the way you like them.' },
    { id: 'CatFacts', title: 'Cat Facts', text: 'Because who doesn\'t need a fun, random cat fact to brighten their workday?' }
  ];

const VIDEOS = ['/cat.mp4', '/cat2.mp4', '/cat3.mp4'];

/**
 * Parses time strings like "1h 42m", "45m", "2h", or numbers into total minutes.
 */
function parseTimeToMinutes(timeStr: string | number): number {
  if (typeof timeStr === 'number') return timeStr;
  if (!timeStr) return 0;
  
  const str = String(timeStr).toLowerCase().trim();
  let totalMinutes = 0;
  
  const hoursMatch = str.match(/(\d+(?:\.\d+)?)\s*(?:h|hr|hrs|hour|hours)/);
  if (hoursMatch) {
    totalMinutes += parseFloat(hoursMatch[1]) * 60;
  }
  
  const minsMatch = str.match(/(\d+(?:\.\d+)?)\s*(?:m|min|mins|minute|minutes)/);
  if (minsMatch) {
    totalMinutes += parseFloat(minsMatch[1]);
  }
  
  if (!hoursMatch && !minsMatch) {
    const num = parseFloat(str);
    if (!isNaN(num)) return num;
  }
  
  return totalMinutes;
}

/**
 * Translates saved minutes into relatable, positive messages tailored for Professional or Casual mode.
 */
function getTimeSavedRelatableMessage(minutes: number, isCasual: boolean): string {
  if (minutes < 5) {
    return isCasual 
      ? "A quick breath of fresh air ☕" 
      : "A few valuable minutes saved.";
  }
  if (minutes < 15) {
    // 5–15 minutes
    return isCasual 
      ? "Coffee break earned ☕" 
      : "Enough time for a coffee.";
  }
  if (minutes < 30) {
    // 15–30 minutes
    return isCasual 
      ? "That's a chapter of your book 📖" 
      : "Enough time to read a chapter.";
  }
  if (minutes < 60) {
    // 30–60 minutes
    return isCasual 
      ? "Enough time to watch an episode 🎬" 
      : "Enough time to watch an episode.";
  }
  if (minutes < 120) {
    // 1–2 hours
    return isCasual 
      ? "That's a whole movie + popcorn 🍿" 
      : "Enough time to watch a movie.";
  }
  if (minutes < 240) {
    // 2–4 hours
    return isCasual 
      ? "Enough time to make 3 presentations 📊" 
      : "Enough time to complete ~3 presentations.";
  }
  // 4+ hours
  return isCasual 
    ? "That's almost half a workday back ✨" 
    : "That's almost half a workday back.";
}

export default function WhispurrApp({ mode, setMode = () => {} }: { mode?: string, setMode?: (m: any) => void }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    try {
      return new URLSearchParams(window.location.search).get('tab') || 'Home';
    } catch (e) {
      return 'Home';
    }
  });
  const [homeVideo, setHomeVideo] = useState(() => VIDEOS[Math.floor(Math.random() * VIDEOS.length)]);
  const [videoKey, setVideoKey] = useState(0);

  useEffect(() => {
    if (activeTab === 'Home') {
      setHomeVideo(prev => {
        let next;
        do {
          next = VIDEOS[Math.floor(Math.random() * VIDEOS.length)];
        } while (next === prev);
        return next;
      });
      setVideoKey(prev => prev + 1);
    }
  }, [activeTab]);

  const [funSubtitleIndex, setFunSubtitleIndex] = useState(0);
  const [boopParticles, setBoopParticles] = useState<{ id: number; text: string; x: number }[]>([]);
  const [isBooping, setIsBooping] = useState(false);

  const handleBoop = () => {
    playCatChime();
    setIsBooping(true);
    setTimeout(() => setIsBooping(false), 500);

    setFunSubtitleIndex(prev => (prev + 1) % FUN_SUBTITLES.length);

    const reaction = BOOP_REACTIONS[Math.floor(Math.random() * BOOP_REACTIONS.length)];
    const newParticle = {
      id: Date.now() + Math.random(),
      text: reaction,
      x: (Math.random() - 0.5) * 50,
    };
    setBoopParticles(prev => [...prev.slice(-3), newParticle]);
    setTimeout(() => {
      setBoopParticles(prev => prev.filter(p => p.id !== newParticle.id));
    }, 1100);
  };

  const [isTourActive, setIsTourActive] = useState(false);
  const [tourStep, setTourStep] = useState(0);


  const currentTourId = isTourActive ? TOUR_STEPS[tourStep].id : null;

  const handleNextTourStep = () => {
    if (tourStep < TOUR_STEPS.length - 1) {
      setTourStep(s => s + 1);
      const nextId = TOUR_STEPS[tourStep + 1].id;
      if (nextId === 'Profile') {
        setIsSettingsOpen(true);
        setShowCatFactPopup(false);
      } else if (nextId === 'CatFacts') {
        setIsSettingsOpen(false);
        setShowCatFactPopup(true);
      } else {
        setIsSettingsOpen(false);
        setShowCatFactPopup(false);
        setActiveTab(nextId);
      }
    } else {
      setIsTourActive(false);
      setIsSettingsOpen(false);
      setShowCatFactPopup(false);
      setActiveTab('Home');
    }
  };

  const handlePrevTourStep = () => {
    if (tourStep > 0) {
      setTourStep(s => s - 1);
      const prevId = TOUR_STEPS[tourStep - 1].id;
      if (prevId === 'Profile') {
        setIsSettingsOpen(true);
        setShowCatFactPopup(false);
      } else if (prevId === 'CatFacts') {
        setIsSettingsOpen(false);
        setShowCatFactPopup(true);
      } else {
        setIsSettingsOpen(false);
        setShowCatFactPopup(false);
        setActiveTab(prevId);
      }
    }
  };

  useEffect(() => {
    if (!isTourActive) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        handleNextTourStep();
      } else if (e.key === 'ArrowLeft') {
        handlePrevTourStep();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTourActive, tourStep]);

  const [currentCatFact, setCurrentCatFact] = useState('');
  const [showCatFactPopup, setShowCatFactPopup] = useState(false);
  const catFactRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showCatFactPopup) return;

    const handleOutsideInteraction = (e: MouseEvent | TouchEvent) => {
      if (catFactRef.current && !catFactRef.current.contains(e.target as Node)) {
        setShowCatFactPopup(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowCatFactPopup(false);
      }
    };

    document.addEventListener('pointerdown', handleOutsideInteraction);
    document.addEventListener('touchstart', handleOutsideInteraction);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handleOutsideInteraction);
      document.removeEventListener('touchstart', handleOutsideInteraction);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showCatFactPopup]);
  const [showTutorial, setShowTutorial] = useState(() => {
    try {
      if (new URLSearchParams(window.location.search).has('tab')) return false;
    } catch (e) {}
    return !hasShownTutorialThisSession;
  });
  const [talkShortcut, setTalkShortcut] = useState(() => localStorage.getItem('whispurr_talk') || 'Alt');
  const [isRecordingShortcut, setIsRecordingShortcut] = useState(false);
  const [quicklaunchShortcut, setQuicklaunchShortcut] = useState(() => localStorage.getItem('whispurr_quicklaunch') || 'Ctrl');
  const [isRecordingQuicklaunch, setIsRecordingQuicklaunch] = useState(false);
  const [quickEditShortcut, setQuickEditShortcut] = useState(() => localStorage.getItem('whispurr_quickedit') || 'Alt + Ctrl');
  const [isRecordingQuickEdit, setIsRecordingQuickEdit] = useState(false);
  const [isSeamlessSwitchEnabled, setIsSeamlessSwitchEnabled] = useState(() => localStorage.getItem('whispurr_seamless_switch') !== 'false');

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
    'Portuguese',
    'Russian',
    'Arabic',
    'Korean',
    'Dutch'
  ];

  const ALL_DIAL_MODES = [
    'Formal',
    'Casual',
    'Developer',
    'Prompts',
    'Other apps',
    'Academic',
    'Concise',
    'Warm',
    'Technical'
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
        next = prev.filter(item => item !== m);
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

  useEffect(() => {
    if (isRecordingShortcut) {
      const handleKeyDown = (e: KeyboardEvent) => {
        e.preventDefault();
        e.stopPropagation();
        let key = e.key;
        if (key === ' ') key = 'Space';
        else if (key === 'Control') key = 'Ctrl';
        else if (key === 'Meta') key = 'Cmd';
        if (key.length === 1) key = key.toUpperCase();
        setTalkShortcut(key);
        localStorage.setItem('whispurr_talk', key);
        setIsRecordingShortcut(false);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isRecordingShortcut]);

  useEffect(() => {
    if (isRecordingQuicklaunch) {
      const handleKeyDown = (e: KeyboardEvent) => {
        e.preventDefault();
        e.stopPropagation();
        let key = e.key;
        if (key === ' ') key = 'Space';
        else if (key === 'Control') key = 'Ctrl';
        else if (key === 'Meta') key = 'Cmd';
        if (key.length === 1) key = key.toUpperCase();
        setQuicklaunchShortcut(key);
        localStorage.setItem('whispurr_quicklaunch', key);
        setIsRecordingQuicklaunch(false);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isRecordingQuicklaunch]);

  useEffect(() => {
    if (isRecordingQuickEdit) {
      const handleKeyDown = (e: KeyboardEvent) => {
        e.preventDefault();
        e.stopPropagation();
        let key = e.key;
        if (key === ' ') key = 'Space';
        else if (key === 'Control') key = 'Ctrl';
        else if (key === 'Meta') key = 'Cmd';
        if (key.length === 1) key = key.toUpperCase();
        
        let combo = [];
        if (e.ctrlKey && key !== 'Ctrl') combo.push('Ctrl');
        if (e.altKey && key !== 'Alt') combo.push('Alt');
        if (e.shiftKey && key !== 'Shift') combo.push('Shift');
        combo.push(key);
        
        const finalKey = combo.join(' + ');
        setQuickEditShortcut(finalKey);
        localStorage.setItem('whispurr_quickedit', finalKey);
        setIsRecordingQuickEdit(false);
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isRecordingQuickEdit]);






  const [currentTheme, setCurrentTheme] = useState('coffee');
  const [moodsEnabled, setMoodsEnabled] = useState(false);
  
  // StickyNotes State
  const [stickyNotes, setStickyNotes] = useState([
    { id: 1, text: "Buy catnip\nSchedule vet appointment\nClean the litter box", color: "bg-[#e8d5b5]", rotation: -3, x: 20, y: 10 },
    { id: 2, text: "Project ideas:\n- AI voice assistant\n- MockOS prototype\n- Add more cats", color: "bg-[#d5e8b5]", rotation: 4, x: -10, y: 40 },
    { id: 3, text: "Remember to drink water!", color: "bg-[#b5d5e8]", rotation: -2, x: 30, y: -20 },
    { id: 4, text: "Call Mom at 6 PM", color: "bg-[#e8b5c5]", rotation: 5, x: -20, y: 10 },
  ]);
  const [activeNoteId, setActiveNoteId] = useState<number | null>(null);

  useEffect(() => {
    const handleAddNote = (e: any) => {
      const newText = e.detail;
      if (newText) {
        setStickyNotes(prev => [
          ...prev, 
          { 
            id: Date.now(), 
            text: newText, 
            color: "bg-[#e8d5b5]", 
            rotation: (Math.random() - 0.5) * 10, 
            x: (Math.random() - 0.5) * 40, 
            y: (Math.random() - 0.5) * 40 
          }
        ]);
      }
    };
    const handleInsertText = (e: any) => {
      if (e.detail) {
        setHomeChatText(prev => prev ? `${prev} ${e.detail}` : e.detail);
      }
    };
    window.addEventListener('add-sticky-note', handleAddNote);
    window.addEventListener('whispurr-insert-text', handleInsertText);
    return () => {
      window.removeEventListener('add-sticky-note', handleAddNote);
      window.removeEventListener('whispurr-insert-text', handleInsertText);
    };
  }, []);

  useEffect(() => {
    if (mode === 'ScratchPad') {
      setActiveTab('ScratchPad');
    }
  }, [mode]);

  // Home Voice-to-Text Chat Box State
  const [homeChatText, setHomeChatText] = useState('');
  const [showQuickEditModal, setShowQuickEditModal] = useState(false);
  const [quickEditText, setQuickEditText] = useState('');

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (isRecordingShortcut || isRecordingQuicklaunch || isRecordingQuickEdit) return;

      const keys = [];
      if (e.ctrlKey) keys.push('Ctrl');
      if (e.altKey) keys.push('Alt');
      if (e.shiftKey) keys.push('Shift');
      if (e.metaKey) keys.push('Cmd');
      
      let key = e.key;
      if (key === ' ') key = 'Space';
      if (key.length === 1) key = key.toUpperCase();
      
      if (!['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) {
          keys.push(key);
      }

      const currentCombo = keys.join(' + ');
      const normalizeCombo = (str: string) => str.split(' + ').sort().join(' + ');

      if (currentCombo && normalizeCombo(currentCombo) === normalizeCombo(quickEditShortcut)) {
        e.preventDefault();
        openQuickEdit();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [quickEditShortcut, isRecordingShortcut, isRecordingQuicklaunch, isRecordingQuickEdit, homeChatText]);

  const openQuickEdit = () => {
    if (!homeChatText.trim()) return;
    const sentences = homeChatText.match(/[^.!?]+[.!?]*\s*/g) || [homeChatText];
    const lastSentence = sentences[sentences.length - 1];
    setQuickEditText(lastSentence.trim());
    setShowQuickEditModal(true);
  };

  const saveQuickEdit = () => {
    const sentences = homeChatText.match(/[^.!?]+[.!?]*\s*/g) || [homeChatText];
    sentences[sentences.length - 1] = (sentences.length > 1 ? ' ' : '') + quickEditText;
    setHomeChatText(sentences.join('').trim());
    setShowQuickEditModal(false);
  };
  const [isHomeListening, setIsHomeListening] = useState(false);
  const [isHomeCopied, setIsHomeCopied] = useState(false);
  const [isHomeTransforming, setIsHomeTransforming] = useState(false);
  const [isWhisperMode, setIsWhisperMode] = useState(false);
  const [showWhisperInfo, setShowWhisperInfo] = useState(false);
  const [showMoodsInfo, setShowMoodsInfo] = useState(false);
  const whisperInfoRef = useRef<HTMLDivElement>(null);
  const moodsInfoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showWhisperInfo && !showMoodsInfo) return;

    const handleOutsideInteraction = (e: MouseEvent | TouchEvent) => {
      if (showWhisperInfo && whisperInfoRef.current && !whisperInfoRef.current.contains(e.target as Node)) {
        setShowWhisperInfo(false);
      }
      if (showMoodsInfo && moodsInfoRef.current && !moodsInfoRef.current.contains(e.target as Node)) {
        setShowMoodsInfo(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowWhisperInfo(false);
        setShowMoodsInfo(false);
      }
    };

    document.addEventListener('pointerdown', handleOutsideInteraction);
    document.addEventListener('touchstart', handleOutsideInteraction);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handleOutsideInteraction);
      document.removeEventListener('touchstart', handleOutsideInteraction);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showWhisperInfo, showMoodsInfo]);

  const homeRecognitionRef = useRef<any>(null);
  const homeInitialTextRef = useRef('');

  const toggleHomeListening = () => {
    if (isHomeListening) {
      try {
        homeRecognitionRef.current?.stop();
      } catch (e) {}
      setIsHomeListening(false);
      return;
    }

    const SpeechRec = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRec) {
      alert("Speech recognition is not supported in this browser. Please use Google Chrome or a Chromium browser.");
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      homeInitialTextRef.current = homeChatText.trim();

      recognition.onstart = () => {
        setIsHomeListening(true);
      };

      recognition.onresult = (event: any) => {
        let sessionText = '';
        for (let i = 0; i < event.results.length; i++) {
          sessionText += event.results[i][0].transcript;
        }
        const trimmedSession = sessionText.trim();
        if (homeInitialTextRef.current) {
          setHomeChatText(`${homeInitialTextRef.current} ${trimmedSession}`);
        } else {
          setHomeChatText(trimmedSession);
        }
      };

      recognition.onerror = (e: any) => {
        console.warn("Home Chat speech error:", e.error);
        if (e.error !== 'no-speech') {
          setIsHomeListening(false);
        }
      };

      recognition.onend = () => {
        setIsHomeListening(false);
      };

      homeRecognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Failed to start speech recognition:", err);
      setIsHomeListening(false);
    }
  };

  const handleCopyHomeChat = async () => {
    if (!homeChatText.trim()) return;
    try {
      await navigator.clipboard.writeText(homeChatText);
      setIsHomeCopied(true);
      setTimeout(() => setIsHomeCopied(false), 2000);
    } catch (err) {
      const textarea = document.createElement('textarea');
      textarea.value = homeChatText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setIsHomeCopied(true);
      setTimeout(() => setIsHomeCopied(false), 2000);
    }
  };

  const handleClearHomeChat = () => {
    setHomeChatText('');
    if (isHomeListening) {
      try {
        homeRecognitionRef.current?.stop();
      } catch (e) {}
      setIsHomeListening(false);
    }
  };

  const handleFormatWithAI = async () => {
    if (!homeChatText.trim() || isHomeTransforming) return;
    setIsHomeTransforming(true);
    try {
      const formatted = await transformText(homeChatText, (mode as any) || 'Professional', 2);
      if (formatted) setHomeChatText(formatted);
    } catch (e) {
      console.error(e);
    } finally {
      setIsHomeTransforming(false);
    }
  };

  // Cleanup speech recognition on unmount
  useEffect(() => {
    return () => {
      if (homeRecognitionRef.current) {
        try {
          homeRecognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  // Dictionary State
  const [dictItems, setDictItems] = useState([
    { id: 1, spoken: 'Kivi', correct: 'WhisPURR' },
    { id: 2, spoken: 'Ree-act', correct: 'React' },
    { id: 3, spoken: 'Type scrip', correct: 'TypeScript' },
  ]);
  const [spokenInput, setSpokenInput] = useState('');
  const [correctInput, setCorrectInput] = useState('');
  const [isDictListening, setIsDictListening] = useState(false);

  const startDictListening = () => {
    if (!('webkitSpeechRecognition' in window)) return;
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onstart = () => setIsDictListening(true);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (activeTab === 'Dictionary') {
        setSpokenInput(transcript);
      } else if (activeTab === 'Shortcuts') {
        setTriggerInput(transcript);
      }
    };
    
    recognition.onend = () => setIsDictListening(false);
    
    recognition.start();
  };

  const addDictItem = () => {
    if (spokenInput && correctInput) {
      setDictItems([...dictItems, { id: Date.now(), spoken: spokenInput, correct: correctInput }]);
      setSpokenInput('');
      setCorrectInput('');
    }
  };

  // Shortcuts State
  const [shortcutItems, setShortcutItems] = useState([
    { id: 1, trigger: 'my address', expansion: '123 Developer Way, Tech District, CA 94105' },
    { id: 2, trigger: 'my signoff', expansion: 'Warm Regards,\nRaghav\nRoll No: 42' },
  ]);
  const [triggerInput, setTriggerInput] = useState('');
  const [expansionInput, setExpansionInput] = useState('');

  const addShortcutItem = () => {
    if (triggerInput && expansionInput) {
      setShortcutItems([...shortcutItems, { id: Date.now(), trigger: triggerInput, expansion: expansionInput }]);
      setTriggerInput('');
      setExpansionInput('');
    }
  };

  const editShortcutItem = (item: any) => {
    setTriggerInput(item.trigger);
    setExpansionInput(item.expansion);
    setShortcutItems(shortcutItems.filter(i => i.id !== item.id));
  };

  const timeSavedWeekHrs = 15;

  const [timeSavedToday, setTimeSavedToday] = useState<string>(() => {
    try {
      return localStorage.getItem('whispurr_time_saved_today') || '1h 42m';
    } catch {
      return '1h 42m';
    }
  });

  useEffect(() => {
    const handleTimeSavedChange = (e: Event) => {
      const custom = e as CustomEvent;
      if (custom.detail && typeof custom.detail.timeSaved === 'string') {
        setTimeSavedToday(custom.detail.timeSaved);
      } else {
        try {
          const saved = localStorage.getItem('whispurr_time_saved_today');
          if (saved) setTimeSavedToday(saved);
        } catch {}
      }
    };
    window.addEventListener('whispurr_time_saved_changed', handleTimeSavedChange);
    window.addEventListener('storage', handleTimeSavedChange);
    return () => {
      window.removeEventListener('whispurr_time_saved_changed', handleTimeSavedChange);
      window.removeEventListener('storage', handleTimeSavedChange);
    };
  }, []);

  const [activeMode, setActiveMode] = useState<string>(() => {
    try {
      return mode || localStorage.getItem('whispurr_mode') || 'Professional';
    } catch {
      return mode || 'Professional';
    }
  });

  useEffect(() => {
    if (mode) setActiveMode(mode);
  }, [mode]);

  useEffect(() => {
    const handleModeChange = () => {
      try {
        const saved = localStorage.getItem('whispurr_mode');
        if (saved) setActiveMode(saved);
      } catch {}
    };
    window.addEventListener('storage', handleModeChange);
    window.addEventListener('whispurr_dial_config_changed', handleModeChange);
    return () => {
      window.removeEventListener('storage', handleModeChange);
      window.removeEventListener('whispurr_dial_config_changed', handleModeChange);
    };
  }, []);

  const isCasualMode = (activeMode || '').toLowerCase() === 'casual';
  const minutesSaved = parseTimeToMinutes(timeSavedToday);
  const timeSavedRelatableMessage = getTimeSavedRelatableMessage(minutesSaved, isCasualMode);
  
  // Animation variants
  const tabVariants = {
    initial: { opacity: 0, y: 10, scale: 0.99, filter: 'blur(4px)' },
    animate: { 
      opacity: 1, 
      y: 0, 
      scale: 1, 
      filter: 'blur(0px)',
      transition: { 
        type: "spring", 
        stiffness: 400, 
        damping: 30, 
        mass: 0.8 
      } 
    },
    exit: { 
      opacity: 0, 
      scale: 0.99, 
      filter: 'blur(4px)',
      transition: { 
        duration: 0.15, 
        ease: "easeOut" 
      } 
    }
  };

  // Glassmorphism classes
  const glassPanel = "bg-[#0f0f0f] shadow-lg border border-white/[0.08] rounded-3xl";
  const glassInput = "bg-black/20 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-orange-500/50 focus:bg-black/40 transition-all text-sm";
  const glassButton = "bg-orange-500/90 hover:bg-orange-400 text-black font-bold px-8 py-3 rounded-2xl transition-all shadow-[0_0_15px_rgba(249,115,22,0.2)] hover:shadow-[0_0_25px_rgba(249,115,22,0.4)] text-sm";

  const getSidebarItemClass = (id: string, baseClass: string) => {
    let classes = baseClass;
    if (isTourActive) {
      if (currentTourId === id) {
        classes += ' ring-2 ring-orange-500 ring-offset-4 ring-offset-[#0f0f0f] relative z-[9999] bg-[#1a1a1a] scale-105 shadow-xl opacity-100';
      } else {
        classes += ' opacity-20 pointer-events-none grayscale blur-[1px]';
      }
    }
    return classes;
  };


  return (
    <>
    <AnimatePresence>
        {showQuickEditModal && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-2xl bg-[#1a110e] border border-[#5d4037]/60 rounded-2xl shadow-2xl p-6"
            >
              <h2 className="text-xl font-bold text-orange-200 mb-4 flex items-center gap-2">
                <Pencil className="w-5 h-5 text-orange-400" />
                Quick Edit (Last Sentence)
              </h2>
              <textarea
                autoFocus
                value={quickEditText}
                onChange={(e) => setQuickEditText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    saveQuickEdit();
                  }
                  if (e.key === 'Escape') {
                    setShowQuickEditModal(false);
                  }
                }}
                className="w-full h-32 bg-black/40 border border-orange-500/30 rounded-xl p-4 text-white text-lg focus:outline-none focus:border-orange-500/80 resize-none shadow-inner"
              />
              <div className="flex justify-between items-center mt-4 text-xs text-white/40">
                <span>Press <kbd className="bg-white/10 px-1.5 py-0.5 rounded border border-white/20 font-mono">Enter</kbd> to save</span>
                <div className="flex gap-3">
                  <button onClick={() => setShowQuickEditModal(false)} className="px-4 py-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors">Cancel</button>
                  <button onClick={saveQuickEdit} className="px-6 py-2 rounded-lg bg-gradient-to-r from-orange-600 to-orange-500 text-white font-bold hover:shadow-[0_0_15px_rgba(249,115,22,0.4)] transition-all">Save Changes</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    <div className={`h-full w-full bg-black text-white flex font-sans overflow-hidden ${currentTheme === 'coffee' ? 'theme-coffee' : ''}`}>
      
      {/* Sidebar */}
      <motion.div 
        animate={{ width: isSidebarOpen ? 260 : 80 }}
        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
        className="h-full bg-white/[0.01] border-r border-white/5 flex flex-col whitespace-nowrap overflow-hidden shrink-0 relative z-20 shadow-[4px_0_24px_rgba(0,0,0,0.5)]"
      >
        <div className={`h-16 flex items-center border-b border-white/5 relative shrink-0 transition-all ${isSidebarOpen ? 'px-6' : 'justify-center'}`}>
          <motion.div animate={{ opacity: isSidebarOpen ? 1 : 0, width: isSidebarOpen ? 'auto' : 0 }} className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 flex items-center justify-center shrink-0 drop-shadow-md">
              <KiviCatIcon size={32} />
            </div>
            <span className="font-bold text-lg tracking-wide text-orange-50 whitespace-nowrap">WhisPURR</span>
          </motion.div>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className={`text-white/40 hover:text-white transition-colors shrink-0 ${isSidebarOpen ? 'absolute right-4 z-10' : ''}`}>
            {isSidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeft className="w-5 h-5" />}
          </button>
        </div>
        
        <div className="flex-1 py-6 flex flex-col gap-2 overflow-y-auto overflow-x-hidden custom-scrollbar">
          <div onClick={() => {setActiveTab('Home'); }} className={getSidebarItemClass('Home', `flex items-center py-3 rounded-xl cursor-pointer transition-all ${isSidebarOpen ? 'gap-4 px-4 mx-4' : 'gap-0 justify-center mx-4'} ${activeTab === 'Home' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20 shadow-sm' : 'text-white/50 hover:bg-white/5 hover:text-white'}`)}>
            <Home className="w-5 h-5 shrink-0" />
            <motion.div animate={{ opacity: isSidebarOpen ? 1 : 0, width: isSidebarOpen ? 'auto' : 0 }} className="text-base font-medium overflow-hidden">Home</motion.div>
          </div>
          
          <div onClick={() => {setActiveTab('History'); }} className={getSidebarItemClass('History', `flex items-center py-3 rounded-xl cursor-pointer transition-all ${isSidebarOpen ? 'gap-4 px-4 mx-4' : 'gap-0 justify-center mx-4'} ${activeTab === 'History' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20 shadow-sm' : 'text-white/50 hover:bg-white/5 hover:text-white'}`)}>
            <Clock className="w-5 h-5 shrink-0" />
            <motion.div animate={{ opacity: isSidebarOpen ? 1 : 0, width: isSidebarOpen ? 'auto' : 0 }} className="text-base font-medium overflow-hidden">History</motion.div>
          </div>

          <motion.div animate={{ opacity: isSidebarOpen ? 1 : 0 }} className={`mt-6 mb-2 text-xs font-bold text-white/50 uppercase tracking-widest h-5 transition-all ${isSidebarOpen ? 'px-8' : 'px-0 text-center w-full shrink-0'} ${isTourActive ? 'opacity-20 blur-[1px]' : ''}`}>
            Customize
          </motion.div>
          
          {[
            { name: 'Dictionary', icon: BookOpen },
            { name: 'ShortHand', icon: Zap },
            { name: 'Modes', icon: Palette },
            { name: 'ScratchPad', icon: FileText },
          ].map((tab) => (
            <div key={tab.name} onClick={() => {
              setActiveTab(tab.name);
            }} className={getSidebarItemClass(tab.name, `flex items-center py-3 rounded-xl cursor-pointer transition-all shrink-0 ${isSidebarOpen ? 'gap-4 px-4 mx-4' : 'gap-0 justify-center mx-4'} ${activeTab === tab.name ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20 shadow-sm' : 'text-white/50 hover:bg-white/5 hover:text-white'}`)}>
              <tab.icon className="w-5 h-5 shrink-0" />
              <motion.div animate={{ opacity: isSidebarOpen ? 1 : 0, width: isSidebarOpen ? 'auto' : 0 }} className="text-base font-medium overflow-hidden">{tab.name}</motion.div>
            </div>
          ))}
        </div>
        
        {/* Sticky Bottom Profile Section */}
        <div className="mb-6 w-full px-4 flex flex-col gap-2 shrink-0 border-t border-white/5 pt-4">
          <div 
            onClick={() => setIsSettingsOpen(!isSettingsOpen)} 
            className={getSidebarItemClass('Profile', `flex items-center py-3 px-3 rounded-xl cursor-pointer transition-all ${isSettingsOpen ? 'bg-white/10 shadow-inner' : 'hover:bg-white/5'} ${isSidebarOpen ? 'gap-3' : 'gap-0 justify-center'}`)}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#8d6e63] to-[#d7ccc8] flex items-center justify-center shrink-0 border border-[#5d4037]/50 overflow-hidden shadow-inner">
              <User className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <motion.div animate={{ opacity: isSidebarOpen ? 1 : 0, width: isSidebarOpen ? 'auto' : 0 }} className="flex flex-col justify-center overflow-hidden">
              <span className="text-sm font-medium text-white">Ugine</span>
            </motion.div>
          </div>

          {/* Cat Facts Button with Popup */}
          <div ref={catFactRef} className="relative">
            <div onClick={() => {
              if (!showCatFactPopup) {
                setCurrentCatFact(CAT_FACTS[Math.floor(Math.random() * CAT_FACTS.length)]);
              }
              setShowCatFactPopup(!showCatFactPopup);
            }} className={getSidebarItemClass('CatFacts', `flex items-center py-3 px-3 rounded-xl cursor-pointer transition-all ${showCatFactPopup ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20 shadow-sm' : 'text-white/50 hover:bg-white/5 hover:text-white'} ${isSidebarOpen ? 'gap-3' : 'gap-0 justify-center'}`)}>
              <div className="w-8 h-8 flex items-center justify-center shrink-0">
                <Info className="w-5 h-5" />
              </div>
              <motion.div animate={{ opacity: isSidebarOpen ? 1 : 0, width: isSidebarOpen ? 'auto' : 0 }} className="flex flex-col justify-center overflow-hidden whitespace-nowrap">
                <span className="text-sm font-medium">Cat Facts</span>
              </motion.div>
            </div>

            <AnimatePresence>
              {showCatFactPopup && (
                <motion.div 
                  initial={{ opacity: 0, x: -10, y: 10 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  exit={{ opacity: 0, x: -10, y: 10 }}
                  className={`fixed bottom-8 ${isSidebarOpen ? 'left-[280px]' : 'left-[100px]'} w-80 p-6 rounded-2xl bg-[#1e1e1e]/95 backdrop-blur-xl border border-[#8d6e63]/40 shadow-[0_0_40px_rgba(0,0,0,0.8)] z-[9999] pointer-events-auto whitespace-normal`}
                >
                  <div className="flex items-center justify-between mb-3 text-[#8d6e63]">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      <span className="text-sm font-bold uppercase tracking-wider">Did you know?</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowCatFactPopup(false);
                      }}
                      className="text-white/40 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                      title="Close"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-[15px] text-[#E8D5B5] leading-relaxed italic font-medium">
                    "{currentCatFact}"
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>



      {/* Secondary Settings Sidebar */}
      <AnimatePresence>
        {isSettingsOpen && (
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 240, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="h-full bg-white/[0.02] border-r border-white/5 flex flex-col whitespace-nowrap overflow-hidden shrink-0 relative z-10 shadow-[4px_0_24px_rgba(0,0,0,0.3)]"
          >
            <div className="h-16 flex items-center px-6 border-b border-white/5 shrink-0">
              <span className="font-bold text-white">Settings</span>
            </div>
            <div className="flex-1 py-6 flex flex-col gap-2 overflow-y-auto">
              {[
                { name: 'Profile', icon: User },
                { name: 'Settings', icon: Settings },
                  { name: 'Shortcuts', icon: Keyboard },
                { name: 'User Policy', icon: Shield },
                { name: 'Theme', icon: LayoutTemplate },
                { name: 'Plans & Billing', icon: CreditCard },
                { name: 'Tutorial', icon: PlayCircle },
              ].map((tab) => (
                <div key={tab.name} onClick={() => {setActiveTab(tab.name); }} className={`flex items-center gap-4 py-2.5 rounded-xl cursor-pointer transition-all px-4 mx-4 ${activeTab === tab.name ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20 shadow-sm' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}>
                  <tab.icon className="w-4 h-4 shrink-0" />
                  <div className="text-sm font-medium">{tab.name}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}

      <div className="flex-1 flex flex-col overflow-hidden relative pt-10">
      <AnimatePresence>
        {isTourActive && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[1000] bg-black/60 backdrop-blur-md flex items-center justify-center p-12"
          >
            <div className="bg-[#f4ece1] border-4 border-[#8d6e63] p-10 rounded-[2rem] shadow-[0_0_80px_rgba(0,0,0,0.8)] max-w-lg w-full relative">
              <div className="absolute -top-6 -left-6 w-14 h-14 bg-[#8d6e63] rounded-full flex items-center justify-center shadow-lg text-[#f4ece1] font-bold text-2xl border-4 border-[#f4ece1]">
                {tourStep + 1}
              </div>
              <h2 className="text-4xl font-serif font-bold text-white mb-4 tracking-tight">{TOUR_STEPS[tourStep].title}</h2>
              <p className="text-white/80 text-xl mb-10 leading-relaxed font-sans">{TOUR_STEPS[tourStep].text}</p>
              <div className="flex justify-between items-center">
                <button onClick={() => setIsTourActive(false)} className="text-white/40 hover:text-white transition-colors uppercase tracking-widest text-sm font-bold border-b-2 border-transparent hover:border-[#8d6e63] pb-1">Skip Tour</button>
                <button onClick={handleNextTourStep} className="px-8 py-4 bg-[#3e2723] text-[#f4ece1] font-bold rounded-2xl hover:bg-[#5d4037] transition-all shadow-xl hover:shadow-2xl hover:scale-105 text-lg">
                  {tourStep < TOUR_STEPS.length - 1 ? 'Next' : 'Finish'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>


        <div className="flex-1 p-4 flex gap-4 overflow-hidden relative">
          <AnimatePresence mode="wait">
              {activeTab === 'Home' && (
              <motion.div key="home" variants={tabVariants} initial="initial" animate="animate" exit="exit" className="absolute inset-4 flex gap-4">
                <div className="flex-1 flex flex-col gap-4 relative z-10">
                  <FootprintManager contained={true} />
                  {/* Centered Fun Greeting Section */}
                  <div className="w-full flex flex-col items-center justify-center text-center relative z-20 pt-1 pb-1 select-none">
                    {/* Centered Greeting Heading with Interactive Paw Button */}
                    <div className="relative inline-flex items-center justify-center gap-3">
                      <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white flex items-center gap-2 drop-shadow-sm">
                        <span>{getTimeGreeting().text},</span>
                        <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 bg-clip-text text-transparent">
                          Ugine
                        </span>
                        <span className="text-2xl">{getTimeGreeting().icon}</span>
                      </h1>

                      {/* Interactive Bouncing Paw Button */}
                      <div className="relative">
                        <motion.button
                          type="button"
                          animate={isBooping ? { rotate: [-20, 20, -15, 15, 0], scale: [1, 1.25, 1] } : {}}
                          transition={{ duration: 0.45 }}
                          whileHover={{ scale: 1.15, rotate: 10 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={handleBoop}
                          className="p-2 rounded-2xl bg-[#5d4037]/50 hover:bg-orange-500/25 border border-[#8d6e63]/50 hover:border-orange-400/60 text-orange-300 shadow-md transition-all cursor-pointer flex items-center justify-center group"
                          title="Boop for a purr!"
                        >
                          <PawPrint className="w-5 h-5 text-orange-400 group-hover:text-orange-200 transition-colors drop-shadow" />
                        </motion.button>

                        {/* Floating Boop Reaction Particles */}
                        <AnimatePresence>
                          {boopParticles.map(particle => (
                            <motion.div
                              key={particle.id}
                              initial={{ opacity: 1, y: 0, scale: 0.8, x: particle.x }}
                              animate={{ opacity: 0, y: -40, scale: 1.15 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 1, ease: 'easeOut' }}
                              className="absolute -top-3 left-1/2 -translate-x-1/2 pointer-events-none whitespace-nowrap text-xs font-bold text-orange-200 bg-[#1e130f]/95 px-2.5 py-0.5 rounded-full border border-orange-500/40 shadow-xl backdrop-blur-sm z-50"
                            >
                              {particle.text}
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Fun Interactive Playful Subtitle */}
                    <motion.div 
                      key={funSubtitleIndex}
                      initial={{ opacity: 0, y: 3 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                      onClick={handleBoop}
                      className="mt-2 text-white/70 hover:text-white text-sm font-medium max-w-xl cursor-pointer flex items-center justify-center gap-1.5 transition-colors group px-2"
                      title="Click to shuffle fun kitty thoughts!"
                    >
                      <p className="leading-relaxed">
                        {FUN_SUBTITLES[funSubtitleIndex]}
                      </p>
                      <Sparkles className="w-3.5 h-3.5 text-orange-400/50 group-hover:text-orange-400 transition-colors shrink-0" />
                    </motion.div>
                  </div>
                  {/* Voice-to-Text Chat Box */}
                  <div className={`h-fit ${glassPanel} p-6 flex flex-col relative z-10 overflow-hidden shadow-2xl border border-white/10`}>
                    {/* Header */}
                    <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-4 shrink-0">
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={toggleHomeListening}
                          className={`w-10 h-10 rounded-xl border flex items-center justify-center shadow-sm transition-all active:scale-95 ${
                            isHomeListening
                              ? 'bg-red-500/20 border-red-500/40 text-red-400 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                              : 'bg-orange-500/15 border-orange-500/30 text-orange-400 hover:bg-orange-500/25 hover:scale-105'
                          }`}
                          title={isHomeListening ? 'Stop Listening' : 'Start Listening'}
                        >
                          {isHomeListening ? <Square className="w-5 h-5 fill-current" /> : <Mic className="w-5 h-5" />}
                        </button>
                        <div>
                          <h2 className="text-base font-semibold text-white tracking-wide flex items-center gap-2">
                            Voice-to-Text Studio
                            {isHomeListening && (
                              <span className="flex items-center gap-1.5 text-xs font-normal text-red-400 bg-red-500/15 px-2.5 py-0.5 rounded-full border border-red-500/30 animate-pulse">
                                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                                Listening...
                              </span>
                            )}
                          </h2>
                          <p className="text-xs text-white/60 font-medium">Speak naturally and convert your speech into copyable text</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                          {homeChatText && (
                            <>
                              <button
                                onClick={handleFormatWithAI}
                                disabled={isHomeTransforming}
                                className="p-2 text-white/40 hover:text-orange-400 hover:bg-white/5 rounded-xl transition-colors"
                                title="Format with AI"
                              >
                                <Sparkles className={`w-4 h-4 ${isHomeTransforming ? 'animate-spin text-orange-400' : ''}`} />
                              </button>
                              <button
                                onClick={handleClearHomeChat}
                                className="p-2 text-white/40 hover:text-red-400 hover:bg-white/5 rounded-xl transition-colors"
                                title="Clear text"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={handleCopyHomeChat}
                            disabled={!homeChatText.trim()}
                            className={`flex items-center justify-center p-2.5 rounded-xl transition-all ${
                              isHomeCopied
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : homeChatText.trim()
                                ? 'bg-white/10 hover:bg-white/15 text-white border border-white/15 shadow-sm active:scale-95'
                                : 'bg-white/5 text-white/30 border border-white/5 cursor-not-allowed'
                            }`}
                            title="Copy to Clipboard"
                          >
                            {isHomeCopied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                          </button>
                      </div>
                    </div>

                    {/* Control Toggles Bar */}
                    <div className="flex gap-4 mb-4 relative z-20">
                      {/* Whisper Mode Toggle */}
                      <div className="flex items-center justify-between bg-[#190f0b]/50 border border-[#5d4037]/40 p-2.5 px-4 rounded-2xl shadow-inner flex-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-white">
                          Whisper Mode
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            role="switch"
                            aria-checked={isWhisperMode}
                            onClick={() => setIsWhisperMode(!isWhisperMode)}
                            className={`relative inline-flex h-9 w-16 shrink-0 cursor-pointer rounded-full border-2 transition-all duration-300 ease-in-out p-0.5 items-center focus:outline-none ${
                              isWhisperMode
                                ? 'bg-gradient-to-r from-[#8d6e63] to-[#6d4c41] border-[#a1887f] shadow-[0_0_18px_rgba(141,110,99,0.5)]'
                                : 'bg-[#2b1f1a] border-[#5d4037]/60'
                            }`}
                            title={isWhisperMode ? "Disable Whisper Mode" : "Enable Whisper Mode"}
                          >
                            <span className="sr-only">Toggle Whisper Mode</span>
                            <motion.span
                              layout
                              transition={{ type: "spring", stiffness: 600, damping: 35 }}
                              className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-[#f4ece1] shadow-md flex items-center justify-center ${
                                isWhisperMode ? 'ml-auto text-white' : 'mr-auto text-[#8d6e63]'
                              }`}
                            >
                              <span className={`w-2.5 h-2.5 rounded-full ${isWhisperMode ? 'bg-[#5d4037]' : 'bg-[#8d6e63]/60'}`} />
                            </motion.span>
                          </button>
                          <div ref={whisperInfoRef} className="relative">
                            <button 
                              onClick={() => setShowWhisperInfo(!showWhisperInfo)}
                              className="p-1.5 rounded-full text-[#E8D5B5]/70 hover:text-[#E8D5B5] hover:bg-[#5d4037]/40 transition-colors relative z-20 cursor-pointer"
                              title="Info"
                            >
                              <Info className="w-5 h-5" />
                            </button>
                            <AnimatePresence>
                              {showWhisperInfo && (
                                <motion.div 
                                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                  className="absolute top-full mt-2 right-0 w-56 bg-[#2B1F1A] border border-[#5D4037]/50 rounded-xl p-3 shadow-2xl z-50 pointer-events-auto"
                                >
                                  <div className="absolute -top-1.5 right-4 w-3 h-3 bg-[#2B1F1A] border-t border-l border-[#5D4037]/50 rotate-45" />
                                  <div className="text-[11px] text-[#E8D5B5] leading-relaxed relative z-10 font-medium">
                                    Whisper Mode lets you talk very softly and slowly into the mic. It automatically heightens sensitivity and increases pause tolerance.
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </div>

                      {/* Moods Toggle */}
                      <div className="flex items-center justify-between bg-[#190f0b]/50 border border-[#5d4037]/40 p-2.5 px-4 rounded-2xl shadow-inner flex-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-white">
                          Moods
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            role="switch"
                            aria-checked={moodsEnabled}
                            onClick={() => setMoodsEnabled(!moodsEnabled)}
                            className={`relative inline-flex h-9 w-16 shrink-0 cursor-pointer rounded-full border-2 transition-all duration-300 ease-in-out p-0.5 items-center focus:outline-none ${
                              moodsEnabled
                                ? 'bg-gradient-to-r from-[#8d6e63] to-[#6d4c41] border-[#a1887f] shadow-[0_0_18px_rgba(141,110,99,0.5)]'
                                : 'bg-[#2b1f1a] border-[#5d4037]/60'
                            }`}
                            title={moodsEnabled ? "Disable Moods" : "Enable Moods"}
                          >
                            <span className="sr-only">Toggle Moods</span>
                            <motion.span
                              layout
                              transition={{ type: "spring", stiffness: 600, damping: 35 }}
                              className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-[#f4ece1] shadow-md flex items-center justify-center ${
                                moodsEnabled ? 'ml-auto text-white' : 'mr-auto text-[#8d6e63]'
                              }`}
                            >
                              <span className={`w-2.5 h-2.5 rounded-full ${moodsEnabled ? 'bg-[#5d4037]' : 'bg-[#8d6e63]/60'}`} />
                            </motion.span>
                          </button>
                          <div ref={moodsInfoRef} className="relative">
                            <button 
                              onClick={() => setShowMoodsInfo(!showMoodsInfo)}
                              className="p-1.5 rounded-full text-[#E8D5B5]/70 hover:text-[#E8D5B5] hover:bg-[#5d4037]/40 transition-colors relative z-20 cursor-pointer"
                              title="Info"
                            >
                              <Info className="w-5 h-5" />
                            </button>
                            <AnimatePresence>
                              {showMoodsInfo && (
                                <motion.div 
                                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                  className="absolute top-full mt-2 right-0 w-56 bg-[#2B1F1A] border border-[#5D4037]/50 rounded-xl p-3 shadow-2xl z-50 pointer-events-auto"
                                >
                                  <div className="absolute -top-1.5 right-4 w-3 h-3 bg-[#2B1F1A] border-t border-l border-[#5D4037]/50 rotate-45" />
                                  <div className="text-[11px] text-[#E8D5B5] leading-relaxed relative z-10 font-medium">
                                    WhisPURR aptly adds expressive emojis based on your Emotions and Undertones
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Textarea Area */}
                    <div className="relative flex flex-col min-h-0 h-48">
                      <textarea
                        value={homeChatText}
                        onChange={(e) => setHomeChatText(e.target.value)}
                        placeholder={
                          isHomeListening
                            ? 'Listening to your voice... Speak clearly into your microphone...'
                            : 'Click the Mic icon to speak, or type here directly to convert and copy anywhere...'
                        }
                        className="flex-1 w-full bg-black/40 border border-white/5 focus:border-orange-500/40 rounded-2xl p-5 text-white placeholder-white/40 resize-none outline-none font-sans text-base leading-relaxed transition-all shadow-inner"
                      />
                      
                      {/* Character & Word count */}
                      <div className="flex items-center justify-between pt-2 px-1 text-xs text-white/60 font-semibold shrink-0">
                        <div className="flex items-center gap-4">
                          <span>{homeChatText.trim() ? homeChatText.trim().split(/\s+/).length : 0} words</span>
                          <span>{homeChatText.length} characters</span>
                        </div>
                        {isHomeCopied && (
                          <span className="text-emerald-400 font-semibold animate-pulse">
                            ✓ Copied to clipboard! Ready to paste anywhere (Ctrl+V / Cmd+V)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`w-[320px] ${glassPanel} bg-black/40 p-6 flex flex-col relative z-10 overflow-hidden`}>
                  <div className="w-full flex-1 min-h-[160px] rounded-2xl bg-[#0f0f0f] mb-6 relative border border-white/5 flex flex-col items-center justify-center group overflow-hidden">
                    <motion.video 
                      key={homeVideo + videoKey}
                      variants={{
                        initial: { opacity: 0 },
                        animate: { opacity: 1, transition: { duration: 1.2, ease: "easeInOut" } },
                        exit: { opacity: 0 }
                      }}
                      src={homeVideo} 
                      autoPlay 
                      onEnded={() => {
                        setHomeVideo(prev => {
                          let next;
                          do {
                            next = VIDEOS[Math.floor(Math.random() * VIDEOS.length)];
                          } while (next === prev);
                          return next;
                        });
                        setVideoKey(prev => prev + 1);
                      }}
                      muted 
                      playsInline 
                      className="absolute inset-0 w-full h-full object-cover object-center"
                    />
                  </div>
                  
                  <h3 className="text-lg font-bold text-white mb-4 text-center border-b border-white/10 pb-3">Today's Impact</h3>
                  <div className="flex flex-col gap-4 items-center">
                    <div className="flex flex-col items-center justify-center p-4 w-full rounded-2xl bg-orange-500/10 border border-orange-500/20 shadow-[0_0_20px_rgba(249,115,22,0.05)]">
                      <div className="text-xs text-orange-200 mb-1 uppercase tracking-wider font-bold">Time Saved Today</div>
                      <div className="font-bold text-4xl text-orange-400">{timeSavedToday}</div>
                      <div className="text-xs text-orange-100 font-semibold mt-1.5 text-center tracking-tight px-1">
                        {timeSavedRelatableMessage}
                      </div>
                      <div className="text-xs text-orange-200 mt-2 font-semibold">Weekly Total: {timeSavedWeekHrs} Hours</div>
                    </div>
                    <div className="flex w-full gap-3">
                      <div className="flex-1 flex flex-col items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/5">
                        <Clock className="w-5 h-5 text-orange-400" />
                        <div className="text-center">
                          <div className="font-bold text-sm text-white">24m</div>
                          <div className="text-[10px] text-white/70 uppercase font-bold tracking-wider">Dictating</div>
                        </div>
                      </div>
                      <div className="flex-1 flex flex-col items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/5">
                        <FileText className="w-5 h-5 text-orange-400" />
                        <div className="text-center">
                          <div className="font-bold text-sm text-white">3.4k</div>
                          <div className="text-[10px] text-white/70 uppercase font-bold tracking-wider">Words</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'History' && (
              <motion.div key="history" variants={tabVariants} initial="initial" animate="animate" exit="exit" className={`absolute inset-4 flex flex-col gap-6 p-8 overflow-y-auto ${glassPanel}`}>
                <div className="px-2 shrink-0">
                  <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                    <Clock className="text-[#8d6e63] w-8 h-8" />
                    History
                  </h1>
                  <p className="text-white/80 font-medium text-sm">Review your past transcriptions and track your WhisPURR usage.</p>
                </div>
                
                {/* Stats Brown Box */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#2b1f1a]/90 border border-[#5d4037]/60 rounded-3xl p-6 shrink-0 shadow-xl">
                  <div className="flex flex-col items-center justify-center p-4 bg-[#190f0b]/50 rounded-2xl border border-[#5d4037]/40 shadow-inner">
                    <span className="text-white/60 text-xs font-bold uppercase tracking-widest mb-2">Current Streak</span>
                    <div className="text-3xl font-bold text-[#f4ece1] flex items-center gap-2">
                      <Sparkles className="w-6 h-6 text-orange-400" />
                      4 Days
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-center p-4 bg-[#190f0b]/50 rounded-2xl border border-[#5d4037]/40 shadow-inner">
                    <span className="text-white/60 text-xs font-bold uppercase tracking-widest mb-2">Total Words</span>
                    <div className="text-3xl font-bold text-[#f4ece1]">
                      12,450
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-center p-4 bg-[#190f0b]/50 rounded-2xl border border-[#5d4037]/40 shadow-inner">
                    <span className="text-white/60 text-xs font-bold uppercase tracking-widest mb-2">Hours Saved</span>
                    <div className="text-3xl font-bold text-[#f4ece1]">
                      3.5h
                    </div>
                  </div>
                </div>

                {/* Past Conversations List */}
                <div className="flex flex-col gap-3 flex-1 overflow-y-auto pr-2 pb-10">
                  <h3 className="text-white/70 font-bold uppercase tracking-widest text-xs mb-2 mt-4 px-2">Recent Dictations</h3>
                  {[
                    { date: 'Today, 10:42 AM', mode: 'Developer', text: 'Task: Resolve login bug.\nImpact: Critical. The authentication token is expiring prematurely in the new build.' },
                    { date: 'Today, 9:15 AM', mode: 'Casual', text: 'I am going to be a bit late to the standup. Start without me!' },
                    { date: 'Yesterday, 4:30 PM', mode: 'Formal', text: 'Please review the attached Q3 financial reports and provide your feedback by Friday.' },
                    { date: 'Yesterday, 2:00 PM', mode: 'Prompts', text: 'Write a robust Python script using type hints to parse the customer feedback CSV and extract common keywords.' },
                  ].map((conv, i) => (
                    <div key={i} className="flex flex-col gap-2 p-5 bg-[#5d4037]/5 hover:bg-[#5d4037]/10 transition-colors border border-[#5d4037]/20 rounded-2xl cursor-pointer shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-white/70 text-xs font-bold">{conv.date}</span>
                        <span className="px-2 py-1 bg-[#5d4037]/20 border border-[#5d4037]/30 rounded-md text-[10px] text-white font-black uppercase tracking-wider">{conv.mode}</span>
                      </div>
                      <p className="text-white/90 text-sm leading-relaxed whitespace-pre-wrap font-serif italic font-medium mt-1">"{conv.text}"</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'Dictionary' && (
              <motion.div key="dict" variants={tabVariants} initial="initial" animate="animate" exit="exit" className={`absolute inset-4 flex flex-col gap-6 p-8 overflow-y-auto ${glassPanel}`}>
                <div className="px-2">
                  <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                    <BookOpen className="text-orange-400 w-8 h-8" />
                    Dictionary
                  </h1>
                  <p className="text-white/40 text-sm">Teach WhisPURR to correctly transcribe unique names, technical jargon, and words it frequently mishears.</p>
                </div>
                <div className="flex gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 items-end shadow-lg">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-white/40 mb-2 uppercase tracking-wider">When I say...</label>
                    <div className="relative">
                      <input type="text" placeholder="e.g. Ty-scrip" value={spokenInput} onChange={(e) => setSpokenInput(e.target.value)} className={`${glassInput} w-full pr-12`} />
                      <button onClick={startDictListening} title="Speak" className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors ${isDictListening ? 'bg-orange-500/20 text-orange-400 animate-pulse' : 'text-white/30 hover:bg-white/10 hover:text-white'}`}>
                        <Mic className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-white/40 mb-2 uppercase tracking-wider">It actually means...</label>
                    <input type="text" placeholder="e.g. TypeScript" value={correctInput} onChange={(e) => setCorrectInput(e.target.value)} className={`${glassInput} w-full`} />
                  </div>
                  <button onClick={addDictItem} className={`${glassButton} h-[52px]`}>Teach</button>
                </div>
                <div className="flex-1 flex flex-col gap-3 mt-4">
                  <div className="grid grid-cols-2 px-6 py-2 text-xs font-bold text-white/30 uppercase tracking-widest border-b border-white/5">
                    <div>What you speak</div>
                    <div>What it means</div>
                  </div>
                  <AnimatePresence>
                    {dictItems.map(item => (
                      <motion.div key={item.id} layout initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="grid grid-cols-2 px-6 py-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/10 hover:border-white/10 transition-colors group items-center text-sm shadow-sm">
                        <div className="font-medium text-white/70">{item.spoken}</div>
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-orange-300">{item.correct}</span>
                          <button onClick={() => setDictItems(dictItems.filter(i => i.id !== item.id))} className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-red-400 transition-all p-2">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {dictItems.length === 0 && <div className="text-center text-white/30 py-12 italic text-sm">Your Kat's dictionary is empty.</div>}
                </div>
              </motion.div>
            )}

            {activeTab === 'ShortHand' && (
              <motion.div key="shortcuts" variants={tabVariants} initial="initial" animate="animate" exit="exit" className={`absolute inset-4 flex flex-col gap-6 p-8 overflow-y-auto ${glassPanel}`}>
                <div className="px-2">
                  <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                    <Zap className="text-orange-400 w-8 h-8" />
                    ShortHand
                  </h1>
                  <p className="text-white/40 text-sm">Automatically expand quick voice triggers into long-form templates.</p>
                </div>
                <div className="flex gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 shadow-lg">
                  <div className="w-1/3">
                    <label className="block text-xs font-bold text-white/40 mb-2 uppercase tracking-wider">When I say...</label>
                    <div className="relative">
                      <input type="text" placeholder="e.g. my address" value={triggerInput} onChange={(e) => setTriggerInput(e.target.value)} className={`${glassInput} w-full pr-12`} />
                      <button onClick={startDictListening} className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors ${isDictListening ? 'bg-orange-500/20 text-orange-400 animate-pulse' : 'text-white/30 hover:bg-white/10 hover:text-white'}`}>
                        <Mic className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col">
                    <label className="block text-xs font-bold text-white/40 mb-2 uppercase tracking-wider">Expand it to...</label>
                    <textarea placeholder="e.g. 123 Main St..." value={expansionInput} onChange={(e) => setExpansionInput(e.target.value)} rows={2} className={`${glassInput} w-full resize-none`} />
                  </div>
                  <div className="flex items-end">
                    <button onClick={addShortcutItem} className={`${glassButton} h-[52px] shrink-0`}>Teach</button>
                  </div>
                </div>
                <div className="flex-1 flex flex-col gap-3 mt-4">
                  <div className="grid grid-cols-3 px-6 py-2 text-xs font-bold text-white/30 uppercase tracking-widest border-b border-white/5">
                    <div className="col-span-1">Voice Trigger</div>
                    <div className="col-span-2">Expanded Output</div>
                  </div>
                  <AnimatePresence>
                    {shortcutItems.map(item => (
                      <motion.div key={item.id} layout initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="grid grid-cols-3 px-6 py-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/10 hover:border-white/10 transition-colors group items-start gap-6 text-sm shadow-sm">
                        <div className="font-medium text-white/70 col-span-1 mt-1.5">"{item.trigger}"</div>
                        <div className="col-span-2 flex justify-between items-start gap-4">
                          <div className="text-orange-200/80 whitespace-pre-wrap font-mono text-sm bg-black/30 p-4 rounded-lg flex-1 border border-white/5">{item.expansion}</div>
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all shrink-0 mt-2">
                            <button onClick={() => editShortcutItem(item)} className="text-white/30 hover:text-orange-400 p-2"><Pencil className="w-4 h-4" /></button>
                            <button onClick={() => setShortcutItems(shortcutItems.filter(i => i.id !== item.id))} className="text-white/30 hover:text-red-400 p-2"><X className="w-4 h-4" /></button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {shortcutItems.length === 0 && <div className="text-center text-white/30 py-12 italic text-sm">No voice macros configured yet.</div>}
                </div>
              </motion.div>
            )}

            {activeTab === 'ScratchPad' && (
              <motion.div key="stickynotes" variants={tabVariants} initial="initial" animate="animate" exit="exit" className={`absolute inset-4 flex flex-col p-8 overflow-hidden ${glassPanel}`}>
                <div className="px-2 mb-8 shrink-0">
                  <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                    <FileText className="text-orange-400 w-8 h-8" />
                    ScratchPad
                  </h1>
                  <p className="text-white/40 text-sm">Jot down your thoughts instantly. Click any note to focus.</p>
                </div>
                <div className="flex-1 relative w-full h-full">
                  {stickyNotes.map((note, index) => (
                    <motion.div
                      key={note.id}
                      onClick={() => setActiveNoteId(note.id)}
                      layoutId={`note-${note.id}`}
                      initial={{ rotate: note.rotation, x: note.x, y: note.y }}
                      whileHover={{ scale: 1.05, rotate: 0, zIndex: 40 }}
                      className={`absolute w-56 h-56 p-5 rounded-sm shadow-lg cursor-pointer flex flex-col ${note.color} text-white`}
                      style={{ 
                        top: `${10 + (index % 2) * 35}%`, 
                        left: `${5 + index * 22}%`,
                        boxShadow: '4px 4px 15px rgba(0,0,0,0.3), inset -2px -2px 10px rgba(0,0,0,0.05)'
                      }}
                    >
                      <div className="w-full flex-1 overflow-hidden pointer-events-none">
                        <p className="text-sm font-medium whitespace-pre-wrap leading-relaxed">{note.text}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                {/* Enlarged Note Overlay */}
                <AnimatePresence>
                  {activeNoteId !== null && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 z-50 flex items-center justify-center p-8 bg-black/50 backdrop-blur-md"
                      onClick={() => setActiveNoteId(null)}
                    >
                      {stickyNotes.find(n => n.id === activeNoteId) && (
                        <motion.div
                          layoutId={`note-${activeNoteId}`}
                          onClick={(e) => e.stopPropagation()}
                          className={`w-full max-w-lg h-96 p-8 rounded-md shadow-2xl flex flex-col relative ${stickyNotes.find(n => n.id === activeNoteId)?.color} text-white`}
                          style={{ boxShadow: '8px 8px 30px rgba(0,0,0,0.5)' }}
                        >
                          <button 
                            onClick={() => setActiveNoteId(null)}
                            className="absolute top-4 right-4 p-2 text-white/60 hover:text-white hover:bg-[#3e2723]/10 rounded-full transition-colors z-10"
                          >
                            <X className="w-5 h-5" />
                          </button>
                          <textarea
                            value={stickyNotes.find(n => n.id === activeNoteId)?.text}
                            onChange={(e) => setStickyNotes(notes => notes.map(n => n.id === activeNoteId ? { ...n, text: e.target.value } : n))}
                            className="w-full h-full bg-transparent resize-none outline-none font-medium text-xl leading-relaxed placeholder-[#3e2723]/40 whitespace-pre-wrap relative z-0"
                            placeholder="Type your note here..."
                            autoFocus
                          />
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {(activeTab === 'Modes' || activeTab === 'Context') && (
              <motion.div key="context" variants={tabVariants} initial="initial" animate="animate" exit="exit" className={`absolute inset-4 flex flex-col p-4 md:p-6 overflow-hidden ${glassPanel}`}>
                <StylesManager 
                  currentMode={mode || 'Professional'} 
                  setMode={setMode}
                />
              </motion.div>
            )}
          
                        {activeTab === 'Shortcuts' && (
              <motion.div id="shortcuts-tab-scroll" key="shortcuts" variants={tabVariants} initial="initial" animate="animate" exit="exit" className="absolute inset-4 overflow-y-auto pr-2 pb-16 custom-scrollbar">
                <div className="flex flex-col gap-6 max-w-4xl mx-auto">
                  <div className="px-2 mt-4">
                    <h1 className="text-3xl font-bold tracking-tight mb-2 text-white">Keyboard Shortcuts</h1>
                    <p className="text-white/50 text-sm">Customize how you interact with WhisPURR via your keyboard.</p>
                  </div>
                  
                  <div className={`mt-4 ${glassPanel} p-8 flex flex-col gap-6`}>
                    <div className="flex items-center justify-between pb-6 border-b border-white/5">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-xl font-bold text-white tracking-tight">Talk to WhisPURR</span>
                        <span className="text-[15px] text-white/50">Hold this key to transcribe your words into text</span>
                      </div>
                      <button 
                        onClick={() => setIsRecordingShortcut(true)}
                        className={`min-w-[120px] px-6 py-4 rounded-xl border-2 font-mono text-base tracking-wider font-bold transition-all shadow-md ${
                          isRecordingShortcut 
                            ? 'bg-orange-500/20 text-orange-400 border-orange-500 animate-pulse' 
                            : 'bg-[#1a1a1a] text-[#f4ece1] border-white/10 hover:border-orange-500/50 hover:bg-[#222]'
                        }`}
                      >
                        {isRecordingShortcut ? 'Press a key...' : talkShortcut}
                      </button>
                    </div>

                    <div className="flex items-center justify-between pb-6 border-b border-white/5">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-xl font-bold text-white tracking-tight">Quicklaunch</span>
                        <span className="text-[15px] text-white/50">Double tap this key to open or close WhisPURR</span>
                      </div>
                      <button 
                        onClick={() => setIsRecordingQuicklaunch(true)}
                        className={`min-w-[120px] px-6 py-4 rounded-xl border-2 font-mono text-base tracking-wider font-bold transition-all shadow-md ${
                          isRecordingQuicklaunch 
                            ? 'bg-orange-500/20 text-orange-400 border-orange-500 animate-pulse' 
                            : 'bg-[#1a1a1a] text-[#f4ece1] border-white/10 hover:border-orange-500/50 hover:bg-[#222]'
                        }`}
                      >
                        {isRecordingQuicklaunch ? 'Press a key...' : quicklaunchShortcut}
                      </button>
                    </div>

                    <div className="flex items-center justify-between pb-6 border-b border-white/5">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-xl font-bold text-white tracking-tight">Quick Edit</span>
                        <span className="text-[15px] text-white/50">Edits the last sentence you typed</span>
                      </div>
                      <button 
                        onClick={() => setIsRecordingQuickEdit(true)}
                        className={`min-w-[120px] px-6 py-4 rounded-xl border-2 font-mono text-base tracking-wider font-bold transition-all shadow-md ${
                          isRecordingQuickEdit 
                            ? 'bg-orange-500/20 text-orange-400 border-orange-500 animate-pulse' 
                            : 'bg-[#1a1a1a] text-[#f4ece1] border-white/10 hover:border-orange-500/50 hover:bg-[#222]'
                        }`}
                      >
                        {isRecordingQuickEdit ? 'Press combo...' : quickEditShortcut}
                      </button>
                    </div>

                    {/* Seamless Switch & Radial Dials */}
                    <div className="flex flex-col gap-5 pt-6 border-t border-white/5">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-white tracking-tight">Seamless Switch (Dual Radial Dials)</span>
                            <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-md bg-orange-500/20 text-orange-300 border border-orange-500/30">
                              OS HUD
                            </span>
                          </div>
                          <span className="text-[15px] text-white/50">
                            Switch between tone modes and target languages directly from anywhere on your desktop.
                          </span>
                        </div>
                        <button 
                          onClick={() => {
                            const next = !isSeamlessSwitchEnabled;
                            setIsSeamlessSwitchEnabled(next);
                            localStorage.setItem('whispurr_seamless_switch', String(next));
                          }}
                          className={`relative w-[68px] h-[36px] rounded-full transition-colors shadow-inner shrink-0 ${
                            isSeamlessSwitchEnabled ? 'bg-orange-500' : 'bg-white/10'
                          }`}
                        >
                          <div className={`absolute top-1 bottom-1 w-7 bg-white rounded-full transition-transform shadow-md ${
                            isSeamlessSwitchEnabled ? 'left-[36px]' : 'left-1'
                          }`} />
                        </button>
                      </div>

                      {/* Instructions Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                        {/* Right Dial: Modes */}
                        <div className="bg-[#1a1a1a]/80 border border-white/10 rounded-2xl p-4 flex flex-col gap-2 shadow-inner">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-orange-400">Right Dial: Modes</span>
                            <span className="px-2 py-0.5 bg-orange-500/15 border border-orange-500/30 text-orange-300 rounded font-mono text-[11px] font-bold">
                              Alt + Scroll
                            </span>
                          </div>
                          <p className="text-xs text-white/75 leading-relaxed">
                            Hold <kbd className="px-1.5 py-0.5 bg-white/10 border border-white/20 rounded text-[#f4ece1] font-mono text-[11px]">Alt</kbd> anywhere and <strong>scroll</strong> (or press <kbd className="px-1.5 py-0.5 bg-white/10 border border-white/20 rounded text-[#f4ece1] font-mono text-[11px]">↑</kbd> / <kbd className="px-1.5 py-0.5 bg-white/10 border border-white/20 rounded text-[#f4ece1] font-mono text-[11px]">↓</kbd>) to cycle through your tone modes on the right radial dial.
                          </p>
                        </div>

                        {/* Left Dial: Languages */}
                        <div className="bg-[#1a1a1a]/80 border border-white/10 rounded-2xl p-4 flex flex-col gap-2 shadow-inner">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Left Dial: Languages</span>
                            <span className="px-2 py-0.5 bg-amber-500/15 border border-amber-500/30 text-amber-300 rounded font-mono text-[11px] font-bold">
                              Alt + Right Click / →
                            </span>
                          </div>
                          <p className="text-xs text-white/75 leading-relaxed">
                            Hold <kbd className="px-1.5 py-0.5 bg-white/10 border border-white/20 rounded text-[#f4ece1] font-mono text-[11px]">Alt</kbd> and <strong>right-click</strong> (or press <kbd className="px-1.5 py-0.5 bg-white/10 border border-white/20 rounded text-[#f4ece1] font-mono text-[11px]">→</kbd> / <kbd className="px-1.5 py-0.5 bg-white/10 border border-white/20 rounded text-[#f4ece1] font-mono text-[11px]">←</kbd>) to switch to the languages dial, then <strong>scroll</strong> to select your language.
                          </p>
                        </div>
                      </div>

                      {/* Customise Languages to Showcase */}
                      <div className="flex flex-col gap-3 bg-[#1a1a1a]/50 border border-white/10 rounded-2xl p-4 md:p-5 mt-1">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div>
                            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                              <span>Showcased Languages on Dial</span>
                              <span className="text-xs text-amber-400 font-mono">({dialLanguages.length} active)</span>
                            </h3>
                            <p className="text-xs text-white/50 mt-0.5">
                              Click languages to customize which ones are showcased on the left radial dial.
                            </p>
                          </div>
                          <button 
                            onClick={() => {
                              const resetLangs = ['AutoDetect', 'English', 'Hindi'];
                              setDialLanguages(resetLangs);
                              localStorage.setItem('whispurr_dial_languages', JSON.stringify(resetLangs));
                              window.dispatchEvent(new CustomEvent('whispurr_dial_config_changed'));
                            }}
                            className="text-[11px] text-white/40 hover:text-white/80 transition-colors underline cursor-pointer"
                          >
                            Reset to defaults
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2 pt-1">
                          {ALL_DIAL_LANGUAGES.map(lang => {
                            const isSelected = dialLanguages.includes(lang);
                            return (
                              <button
                                key={lang}
                                onClick={() => toggleDialLanguage(lang)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer border ${
                                  isSelected
                                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.15)] font-semibold'
                                    : 'bg-white/5 text-white/50 border-white/5 hover:bg-white/10 hover:text-white/80 hover:border-white/15'
                                }`}
                              >
                                {isSelected ? <Check className="w-3.5 h-3.5 text-amber-400" /> : <Plus className="w-3.5 h-3.5 opacity-40" />}
                                <span>{lang}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Customise Modes to Showcase */}
                      <div className="flex flex-col gap-3 bg-[#1a1a1a]/50 border border-white/10 rounded-2xl p-4 md:p-5">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div>
                            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                              <span>Showcased Modes on Dial</span>
                              <span className="text-xs text-orange-400 font-mono">({dialModes.length} active)</span>
                            </h3>
                            <p className="text-xs text-white/50 mt-0.5">
                              Click modes to customize which ones are showcased on the right radial dial.
                            </p>
                          </div>
                          <button 
                            onClick={() => {
                              const resetModes = ['Formal', 'Casual', 'Developer', 'Prompts'];
                              setDialModes(resetModes);
                              localStorage.setItem('whispurr_dial_modes', JSON.stringify(resetModes));
                              window.dispatchEvent(new CustomEvent('whispurr_dial_config_changed'));
                            }}
                            className="text-[11px] text-white/40 hover:text-white/80 transition-colors underline cursor-pointer"
                          >
                            Reset to defaults
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2 pt-1">
                          {ALL_DIAL_MODES.map(m => {
                            const isSelected = dialModes.includes(m);
                            return (
                              <button
                                key={m}
                                onClick={() => toggleDialMode(m)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer border ${
                                  isSelected
                                    ? 'bg-orange-500/20 text-orange-300 border-orange-500/50 shadow-[0_0_10px_rgba(249,115,22,0.15)] font-semibold'
                                    : 'bg-white/5 text-white/50 border-white/5 hover:bg-white/10 hover:text-white/80 hover:border-white/15'
                                }`}
                              >
                                {isSelected ? <Check className="w-3.5 h-3.5 text-orange-400" /> : <Plus className="w-3.5 h-3.5 opacity-40" />}
                                <span>{m}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'Theme' && (
              <motion.div key="theme" variants={tabVariants} initial="initial" animate="animate" exit="exit" className="absolute inset-4 flex gap-4">
                <div className="flex-1 flex flex-col gap-6 max-w-4xl mx-auto">
                  <div className="px-2 mt-4">
                    <h1 className="text-3xl font-bold tracking-tight mb-2 text-white">Appearance</h1>
                    <p className="text-white/50 text-sm">Customize the look and feel of your WhisPURR interface.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-6 mt-4">
                    <div 
                      onClick={() => setCurrentTheme('midnight')}
                      className={`flex flex-col rounded-2xl border p-2 cursor-pointer transition-all ${currentTheme === 'midnight' ? 'border-orange-500 bg-orange-500/10' : 'border-white/10 bg-[#0f0f0f] hover:border-white/30'}`}
                    >
                      <div className="h-40 rounded-xl bg-black border border-white/10 mb-4 flex items-center justify-center overflow-hidden relative">
                         <div className="w-16 h-16 rounded-full bg-orange-500/20 flex items-center justify-center">
                           <LayoutTemplate className="w-8 h-8 text-orange-500" />
                         </div>
                      </div>
                      <div className="px-4 pb-4">
                        <div className="text-lg font-bold text-white mb-1">Dark Choco</div>
                        <div className="text-sm text-white/50">Deep chocolate tones for a rich, focused environment.</div>
                      </div>
                    </div>
                    
                    <div 
                      onClick={() => setCurrentTheme('coffee')}
                      className={`flex flex-col rounded-2xl border p-2 cursor-pointer transition-all ${currentTheme === 'coffee' ? 'border-orange-500 bg-orange-500/10' : 'border-white/10 bg-[#0f0f0f] hover:border-white/30'}`}
                    >
                      <div className="h-40 rounded-xl bg-[#f4ece1] border border-white/10 mb-4 flex items-center justify-center overflow-hidden relative">
                         <div className="w-16 h-16 rounded-full bg-[#8d6e63]/20 flex items-center justify-center">
                           <LayoutTemplate className="w-8 h-8 text-[#8d6e63]" />
                         </div>
                      </div>
                      <div className="px-4 pb-4">
                        <div className="text-lg font-bold text-white mb-1">Coffee Brown</div>
                        <div className="text-sm text-white/50">Warm beige and rich browns for a softer, organic reading experience.</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            
            {activeTab === 'Tutorial' && (
              <motion.div key="tutorial-tab" variants={tabVariants} initial="initial" animate="animate" exit="exit" className={`absolute inset-4 flex flex-col items-center justify-center gap-6 p-8 ${glassPanel}`}>
                <div className="w-24 h-24 bg-[#5d4037]/10 rounded-full flex items-center justify-center shadow-inner border border-[#5d4037]/20 mb-2">
                  <PlayCircle className="w-12 h-12 text-white/90" />
                </div>
                <h1 className="text-3xl font-bold text-white tracking-tight">WhisPURR Tutorial</h1>
                <p className="text-white/80 text-center max-w-md text-lg mb-4 font-medium">
                  Need a refresher? Replay the interactive setup tutorial to learn about WhisPURR's features, shortcuts, and modes.
                </p>
                <button
                  onClick={() => setShowTutorial(true)}
                  className="px-8 py-3 bg-gradient-to-r from-[#8d6e63] to-[#6d4c41] hover:from-[#795548] hover:to-[#5d4037] text-[#f4ece1] font-bold rounded-2xl flex items-center gap-3 transition-all shadow-[0_4px_20px_rgba(141,110,99,0.4)] hover:shadow-[0_6px_25px_rgba(141,110,99,0.6)] hover:-translate-y-0.5 border border-[#a1887f]/50"
                >
                  <PlayCircle className="w-5 h-5" />
                  Replay Tutorial
                </button>
              </motion.div>
            )}

            {activeTab === 'Settings' && (
              <motion.div key="settings" variants={tabVariants} initial="initial" animate="animate" exit="exit" className={`absolute inset-4 flex flex-col gap-6 p-8 overflow-y-auto ${glassPanel}`}>
                <div className="px-2 shrink-0">
                  <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                    <Settings className="text-[#8d6e63] w-8 h-8" />
                    Settings
                  </h1>
                  <p className="text-white/50 text-sm">Configure your system preferences and account settings.</p>
                </div>
                
                <div className="grid grid-cols-1 max-w-3xl gap-6 mt-4">
                  <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl shadow-sm">
                    <h3 className="text-lg font-bold text-white mb-4">General Preferences</h3>
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between p-4 rounded-xl bg-black/20 border border-white/5">
                        <div>
                          <div className="font-semibold text-white">Start on Boot</div>
                          <div className="text-sm text-white/50">Launch WhisPURR automatically when your system starts.</div>
                        </div>
                        <div className="w-12 h-6 bg-[#8d6e63] rounded-full relative cursor-pointer border border-[#8d6e63]/50">
                          <div className="absolute right-1 top-1 w-4 h-4 bg-[#f4ece1] rounded-full shadow-md"></div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-xl bg-black/20 border border-white/5">
                        <div>
                          <div className="font-semibold text-white">Hardware Acceleration</div>
                          <div className="text-sm text-white/50">Use GPU to make animations and interface buttery smooth.</div>
                        </div>
                        <div className="w-12 h-6 bg-[#8d6e63] rounded-full relative cursor-pointer border border-[#8d6e63]/50">
                          <div className="absolute right-1 top-1 w-4 h-4 bg-[#f4ece1] rounded-full shadow-md"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'Plans & Billing' && (
              <motion.div key="billing" variants={tabVariants} initial="initial" animate="animate" exit="exit" className={`absolute inset-4 flex flex-col gap-6 p-8 overflow-y-auto ${glassPanel}`}>
                <div className="px-2 shrink-0">
                  <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                    <CreditCard className="text-[#8d6e63] w-8 h-8" />
                    Plans & Billing
                  </h1>
                  <p className="text-white/50 text-sm">Manage your subscription and billing details.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
                  {/* Basic Plan */}
                  <div className="bg-white/[0.02] border border-white/5 p-8 rounded-2xl shadow-sm flex flex-col">
                    <h3 className="text-xl font-bold text-white mb-2">Kitten</h3>
                    <div className="text-3xl font-extrabold text-white mb-6">Free</div>
                    <ul className="text-white/60 space-y-3 mb-8 flex-1">
                      <li className="flex items-center gap-2 text-sm"><Check className="w-4 h-4 text-[#8d6e63]" /> 500 Daily Words</li>
                      <li className="flex items-center gap-2 text-sm"><Check className="w-4 h-4 text-[#8d6e63]" /> Standard Voice Engine</li>
                      <li className="flex items-center gap-2 text-sm"><Check className="w-4 h-4 text-[#8d6e63]" /> Community Support</li>
                    </ul>
                    <button className="w-full py-3 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-colors font-semibold">Current Plan</button>
                  </div>
                  
                  {/* Pro Plan */}
                  <div className="bg-[#8d6e63]/10 border border-[#8d6e63]/40 p-8 rounded-2xl shadow-[0_0_30px_rgba(141,110,99,0.15)] flex flex-col relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#8d6e63] text-[#f4ece1] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Most Popular</div>
                    <h3 className="text-xl font-bold text-white mb-2">Lion</h3>
                    <div className="text-3xl font-extrabold text-[#8d6e63] mb-6">$9<span className="text-lg text-white/50 font-medium">/mo</span></div>
                    <ul className="text-white/80 space-y-3 mb-8 flex-1">
                      <li className="flex items-center gap-2 text-sm"><Check className="w-4 h-4 text-[#8d6e63]" /> Unlimited Words</li>
                      <li className="flex items-center gap-2 text-sm"><Check className="w-4 h-4 text-[#8d6e63]" /> Advanced AI Engine</li>
                      <li className="flex items-center gap-2 text-sm"><Check className="w-4 h-4 text-[#8d6e63]" /> Priority Support</li>
                      <li className="flex items-center gap-2 text-sm"><Check className="w-4 h-4 text-[#8d6e63]" /> Adaptive Modes</li>
                    </ul>
                    <button className="w-full py-3 rounded-xl bg-[#8d6e63] text-[#f4ece1] hover:bg-[#795548] transition-colors font-bold shadow-md">Upgrade to Lion</button>
                  </div>

                  {/* Enterprise Plan */}
                  <div className="bg-white/[0.02] border border-white/5 p-8 rounded-2xl shadow-sm flex flex-col">
                    <h3 className="text-xl font-bold text-white mb-2">Panther</h3>
                    <div className="text-3xl font-extrabold text-white mb-6">$29<span className="text-lg text-white/50 font-medium">/mo</span></div>
                    <ul className="text-white/60 space-y-3 mb-8 flex-1">
                      <li className="flex items-center gap-2 text-sm"><Check className="w-4 h-4 text-[#8d6e63]" /> Everything in Lion</li>
                      <li className="flex items-center gap-2 text-sm"><Check className="w-4 h-4 text-[#8d6e63]" /> Custom AI Training</li>
                      <li className="flex items-center gap-2 text-sm"><Check className="w-4 h-4 text-[#8d6e63]" /> Team Management</li>
                      <li className="flex items-center gap-2 text-sm"><Check className="w-4 h-4 text-[#8d6e63]" /> API Access</li>
                    </ul>
                    <button className="w-full py-3 rounded-xl border border-white/10 text-white hover:bg-white/5 transition-colors font-semibold">Contact Sales</button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'User Policy' && (
              <motion.div key="policy" variants={tabVariants} initial="initial" animate="animate" exit="exit" className={`absolute inset-4 flex flex-col gap-6 p-8 overflow-y-auto ${glassPanel}`}>
                <div className="px-2 shrink-0 border-b border-white/5 pb-6">
                  <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                    <Shield className="text-[#8d6e63] w-8 h-8" />
                    User Policy & Privacy
                  </h1>
                  <p className="text-white/50 text-sm">We take your privacy and data security seriously.</p>
                </div>
                
                <div className="max-w-4xl text-white/80 space-y-8 px-2 pb-10">
                  <section>
                    <h2 className="text-xl font-bold text-white mb-3">1. Data Processing</h2>
                    <p className="leading-relaxed text-sm text-white/60 mb-2">
                      WhisPURR processes your voice data locally whenever possible. When utilizing cloud-based transcription models, audio is transmitted via end-to-end encrypted tunnels and is immediately discarded after transcription is complete. We do not store your voice recordings on our servers.
                    </p>
                  </section>
                  <section>
                    <h2 className="text-xl font-bold text-white mb-3">2. AI Training</h2>
                    <p className="leading-relaxed text-sm text-white/60 mb-2">
                      We firmly believe that your data is yours. WhisPURR will never use your personal transcriptions or dictation history to train our global AI models without your explicit, opt-in consent.
                    </p>
                  </section>
                  <section>
                    <h2 className="text-xl font-bold text-white mb-3">3. Telemetry & Analytics</h2>
                    <p className="leading-relaxed text-sm text-white/60 mb-2">
                      To improve our service, we collect anonymized telemetry data (such as error rates, transcription latency, and feature usage). This data contains no personally identifiable information (PII) and cannot be traced back to your individual account.
                    </p>
                  </section>
                </div>
              </motion.div>
            )}

            {activeTab === 'Profile' && (
              <motion.div key="profile" variants={tabVariants} initial="initial" animate="animate" exit="exit" className={`absolute inset-4 flex flex-col gap-4 p-6 overflow-hidden ${glassPanel}`}>
                <div className="px-2 shrink-0 border-b border-white/5 pb-4">
                  <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
                    <User className="text-[#8d6e63] w-8 h-8" />
                    Profile
                  </h1>
                  <p className="text-white/50 text-sm">Your personal dashboard and lifetime statistics.</p>
                </div>
                
                <div className="flex-1 flex flex-col items-center max-w-4xl mx-auto w-full py-2 min-h-0">
                  <div className="w-28 h-28 shrink-0 rounded-full bg-gradient-to-tr from-[#8d6e63] to-[#d7ccc8] flex items-center justify-center border-4 border-[#5d4037]/50 shadow-[0_0_50px_rgba(141,110,99,0.3)] mb-4">
                    <User className="w-14 h-14 text-white" strokeWidth={2} />
                  </div>
                  <h2 className="text-3xl font-extrabold text-white mb-1">Ugine</h2>
                  <div className="text-white/50 font-medium tracking-widest uppercase text-xs mb-8">Lion Plan Member</div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full mb-auto shrink-0">
                    <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm hover:bg-white/[0.04] transition-colors">
                      <div className="text-2xl font-bold text-white mb-1">45.2k</div>
                      <div className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">Words Spoken</div>
                    </div>
                    <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm hover:bg-white/[0.04] transition-colors">
                      <div className="text-2xl font-bold text-[#8d6e63] mb-1">16.5h</div>
                      <div className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">Time Saved</div>
                    </div>
                    <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm hover:bg-white/[0.04] transition-colors">
                      <div className="text-2xl font-bold text-white mb-1">Formal</div>
                      <div className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">Top Mode</div>
                    </div>
                    <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm hover:bg-white/[0.04] transition-colors">
                      <div className="text-2xl font-bold text-white mb-1">342</div>
                      <div className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">Shortcuts Used</div>
                    </div>
                  </div>

                  <div className="mt-auto pt-6 text-center text-white/30 italic text-sm font-medium shrink-0">
                    "Thank you for using WhisPURR"
                  </div>
                </div>
              </motion.div>
            )}

            {!['Home', 'History', 'Dictionary', 'ShortHand', 'ScratchPad', 'Modes', 'Context', 'Theme', 'Tutorial', 'Shortcuts', 'Settings', 'Plans & Billing', 'User Policy', 'Profile'].includes(activeTab) && (
              <motion.div key="fallback" variants={tabVariants} initial="initial" animate="animate" exit="exit" className={`absolute inset-4 flex flex-col items-center justify-center gap-4 p-8 ${glassPanel}`}>
                <Settings className="w-16 h-16 text-white/10" />
                <h1 className="text-2xl font-bold text-white/50">{activeTab}</h1>
                <p className="text-white/30 text-sm">This section is currently under construction.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Tutorial Overlay */}
        <AnimatePresence>
          {showTutorial && <Tutorial onComplete={() => { setShowTutorial(false); hasShownTutorialThisSession = true; setIsTourActive(true); }} />}
        </AnimatePresence>
      </div>
    </div>
    </>
  );
}








