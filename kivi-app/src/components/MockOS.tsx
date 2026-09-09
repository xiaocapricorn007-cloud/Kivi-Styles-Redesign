import { useState, useEffect, memo, useRef } from 'react';
import { Mail, Terminal, Sparkles, X, Minus, Wifi, Type, Mic, Pencil, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import WhispurrApp from './WhispurrApp';
import KiviCatIcon from './KiviCatIcon';
import FloatingDictationHUD from './FloatingDictationHUD';

type AppType = 'email' | 'vscode' | 'ai' | 'whispurr' | null;

let globalMouseX = typeof window !== 'undefined' ? window.innerWidth / 2 : 0;
let globalMouseY = typeof window !== 'undefined' ? window.innerHeight / 2 : 0;

if (typeof window !== 'undefined') {
  window.addEventListener('mousemove', (e) => {
    globalMouseX = e.clientX;
    globalMouseY = e.clientY;
  });
}

interface MockOSProps {
  activeText: string;
  transcript?: string;
  translatedText?: string;
  setTranslatedText?: (t: string) => void;
  mode?: string;
  setMode?: any;
  degree?: number;
  setDegree?: any;
  isAltPressed?: boolean;
  isLoading?: boolean;
  toggleListening?: any;
  simulateSpeech?: (phrase: string) => void;
  resetInputState?: () => void;
}

const MockOS = memo(({ 
  activeText, 
  transcript,
  translatedText,
  mode, 
  setMode, 
  degree, 
  setDegree, 
  isAltPressed, 
  isLoading, 
  toggleListening,
  simulateSpeech,
  resetInputState
}: MockOSProps) => {
  const [openApp, setOpenApp] = useState<AppType>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('app')) return params.get('app') as AppType;
      if (params.has('tab')) return 'whispurr';
      return null;
    } catch (e) {
      return null;
    }
  });
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  
  // Floating Strip State
  const [isHovered, setIsHovered] = useState(false);

  // Global Double Tap logic for Quicklaunch
  useEffect(() => {
    let lastTap = 0;
    const handleKeyDown = (e: KeyboardEvent) => {
      const savedShortcut = localStorage.getItem('whispurr_quicklaunch') || 'Ctrl';
      let key = e.key;
      if (key === ' ') key = 'Space';
      else if (key === 'Control') key = 'Ctrl';
      else if (key === 'Meta') key = 'Cmd';
      if (key.length === 1) key = key.toUpperCase();

      if (key === savedShortcut) {
        const now = Date.now();
        if (now - lastTap < 400) {
          // Double tap detected!
          setOpenApp(prev => prev === 'whispurr' ? null : 'whispurr');
          lastTap = 0;
        } else {
          lastTap = now;
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const [activePopup, setActivePopup] = useState<'styles' | 'scratchpad' | null>(null);
  const [scratchPadText, setScratchPadText] = useState("");

  const [showModeHud, setShowModeHud] = useState(false);
  const [hudPosition, setHudPosition] = useState({ x: 0, y: 0 });
  
  const [dialLangs, setDialLangs] = useState<string[]>(() => {
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

  const [modeRotation, setModeRotation] = useState(0);
  const [activeDial, setActiveDial] = useState<0 | 1>(0);
  const [langRotation, setLangRotation] = useState(0);
  
  const modeRef = useRef(mode);
  modeRef.current = mode;
  const activeDialRef = useRef(activeDial);
  activeDialRef.current = activeDial;
  const dialModesRef = useRef(dialModes);
  dialModesRef.current = dialModes;
  const dialLangsRef = useRef(dialLangs);
  dialLangsRef.current = dialLangs;

  // Listen for dynamic dial customizations from WhispurrApp Shortcuts tab
  useEffect(() => {
    const handleDialConfigChange = () => {
      try {
        const savedLangs = localStorage.getItem('whispurr_dial_languages');
        if (savedLangs) setDialLangs(JSON.parse(savedLangs));
        const savedModes = localStorage.getItem('whispurr_dial_modes');
        if (savedModes) setDialModes(JSON.parse(savedModes));
      } catch (e) {}
    };
    window.addEventListener('whispurr_dial_config_changed', handleDialConfigChange);
    return () => window.removeEventListener('whispurr_dial_config_changed', handleDialConfigChange);
  }, []);
  
  useEffect(() => {
    if (isAltPressed) {
      const idx = dialModesRef.current.indexOf(modeRef.current as string);
      setModeRotation(idx >= 0 ? idx : 0);
      setActiveDial(0);
      activeDialRef.current = 0;
    }
  }, [isAltPressed]);

  // Alt+Scroll or Alt+Arrow / Alt+Right-Click to change mode/lang
  useEffect(() => {
    if (!isAltPressed) return;
    
    const updateHudPosition = (overrideX?: number, overrideY?: number) => {
      const currentX = overrideX !== undefined ? overrideX : globalMouseX;
      const currentY = overrideY !== undefined ? overrideY : globalMouseY;

      let rawX = currentX;
      let rawY = currentY;
      
      const radius = 100;
      const padding = 70; // buffer for text widths
      
      if (rawX - radius - padding < 0) rawX = radius + padding;
      if (rawX + radius + padding > window.innerWidth) rawX = window.innerWidth - radius - padding;
      if (rawY - radius - 30 < 0) rawY = radius + 30;
      if (rawY + radius + 30 > window.innerHeight) rawY = window.innerHeight - radius - 30;
      
      setHudPosition({ x: rawX, y: rawY });
      setShowModeHud(true);
    };
    
    const cycleMode = (direction: 1 | -1, overrideX?: number, overrideY?: number) => {
      if (!setMode) return;
      const modesList = dialModesRef.current;
      setModeRotation(prev => {
        let nextRot = prev + direction;
        if (nextRot < 0) nextRot = 0;
        if (nextRot > modesList.length - 1) nextRot = Math.max(0, modesList.length - 1);
        if (modesList[nextRot]) {
          setMode(modesList[nextRot]);
        }
        return nextRot;
      });
      updateHudPosition(overrideX, overrideY);
    };

    const cycleLang = (direction: 1 | -1, overrideX?: number, overrideY?: number) => {
      const langsList = dialLangsRef.current;
      setLangRotation(prev => {
        let nextRot = prev + direction;
        if (nextRot < 0) nextRot = 0;
        if (nextRot > langsList.length - 1) nextRot = Math.max(0, langsList.length - 1);
        return nextRot;
      });
      updateHudPosition(overrideX, overrideY);
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (activeDialRef.current === 0) cycleMode(e.deltaY > 0 ? 1 : -1, e.clientX, e.clientY);
      else cycleLang(e.deltaY > 0 ? 1 : -1, e.clientX, e.clientY);
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      setActiveDial(prev => {
        const next = (prev === 0 ? 1 : 0) as 0 | 1;
        activeDialRef.current = next;
        return next;
      });
      updateHudPosition(e.clientX, e.clientY);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (activeDialRef.current === 0) cycleMode(1);
        else cycleLang(1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (activeDialRef.current === 0) cycleMode(-1);
        else cycleLang(-1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setActiveDial(1);
        activeDialRef.current = 1;
        updateHudPosition();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setActiveDial(0);
        activeDialRef.current = 0;
        updateHudPosition();
      }
    };
    
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isAltPressed, setMode]);

  // Auto-hide HUD or hide on Alt release
  useEffect(() => {
    if (!isAltPressed) {
      setShowModeHud(false);
      return;
    }
    
    if (showModeHud) {
      const timer = setTimeout(() => setShowModeHud(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [showModeHud, mode, isAltPressed, activeDial, langRotation]);

  // Local state for native typing
  const [emailText, setEmailText] = useState('');
  const [vscodeText, setVscodeText] = useState('');
  const [aiText, setAiText] = useState('');

  // Auto open Notes (from the Alt+Scroll workflow)
  useEffect(() => {
    if (mode === 'Notes' && !isAltPressed) {
      setOpenApp('whispurr');
    }
  }, [mode, isAltPressed]);

  // Floating Dictation HUD State & Automatic Typing Logic
  const [isHudOpen, setIsHudOpen] = useState(false);
  const autoDismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTypedTextRef = useRef<string>('');

  // Open HUD whenever Alt is held or speech begins
  useEffect(() => {
    if (isAltPressed) {
      if (autoDismissTimerRef.current) {
        clearTimeout(autoDismissTimerRef.current);
        autoDismissTimerRef.current = null;
      }
      setIsHudOpen(true);
    }
  }, [isAltPressed]);

  useEffect(() => {
    if (transcript && transcript.trim() && !isHudOpen) {
      if (autoDismissTimerRef.current) {
        clearTimeout(autoDismissTimerRef.current);
        autoDismissTimerRef.current = null;
      }
      setIsHudOpen(true);
    }
  }, [transcript]);

  // Determine current active destination app or text field
  const getDestinationApp = () => {
    if (openApp === 'email') return 'Outlook';
    if (openApp === 'vscode') return 'VS Code';
    if (openApp === 'ai') return 'Antigravity AI';
    if (openApp === 'whispurr') return 'WhisPURR';
    if (activePopup === 'scratchpad') return 'ScratchPad';
    const activeEl = document.activeElement;
    if (activeEl && (activeEl instanceof HTMLInputElement || activeEl instanceof HTMLTextAreaElement)) {
      return 'Active Text Field';
    }
    return null;
  };

  // Helper to insert text at the current cursor position in a focused text field
  const insertAtCursor = (text: string): boolean => {
    const activeEl = document.activeElement;
    if (
      activeEl &&
      (activeEl instanceof HTMLInputElement || activeEl instanceof HTMLTextAreaElement)
    ) {
      const start = activeEl.selectionStart ?? activeEl.value.length;
      const end = activeEl.selectionEnd ?? activeEl.value.length;
      const original = activeEl.value;
      const spaceBefore = start > 0 && !original.slice(0, start).endsWith(' ') && !original.slice(0, start).endsWith('\n') ? ' ' : '';
      const newText = original.slice(0, start) + spaceBefore + text + original.slice(end);

      const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set ||
                     Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
      if (setter) {
        setter.call(activeEl, newText);
      } else {
        activeEl.value = newText;
      }

      activeEl.dispatchEvent(new Event('input', { bubbles: true }));
      activeEl.dispatchEvent(new Event('change', { bubbles: true }));

      const newCursor = start + spaceBefore.length + text.length;
      activeEl.setSelectionRange(newCursor, newCursor);
      return true;
    }
    return false;
  };

  // Process text typing when final transformed text is ready
  useEffect(() => {
    const outputText = translatedText || activeText;
    if (!outputText || outputText.trim() === '' || isLoading) return;
    if (lastTypedTextRef.current === outputText) return;
    lastTypedTextRef.current = outputText;

    const destination = getDestinationApp();
    if (destination) {
      // 1. Try cursor insertion if an input/textarea is currently focused
      const insertedAtCursor = insertAtCursor(outputText);

      // 2. Only update state directly if not already handled by focused element cursor insertion
      if (!insertedAtCursor) {
        if (openApp === 'email') {
          setEmailText(prev => prev ? `${prev}\n${outputText}` : outputText);
        } else if (openApp === 'vscode') {
          setVscodeText(prev => prev ? `${prev}\n${outputText}` : outputText);
        } else if (openApp === 'ai') {
          setAiText(prev => prev ? `${prev} ${outputText}` : outputText);
        } else if (activePopup === 'scratchpad') {
          setScratchPadText(prev => prev ? `${prev}\n${outputText}` : outputText);
        }
      }

      if (openApp === 'whispurr') {
        window.dispatchEvent(new CustomEvent('whispurr-insert-text', { detail: outputText }));
      }

      // Auto-dismiss HUD after 4s since the text has been inserted into the app
      if (autoDismissTimerRef.current) clearTimeout(autoDismissTimerRef.current);
      autoDismissTimerRef.current = setTimeout(() => {
        setIsHudOpen(false);
      }, 4000);
    } else {
      // No active destination: User is on Desktop!
      // Keep HUD open with the prominent Copy button so the user can copy and paste from this dialogue box!
      setIsHudOpen(true);
    }
  }, [translatedText, activeText, isLoading, openApp, activePopup]);


  return (
    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center">
      <div className="absolute inset-0 bg-black/20" />

      {/* Taskbar */}
      {openApp !== 'whispurr' && (
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-black/40 backdrop-blur-xl border-t border-white/5 flex items-center justify-between px-4 z-50">
           <div className="w-48">
              <div 
                 className="w-10 h-10 hover:bg-white/10 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
                 onClick={() => setIsStartMenuOpen(!isStartMenuOpen)}
              >
                 <div className="grid grid-cols-2 gap-0.5">
                    <div className="w-2.5 h-2.5 bg-blue-500 rounded-sm" />
                    <div className="w-2.5 h-2.5 bg-blue-500 rounded-sm" />
                    <div className="w-2.5 h-2.5 bg-blue-500 rounded-sm" />
                    <div className="w-2.5 h-2.5 bg-blue-500 rounded-sm" />
                 </div>
              </div>
              
              <AnimatePresence>
                 {isStartMenuOpen && (
                    <motion.div 
                       initial={{ opacity: 0, y: 20 }}
                       animate={{ opacity: 1, y: 0 }}
                       exit={{ opacity: 0, y: 20 }}
                       className="absolute bottom-14 left-4 w-64 glass-dark rounded-xl border border-white/10 p-4 shadow-2xl flex flex-col gap-2"
                    >
                       <div className="text-white/50 text-xs font-bold uppercase tracking-wider mb-2">Pinned Apps</div>
                       <div className="flex items-center gap-3 text-white hover:bg-white/10 p-2 rounded cursor-pointer" onClick={() => {setOpenApp('whispurr'); setIsStartMenuOpen(false);}}>
                          <KiviCatIcon className="w-5 h-5 text-orange-400" />
                          <span className="font-medium text-sm">WhisPURR Settings</span>
                       </div>
                       <div className="flex items-center gap-3 text-white hover:bg-white/10 p-2 rounded cursor-pointer" onClick={() => {setOpenApp('ai'); setIsStartMenuOpen(false);}}>
                          <Sparkles className="w-5 h-5 text-purple-400" />
                          <span className="font-medium text-sm">Antigravity AI</span>
                       </div>
                    </motion.div>
                 )}
              </AnimatePresence>
           </div>

           <div className="flex items-center gap-2">
              <div 
                 onClick={() => openApp !== 'email' && setOpenApp('email')}
                 className={`w-8 h-8 rounded flex items-center justify-center cursor-pointer transition-colors ${openApp === 'email' ? 'bg-white/10 border-b-2 border-blue-400' : 'hover:bg-white/10'}`}
              >
                 <Mail className="w-5 h-5 text-blue-300" />
              </div>
              <div 
                 onClick={() => openApp !== 'vscode' && setOpenApp('vscode')}
                 className={`w-8 h-8 rounded flex items-center justify-center cursor-pointer transition-colors ${openApp === 'vscode' ? 'bg-white/10 border-b-2 border-blue-600' : 'hover:bg-white/10'}`}
              >
                 <Terminal className="w-5 h-5 text-blue-500" />
              </div>
              <div 
                 onClick={() => openApp !== 'ai' && setOpenApp('ai')}
                 className={`w-8 h-8 rounded flex items-center justify-center cursor-pointer transition-colors ${openApp === 'ai' ? 'bg-white/10 border-b-2 border-purple-400' : 'hover:bg-white/10'}`}
              >
                 <Sparkles className="w-5 h-5 text-purple-300" />
              </div>
              <div 
                 onClick={() => (openApp as string) !== 'whispurr' && setOpenApp('whispurr')}
                 className={`w-8 h-8 rounded flex items-center justify-center cursor-pointer transition-colors ${(openApp as string) === 'whispurr' ? 'bg-white/10 border-b-2 border-orange-400' : 'hover:bg-white/10'}`}
              >
                 <KiviCatIcon className="w-5 h-5 text-orange-400" />
              </div>
           </div>

           <div className="flex items-center gap-3 text-white w-48 justify-end cursor-pointer hover:bg-white/10 px-2 py-1 rounded transition-colors">
              <Wifi className="w-4 h-4" />
              <div className="flex flex-col items-end leading-tight text-xs font-medium">
                 <span>10:42 AM</span>
                 <span>9/3/2026</span>
              </div>
           </div>
        </div>
      )}

      {/* ALT+SCROLL MODE HUD (CIRCULAR) */}
      <AnimatePresence>
        {showModeHud && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, filter: 'blur(10px)' }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="fixed z-[100] pointer-events-none flex items-center justify-center w-0 h-0"
            style={{ left: hudPosition.x, top: hudPosition.y }}
          >
            <AnimatePresence>
              {activeDial === 0 && (
                <motion.div 
                  key="dial-0"
                  initial={{ x: 100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 100, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  className="absolute flex items-center justify-center w-0 h-0"
                >
                  <svg className="absolute pointer-events-none" style={{ width: 240, height: 240, left: -120, top: -120 }}>
                    <defs>
                      <linearGradient id="arcFadeShared0" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#E8D5B5" stopOpacity="0" />
                        <stop offset="20%" stopColor="#E8D5B5" stopOpacity="0.4" />
                        <stop offset="50%" stopColor="#E8D5B5" stopOpacity="1" />
                        <stop offset="80%" stopColor="#E8D5B5" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#E8D5B5" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d="M 120 10 A 110 110 0 0 1 120 230" fill="none" stroke="url(#arcFadeShared0)" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  {dialModes.map((m, i) => {
                    const diff = i - modeRotation;
                    const angle = diff * 25;
                    const angleRad = angle * (Math.PI / 180);
                    const radius = 145; 
                    const x = Math.cos(angleRad) * radius;
                    const y = Math.sin(angleRad) * radius;
                    const isActive = diff === 0;
                    const distance = Math.abs(diff);
                    const opacity = distance === 0 ? 1 : distance === 1 ? 0.65 : distance === 2 ? 0.25 : 0;
                    return (
                      <motion.div 
                        key={m} 
                        className="absolute" 
                        animate={{ x, y, scale: isActive ? 1.15 : 0.85, opacity }} 
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        style={{ pointerEvents: distance > 2 ? 'none' : 'auto' }}
                      >
                        <div className={`-translate-y-1/2 px-4 py-2 whitespace-nowrap font-bold transition-all ${isActive ? 'rounded-2xl shadow-xl backdrop-blur-3xl bg-[#5D4037]/90 text-[#E8D5B5] border border-[#3E2723]/50' : 'text-[#E8D5B5] drop-shadow-md'}`}>{m}</div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
              {activeDial === 1 && (
                <motion.div 
                  key="dial-1"
                  initial={{ x: -100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -100, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  className="absolute flex items-center justify-center w-0 h-0"
                >
                  <svg className="absolute pointer-events-none" style={{ width: 240, height: 240, left: -120, top: -120 }}>
                    <defs>
                      <linearGradient id="arcFadeShared1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#E8D5B5" stopOpacity="0" />
                        <stop offset="20%" stopColor="#E8D5B5" stopOpacity="0.4" />
                        <stop offset="50%" stopColor="#E8D5B5" stopOpacity="1" />
                        <stop offset="80%" stopColor="#E8D5B5" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#E8D5B5" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d="M 120 10 A 110 110 0 0 0 120 230" fill="none" stroke="url(#arcFadeShared1)" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  {dialLangs.map((m, i) => {
                    const diff = i - langRotation;
                    // Mirror to the left side and invert the vertical progression
                    const angle = 180 - diff * 25;
                    const angleRad = angle * (Math.PI / 180);
                    const radius = 145; 
                    const x = Math.cos(angleRad) * radius;
                    const y = Math.sin(angleRad) * radius;
                    const isActive = diff === 0;
                    const distance = Math.abs(diff);
                    const opacity = distance === 0 ? 1 : distance === 1 ? 0.65 : distance === 2 ? 0.25 : 0;
                    return (
                      <motion.div 
                        key={m} 
                        className="absolute right-0" 
                        animate={{ x, y, scale: isActive ? 1.15 : 0.85, opacity }} 
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        style={{ pointerEvents: distance > 2 ? 'none' : 'auto' }}
                      >
                        <div className={`-translate-y-1/2 px-4 py-2 whitespace-nowrap font-bold transition-all ${isActive ? 'rounded-2xl shadow-xl backdrop-blur-3xl bg-[#5D4037]/90 text-[#E8D5B5] border border-[#3E2723]/50' : 'text-[#E8D5B5] drop-shadow-md'}`}>{m}</div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

            {/* NEW RADIAL KIVI CONTROL STRIP */}
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ 
              y: (isAltPressed || isLoading || !!activeText) ? 0 : 50, 
              opacity: 1 
            }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className={`absolute bottom-0 left-[41.5%] -translate-x-1/2 z-[80] w-64 h-64 flex items-center justify-center rounded-full pointer-events-none`}
            onMouseLeave={() => { setIsHovered(false); setActivePopup(null); }}
          >
            <div 
              className={`relative w-32 h-32 flex items-center justify-center rounded-full pointer-events-auto`}
            >
            {/* Subtle Hover Glow Backdrop */}
            <AnimatePresence>
              {isHovered && !(isAltPressed || isLoading || !!activeText) && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className="absolute top-[-20px] left-[-20px] right-[-20px] bottom-1/2 bg-white/[0.02] rounded-t-full backdrop-blur-md border border-white/5 border-b-0 shadow-2xl origin-bottom"
                />
              )}
            </AnimatePresence>

            {/* Central Cat */}
            <div 
              onClick={(e) => { 
                if (!(isAltPressed || isLoading || !!activeText)) {
                  setIsHovered(prev => !prev);
                  if (activePopup) setActivePopup(null);
                  return;
                }
                if (e.detail === 1 && toggleListening) toggleListening(); 
              }}
              className={`flex items-center justify-center cursor-pointer transition-all duration-500 shadow-2xl relative z-10 overflow-hidden ${
                (isAltPressed || isLoading || !!activeText)
                  ? `w-12 h-12 rounded-full border-2 ${isAltPressed || isLoading ? 'border-[#8d6e63] shadow-[0_0_30px_rgba(141,110,99,0.5)] scale-110' : 'border-white/10 shadow-[0_0_15px_rgba(0,0,0,0.5)]'}`
                  : 'px-3 py-0.5 rounded-md bg-black/60 border border-white/10 text-white/50 text-xs font-mono hover:text-white hover:bg-black/80'
              }`}
            >
              {(isAltPressed || isLoading || !!activeText) ? (
                <KiviCatIcon className={`w-full h-full object-cover transition-all duration-500 ${
                  isLoading ? 'animate-pulse opacity-100' : 'opacity-100'
                }`} />
              ) : (
                <span>^-^</span>
              )}
            </div>

            <AnimatePresence>
              {isHovered && !(isAltPressed || isLoading || !!activeText) && (
                <>
                  {/* ScratchPad Satellite (Top Left) */}
                  <motion.div 
                    initial={{ opacity: 0, x: 0, y: 0, scale: 0.5 }}
                    animate={{ opacity: 1, x: -60, y: -30, scale: 1 }}
                    exit={{ opacity: 0, x: 0, y: 0, scale: 0.5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25, delay: 0 }}
                    onClick={() => setActivePopup(activePopup === 'scratchpad' ? null : 'scratchpad')}
                    className={`absolute w-9 h-9 rounded-full border shadow-xl flex items-center justify-center cursor-pointer transition-colors z-20 ${
                      activePopup === 'scratchpad' ? 'bg-white/20 border-white/30 text-white' : 'bg-[#1e1e1e] border-white/10 text-white/60 hover:bg-white/15 hover:text-white'
                    }`}
                  >
                    <Pencil className="w-4 h-4" />

                    <AnimatePresence>
                      {activePopup === 'scratchpad' && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.9, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9, y: 10 }}
                          className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 bg-[#1A1A1A]/95 backdrop-blur-3xl border border-white/10 rounded-2xl p-3 w-56 shadow-2xl flex flex-col gap-2 z-30 cursor-auto"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <textarea 
                            className="w-full h-24 bg-transparent resize-none outline-none text-white text-sm placeholder-white/30"
                            placeholder="Jot down a quick thought..."
                            value={scratchPadText}
                            onChange={(e) => setScratchPadText(e.target.value)}
                            autoFocus
                          />
                          <div 
                            className="flex items-center justify-center gap-2 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 py-1.5 rounded-lg cursor-pointer transition-colors text-xs font-medium"
                            onClick={() => {
                               if (scratchPadText.trim()) {
                                 window.dispatchEvent(new CustomEvent('add-sticky-note', { detail: scratchPadText }));
                                 setScratchPadText("");
                                 setActivePopup(null);
                               }
                            }}
                          >
                            <Check className="w-3 h-3" /> Save to App
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                  
                  {/* Context Satellite (Top Center) */}
                  <motion.div 
                    initial={{ opacity: 0, x: 0, y: 0, scale: 0.5 }}
                    animate={{ opacity: 1, x: 0, y: -65, scale: 1 }}
                    exit={{ opacity: 0, x: 0, y: 0, scale: 0.5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25, delay: 0.05 }}
                    onClick={() => setActivePopup(activePopup === 'styles' ? null : 'styles')}
                    className={`absolute w-9 h-9 rounded-full border shadow-xl flex items-center justify-center cursor-pointer transition-colors z-20 ${
                      activePopup === 'styles' ? 'bg-white/20 border-white/30 text-white' : 'bg-[#1e1e1e] border-white/10 text-white/60 hover:bg-white/15 hover:text-white'
                    }`}
                  >
                    <Type className="w-4 h-4" />
                    
                    <AnimatePresence>
                      {activePopup === 'styles' && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.9, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9, y: 10 }}
                          className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 bg-[#1A1A1A]/95 backdrop-blur-3xl border border-white/10 rounded-2xl p-2 w-40 shadow-2xl flex flex-col gap-1 z-30"
                        >
                          {(['Formal', 'Casual', 'Developer', 'Prompts'] as const).map(s => (
                            <div 
                              key={s}
                              onClick={(e) => { e.stopPropagation(); if(setMode) setMode(s as any); setActivePopup(null); }}
                              className={`px-3 py-2 text-sm rounded-xl cursor-pointer flex items-center gap-2 transition-colors ${mode === s ? 'bg-white/10 text-white font-medium' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}
                            >
                              {s}
                            </div>
                          ))}
                          <div className="flex bg-white/5 p-1 rounded-lg mt-1 border border-white/5">
                            <div onClick={(e) => { e.stopPropagation(); if(setDegree) setDegree(1); setActivePopup(null); }} className={`flex-1 text-center text-xs py-1.5 rounded-md cursor-pointer transition-colors ${degree === 1 ? 'bg-white/20 text-white shadow-sm' : 'text-white/40 hover:text-white/70'}`}>Roman</div>
                            <div onClick={(e) => { e.stopPropagation(); if(setDegree) setDegree(2); setActivePopup(null); }} className={`flex-1 text-center text-xs py-1.5 rounded-md cursor-pointer transition-colors ${degree === 2 ? 'bg-white/20 text-white shadow-sm' : 'text-white/40 hover:text-white/70'}`}>Native</div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Dictate Satellite (Top Right) */}
                  <motion.div 
                    initial={{ opacity: 0, x: 0, y: 0, scale: 0.5 }}
                    animate={{ opacity: 1, x: 60, y: -30, scale: 1 }}
                    exit={{ opacity: 0, x: 0, y: 0, scale: 0.5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25, delay: 0.1 }}
                    onClick={() => { if(toggleListening) toggleListening(); }}
                    className="absolute w-9 h-9 rounded-full bg-[#1e1e1e] border border-white/10 shadow-xl flex items-center justify-center cursor-pointer hover:bg-white/15 text-white/60 hover:text-white transition-colors z-20"
                  >
                    <Mic className="w-4 h-4" />
                  </motion.div>
                </>
              )}
            </AnimatePresence>
            </div>
          </motion.div>

      {/* FULL SCREEN APPS */}
      <AnimatePresence>
        {openApp && (
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="absolute inset-0 z-40 bg-[#1e1e1e] flex flex-col"
            style={{ height: openApp === 'whispurr' ? '100vh' : 'calc(100vh - 48px)' }}
          >
            {/* Standard Window Title Bar */}
            <div className={`h-10 flex items-center px-4 select-none ${openApp === 'whispurr' ? 'justify-end absolute top-0 right-0 z-50 bg-transparent w-full pointer-events-none' : 'justify-between bg-black/40 w-full'}`}>
              {openApp !== 'whispurr' && (
                <div className="flex items-center gap-2 text-white/70 text-xs font-medium">
                  {openApp === 'email' && <><Mail className="w-4 h-4"/> Outlook</>}
                  {openApp === 'vscode' && <><Terminal className="w-4 h-4"/> VS Code</>}
                  {openApp === 'ai' && <><Sparkles className="w-4 h-4"/> Antigravity Canvas</>}
                </div>
              )}
              <div className={`flex items-center gap-4 pointer-events-auto ${openApp === 'whispurr' ? 'text-[#5D4037]' : 'text-white/50'}`}>
                <Minus 
                  className={`cursor-pointer transition-colors ${openApp === 'whispurr' ? 'w-5 h-5 hover:text-[#3E2723]' : 'w-4 h-4 hover:text-white'}`} 
                  onClick={() => setOpenApp(null)} 
                />
                <X 
                  className={`cursor-pointer transition-colors ${openApp === 'whispurr' ? 'w-5 h-5 hover:text-red-700' : 'w-5 h-5 hover:text-red-500'}`} 
                  onClick={() => setOpenApp(null)}
                />
              </div>
            </div>

            {/* App Content */}
            <div className="flex-1 overflow-hidden">
              {openApp === 'email' && (
                <div className="flex h-full bg-white text-black">
                  <div className="w-64 border-r border-gray-200 p-4 bg-gray-50 flex flex-col gap-2">
                    <div className="font-bold text-gray-700 mb-2">Folders</div>
                    <div className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">Inbox</div>
                    <div className="text-sm hover:bg-gray-200 px-2 py-1 rounded cursor-pointer">Sent Items</div>
                    <div className="text-sm hover:bg-gray-200 px-2 py-1 rounded cursor-pointer">Drafts</div>
                  </div>
                  <div className="flex-1 p-8 flex flex-col gap-4 font-serif">
                    <h1 className="text-2xl font-semibold border-b pb-4">Daily Comms Update</h1>
                    <div className="flex-1 text-gray-800 leading-relaxed text-lg flex flex-col">
                      <p className="mb-4">Hi Team,</p>
                      <p className="mb-4">Just wanted to provide a quick update on the latest deployment. Everything is looking stable.</p>
                      <textarea 
                        className="flex-1 w-full bg-transparent resize-none outline-none text-orange-700 font-medium placeholder-gray-400"
                        placeholder="Type your message here..."
                        value={emailText}
                        onChange={e => setEmailText(e.target.value)}
                        autoFocus
                      />
                    </div>
                  </div>
                </div>
              )}

              {openApp === 'vscode' && (
                <div className="flex h-full bg-[#1e1e1e] text-[#d4d4d4] font-mono text-sm">
                  <div className="w-64 border-r border-[#333] p-4 bg-[#252526]">
                    <div className="text-xs font-bold tracking-wider text-gray-400 mb-4">EXPLORER</div>
                    <div className="text-blue-400 hover:text-blue-300 cursor-pointer">backend.ts</div>
                    <div className="text-gray-400 hover:text-gray-300 cursor-pointer mt-2">utils.ts</div>
                    <div className="text-gray-400 hover:text-gray-300 cursor-pointer mt-2">server.ts</div>
                  </div>
                  <div className="flex-1 p-6 leading-loose">
                    <p><span className="text-[#c586c0]">import</span> <span className="text-[#9cdcfe]">Server</span> <span className="text-[#c586c0]">from</span> <span className="text-[#ce9178]">'infrastructure'</span>;</p>
                    <br/>
                    <p><span className="text-[#c586c0]">async function</span> <span className="text-[#dcdcaa]">main</span>() {'{'}</p>
                    <p className="pl-4 text-[#6a9955]">// Initialize system</p>
                    <p className="pl-4">const server = new Server();</p>
                    <br/>
                    <p className="pl-4 text-[#6a9955]">// TODO: Implement fix</p>
                    <div className="pl-4 flex">
                       <input 
                         type="text" 
                         className="flex-1 bg-transparent outline-none text-[#4ec9b0] placeholder-[#6a9955]/50"
                         placeholder="type your code..."
                         value={vscodeText}
                         onChange={e => setVscodeText(e.target.value)}
                         spellCheck={false}
                         autoFocus
                       />
                    </div>
                    <p>{'}'}</p>
                  </div>
                </div>
              )}

              {openApp === 'ai' && (
                <div className="flex flex-col h-full bg-slate-950 items-center justify-center relative">
                  <div className="text-center">
                    <Sparkles className="w-16 h-16 text-purple-500/50 mx-auto mb-6" />
                    <h2 className="text-2xl font-bold text-white mb-2">Antigravity AI</h2>
                    <p className="text-gray-400 max-w-md mx-auto">
                      Hold <kbd className="px-2 py-1 bg-white/10 rounded-md text-white/80 mx-1 border border-white/20">Alt</kbd> anywhere in the OS to invoke Kivi and translate your speech.
                    </p>
                  </div>
                  
                  {/* Chat Input */}
                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[80%] max-w-2xl bg-white/5 border border-white/10 rounded-xl p-4 flex items-center shadow-2xl focus-within:border-purple-500/50 transition-colors">
                    <input 
                      type="text" 
                      className="flex-1 bg-transparent outline-none text-white placeholder-white/30 text-lg"
                      placeholder="Ask Antigravity anything..."
                      value={aiText}
                      onChange={e => setAiText(e.target.value)}
                      autoFocus
                    />
                  </div>
                </div>
              )}

              {openApp === 'whispurr' && <WhispurrApp mode={mode} setMode={setMode} />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FLOATING SPEECH & DICTATION DIALOGUE HUD */}
      <FloatingDictationHUD 
        isOpen={isHudOpen}
        isListening={!!isAltPressed}
        isProcessing={!!isLoading}
        transcript={transcript || ''}
        transformedText={translatedText || activeText || ''}
        mode={mode || 'Formal'}
        degree={degree}
        destinationApp={getDestinationApp()}
        onClose={() => {
          setIsHudOpen(false);
          if (autoDismissTimerRef.current) clearTimeout(autoDismissTimerRef.current);
          if (resetInputState) resetInputState();
        }}
        onSimulateSpeech={simulateSpeech}
      />
    </div>
  );
});

export default MockOS;
