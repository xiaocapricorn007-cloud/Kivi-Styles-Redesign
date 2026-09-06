import { useState, useEffect, memo } from 'react';
import { 
  Mail, 
  Terminal, 
  Sparkles, 
  X, 
  Minus, 
  Wifi, 
  Type, 
  FileText, 
  Check, 
  MessageCircle, 
  Briefcase, 
  Zap,
  MessageSquare,
  Send,
  CheckCheck,
  Phone,
  Video,
  Smile,
  Paperclip,
  Heart,
  Cpu
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import WhispurrApp from './WhispurrApp';
import KiviCatIcon from './KiviCatIcon';

type AppType = 'whatsapp' | 'email' | 'vscode' | 'ai' | 'whispurr' | null;

const MockOS = memo(({ activeText, mode, setMode, degree, setDegree, isAltPressed, isLoading, toggleListening }: { activeText: string, mode?: string, setMode?: any, degree?: number, setDegree?: any, isAltPressed?: boolean, isLoading?: boolean, toggleListening?: any }) => {
  const [openApp, setOpenApp] = useState<AppType>(null);
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  
  // Floating Strip State
  const [isHovered, setIsHovered] = useState(false);
  const [activePopup, setActivePopup] = useState<'styles' | null>(null);

  // Section 7: "Just this time" interaction state
  const [justThisTimeMode, setJustThisTimeMode] = useState<string | null>(null);
  const [pendingStylePrompt, setPendingStylePrompt] = useState<string | null>(null);

  // Effective style for transcription & display
  const effectiveMode = justThisTimeMode || mode || 'Professional';

  // Local state for native typing
  const [emailText, setEmailText] = useState('');
  const [vscodeText, setVscodeText] = useState('');
  const [aiText, setAiText] = useState('');

  // Adaptive Mode Global State
  const [isAdaptiveMode, setIsAdaptiveMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('whispurr_adaptive_mode');
      return saved !== null ? saved === 'true' : true;
    } catch (e) {
      return true;
    }
  });

  const toggleAdaptive = () => {
    setIsAdaptiveMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('whispurr_adaptive_mode', String(next));
      } catch (e) {}
      return next;
    });
  };

  // Automatically adapt style based on open app when Adaptive Mode is active
  useEffect(() => {
    if (!openApp || !isAdaptiveMode) return;
    if (openApp === 'whatsapp') {
      if (setMode) setMode('Casual');
    } else if (openApp === 'email') {
      if (setMode) setMode('Professional');
    } else if (openApp === 'vscode') {
      if (setMode) setMode('Technical');
    }
  }, [openApp, isAdaptiveMode]);

  // Screen 7: Real Scenario Demo (WhatsApp) State
  const [whatsappMessages, setWhatsappMessages] = useState<Array<{ sender: string; text: string; time: string }>>([
    { sender: 'alex', text: 'Hey! Any update on the quarterly report? Client meeting is soon.', time: '10:38 AM' }
  ]);
  const [whatsappStyle, setWhatsappStyle] = useState<'Professional' | 'Concise' | 'Casual'>('Professional');
  const [whatsappInput, setWhatsappInput] = useState('Could you please send me the report when you have a chance?');

  const handleWhatsAppStyleSwitch = (st: 'Professional' | 'Concise' | 'Casual') => {
    setWhatsappStyle(st);
    if (st === 'Professional') {
      setWhatsappInput('Could you please send me the report when you have a chance?');
    } else if (st === 'Concise') {
      setWhatsappInput('Please send me the report when you can.');
    } else if (st === 'Casual') {
      setWhatsappInput('Hey, can you send over the report whenever you get a sec?');
    }
  };

  const handleSendWhatsApp = () => {
    if (!whatsappInput.trim()) return;
    setWhatsappMessages(prev => [
      ...prev,
      { sender: 'user', text: whatsappInput.trim(), time: '10:43 AM' }
    ]);
    setWhatsappInput('');
  };

  // Persisted Theme State
  const [theme, setThemeState] = useState<string>(() => {
    try {
      return localStorage.getItem('whispurr_theme') || 'midnight';
    } catch (e) {
      return 'midnight';
    }
  });

  const setTheme = (newTheme: string) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('whispurr_theme', newTheme);
    } catch (e) {}
  };

  // Auto open Notes (from the Alt+Scroll workflow)
  useEffect(() => {
    if (mode === 'Notes' && !isAltPressed) {
      setOpenApp('whispurr');
    }
  }, [mode, isAltPressed]);

  // Append whispurr's translated text to the currently open app
  useEffect(() => {
    if (activeText && openApp) {
      if (openApp === 'whatsapp') {
        setWhatsappInput(activeText);
      }
      if (openApp === 'email') setEmailText(prev => prev + (prev ? '\n' : '') + activeText);
      if (openApp === 'vscode') setVscodeText(prev => prev + (prev ? '\n' : '') + activeText);
      if (openApp === 'ai') setAiText(prev => prev + (prev ? ' ' : '') + activeText);

      // Clear "Just this time" override after message is produced
      if (justThisTimeMode) {
        setTimeout(() => setJustThisTimeMode(null), 3500);
      }
    }
  }, [activeText, openApp, justThisTimeMode]);

  const CurrentAppIcon = () => {
    if (openApp === 'whatsapp') return <MessageSquare className="w-4 h-4 text-emerald-400" />;
    if (openApp === 'email') return <Mail className="w-4 h-4 text-blue-300" />;
    if (openApp === 'vscode') return <Terminal className="w-4 h-4 text-blue-500" />;
    if (openApp === 'ai') return <Sparkles className="w-4 h-4 text-purple-300" />;
    if (openApp === 'whispurr') return <KiviCatIcon size={16} className="text-orange-400" />;
    return <div className="w-4 h-4 border border-white/20 rounded-sm border-dashed" />;
  };

  return (
    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center">
      <div className="absolute inset-0 bg-black/20" />

      {/* Taskbar */}
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
                     <div className="flex items-center gap-3 text-white hover:bg-white/10 p-2 rounded cursor-pointer" onClick={() => {setOpenApp('whatsapp'); setIsStartMenuOpen(false);}}>
                        <MessageSquare className="w-5 h-5 text-emerald-400" />
                        <span className="font-medium text-sm">WhatsApp</span>
                     </div>
                     <div className="flex items-center gap-3 text-white hover:bg-white/10 p-2 rounded cursor-pointer" onClick={() => {setOpenApp('whispurr'); setIsStartMenuOpen(false);}}>
                        <KiviCatIcon size={20} className="text-orange-400" />
                        <span className="font-medium text-sm">WhisPURR Styles</span>
                     </div>
                     <div className="flex items-center gap-3 text-white hover:bg-white/10 p-2 rounded cursor-pointer" onClick={() => {setOpenApp('ai'); setIsStartMenuOpen(false);}}>
                        <Sparkles className="w-5 h-5 text-purple-400" />
                        <span className="font-medium text-sm">Antigravity AI</span>
                     </div>
                  </motion.div>
               )}
            </AnimatePresence>
         </div>

         {/* Dock Apps */}
         <div className="flex items-center gap-2">
            {/* WhatsApp Icon */}
            <div 
               onClick={() => setOpenApp(openApp === 'whatsapp' ? null : 'whatsapp')}
               className={`w-8 h-8 rounded flex items-center justify-center cursor-pointer transition-colors ${openApp === 'whatsapp' ? 'bg-white/10 border-b-2 border-emerald-400' : 'hover:bg-white/10'}`}
               title="WhatsApp (Screen 7 Demo)"
            >
               <MessageSquare className="w-5 h-5 text-emerald-400" />
            </div>
            {/* Outlook Email Icon */}
            <div 
               onClick={() => setOpenApp(openApp === 'email' ? null : 'email')}
               className={`w-8 h-8 rounded flex items-center justify-center cursor-pointer transition-colors ${openApp === 'email' ? 'bg-white/10 border-b-2 border-blue-400' : 'hover:bg-white/10'}`}
               title="Outlook Email"
            >
               <Mail className="w-5 h-5 text-blue-300" />
            </div>
            {/* VS Code Icon */}
            <div 
               onClick={() => setOpenApp(openApp === 'vscode' ? null : 'vscode')}
               className={`w-8 h-8 rounded flex items-center justify-center cursor-pointer transition-colors ${openApp === 'vscode' ? 'bg-white/10 border-b-2 border-blue-600' : 'hover:bg-white/10'}`}
               title="VS Code"
            >
               <Terminal className="w-5 h-5 text-blue-500" />
            </div>
            {/* AI Icon */}
            <div 
               onClick={() => setOpenApp(openApp === 'ai' ? null : 'ai')}
               className={`w-8 h-8 rounded flex items-center justify-center cursor-pointer transition-colors ${openApp === 'ai' ? 'bg-white/10 border-b-2 border-purple-400' : 'hover:bg-white/10'}`}
               title="Antigravity Canvas"
            >
               <Sparkles className="w-5 h-5 text-purple-300" />
            </div>
            {/* WhisPURR Dashboard Icon */}
            <div 
               onClick={() => setOpenApp(openApp === 'whispurr' ? null : 'whispurr')}
               className={`w-8 h-8 rounded flex items-center justify-center cursor-pointer transition-colors ${openApp === 'whispurr' ? 'bg-white/10 border-b-2 border-orange-400' : 'hover:bg-white/10'}`}
               title="Kivi Styles Dashboard"
            >
               <KiviCatIcon size={20} className="text-orange-400" />
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

      {/* RADIAL KIVI CONTROL STRIP */}
      <div 
        className={`absolute bottom-[-64px] left-1/2 -translate-x-1/2 z-[80] w-64 h-64 flex items-center justify-center rounded-full ${isHovered ? 'pointer-events-auto' : 'pointer-events-none'}`}
        onMouseLeave={() => { setIsHovered(false); setActivePopup(null); setPendingStylePrompt(null); }}
      >
        <div 
          className="relative w-32 h-32 flex items-center justify-center rounded-full pointer-events-auto"
          onMouseEnter={() => setIsHovered(true)}
        >
          {/* Section 7 "Just this time" Floating Badge over Cat */}
          <AnimatePresence>
            {justThisTimeMode && (
              <motion.div
                initial={{ opacity: 0, y: 5, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 5, scale: 0.8 }}
                className="absolute -top-6 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-black text-[10px] font-extrabold shadow-[0_0_12px_rgba(249,115,22,0.5)] flex items-center gap-1 pointer-events-none whitespace-nowrap z-30"
              >
                <span>✦ {justThisTimeMode}</span>
                <span className="opacity-80 font-medium">(just this time)</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Subtle Hover Glow Backdrop */}
          <AnimatePresence>
            {isHovered && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="absolute inset-[-20px] bg-white/[0.02] rounded-full backdrop-blur-md border border-white/5 shadow-2xl"
              />
            )}
          </AnimatePresence>

          {/* Central Cat */}
          <div 
            onClick={(e) => { 
              if (e.detail === 1 && toggleListening) toggleListening(); 
              if (e.detail === 2) setOpenApp('whispurr'); 
            }}
            className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-all duration-500 shadow-2xl relative z-10 ${
              isAltPressed || isLoading 
                ? 'bg-black/90 border border-orange-400/40 shadow-[0_0_20px_rgba(249,115,22,0.35)] scale-110'
                : 'bg-gradient-to-br from-[#2a2a2a] to-[#111] hover:from-[#333] hover:to-[#1a1a1a] border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]'
            }`}
          >
            <KiviCatIcon glowingEyes={isLoading || isAltPressed} size={18} className={`text-orange-300 transition-all duration-500 ${
              isLoading ? 'animate-pulse text-white' : (isAltPressed ? 'text-white' : 'opacity-90')
            }`} />
          </div>

          <AnimatePresence>
            {isHovered && (
              <>
                {/* App Icon Satellite (Top Left) */}
                <motion.div 
                  initial={{ opacity: 0, x: 0, y: 0, scale: 0.5 }}
                  animate={{ opacity: 1, x: -60, y: -30, scale: 1 }}
                  exit={{ opacity: 0, x: 0, y: 0, scale: 0.5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25, delay: 0 }}
                  className="absolute w-9 h-9 rounded-full bg-[#1e1e1e] border border-white/10 shadow-xl flex items-center justify-center z-20"
                >
                  <CurrentAppIcon />
                </motion.div>
                
                {/* Styles Satellite (Top Center) */}
                <motion.div 
                  initial={{ opacity: 0, x: 0, y: 0, scale: 0.5 }}
                  animate={{ opacity: 1, x: 0, y: -65, scale: 1 }}
                  exit={{ opacity: 0, x: 0, y: 0, scale: 0.5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25, delay: 0.05 }}
                  onClick={() => {
                    setActivePopup(activePopup === 'styles' ? null : 'styles');
                    setPendingStylePrompt(null);
                  }}
                  className={`absolute w-9 h-9 rounded-full border shadow-xl flex items-center justify-center cursor-pointer transition-all z-20 ${
                    activePopup === 'styles'
                      ? 'bg-orange-500/25 border-orange-400/70 text-orange-300 shadow-[0_0_16px_rgba(249,115,22,0.5)]'
                      : 'bg-[#1e1e1e] border-white/10 text-white/60 hover:bg-orange-500/15 hover:border-orange-400/40 hover:text-orange-300'
                  }`}
                  title="Styles Intention & Quick Switch"
                >
                  <Type className="w-4 h-4" />
                  
                  <AnimatePresence>
                    {activePopup === 'styles' && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 bg-[#0d0d0d]/95 backdrop-blur-2xl border border-orange-500/30 rounded-2xl p-3 w-64 shadow-[0_16px_40px_rgba(0,0,0,0.85),0_0_30px_rgba(249,115,22,0.2)] flex flex-col gap-2 z-30"
                      >
                        {/* Header */}
                        <div className="flex items-center justify-between px-2 pb-1.5 border-b border-white/5">
                          <span className="text-[10px] font-bold tracking-widest text-orange-400/90 uppercase flex items-center gap-1.5">
                            <Sparkles className="w-3 h-3 text-orange-400" />
                            Style Intention
                          </span>
                          <span className="text-[10px] text-white/40 font-medium">WhisPURR</span>
                        </div>

                        {/* Section 7 "Just this time" Confirmation Popover */}
                        {pendingStylePrompt ? (
                          <div className="p-3 bg-white/[0.04] border border-orange-500/40 rounded-xl flex flex-col gap-2 shadow-inner">
                            <div className="text-xs font-bold text-white leading-tight">
                              Use <span className="text-orange-400 font-extrabold">{pendingStylePrompt}</span> for this message?
                            </div>
                            <p className="text-[10px] text-white/50 leading-tight">
                              Choose single-use override or persist for {openApp === 'whatsapp' ? 'WhatsApp' : (openApp ? openApp.toUpperCase() : 'your apps')}.
                            </p>
                            <div className="flex gap-2 mt-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setJustThisTimeMode(pendingStylePrompt);
                                  setPendingStylePrompt(null);
                                  setActivePopup(null);
                                }}
                                className="flex-1 py-1 px-2 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 text-xs font-semibold border border-orange-500/40 text-center transition-colors cursor-pointer"
                              >
                                Just this time
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (setMode) setMode(pendingStylePrompt as any);
                                  setJustThisTimeMode(null);
                                  setPendingStylePrompt(null);
                                  setActivePopup(null);
                                }}
                                className="flex-1 py-1 px-2 rounded-lg bg-orange-500 hover:bg-orange-400 text-black text-xs font-bold text-center transition-colors cursor-pointer"
                              >
                                Remember
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* Styles List */
                          <div className="flex flex-col gap-1">
                            {[
                              { name: 'Professional', desc: 'Clear · Polished · Confident', icon: Briefcase },
                              { name: 'Casual', desc: 'Natural · Conversational', icon: MessageCircle },
                              { name: 'Concise', desc: 'Short · Direct · Efficient', icon: Zap },
                              { name: 'Warm', desc: 'Friendly · Welcoming', icon: Heart },
                              { name: 'Technical', desc: 'Precise · Structured', icon: Cpu },
                            ].map(s => {
                              const isSelected = effectiveMode === s.name;
                              const Icon = s.icon;
                              return (
                                <div 
                                  key={s.name}
                                  onClick={(e) => { 
                                    e.stopPropagation(); 
                                    if (s.name === effectiveMode) {
                                      setActivePopup(null);
                                      return;
                                    }
                                    setPendingStylePrompt(s.name);
                                  }}
                                  className={`px-3 py-2 rounded-xl cursor-pointer flex items-center justify-between transition-all border ${
                                    isSelected 
                                      ? 'bg-gradient-to-r from-orange-500/25 to-amber-500/10 text-orange-200 border-orange-500/40 shadow-[0_0_12px_rgba(249,115,22,0.25)] font-semibold' 
                                      : 'text-white/60 hover:text-white hover:bg-white/5 border-transparent'
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5">
                                    <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-orange-400' : 'text-white/40'}`} />
                                    <div className="flex flex-col text-left">
                                      <span className="text-xs leading-tight">{s.name}</span>
                                      <span className="text-[10px] text-white/30 font-normal leading-tight">{s.desc}</span>
                                    </div>
                                  </div>
                                  {isSelected && <Check className="w-3.5 h-3.5 text-orange-400 shrink-0" />}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Script Output Section */}
                        <div className="pt-1.5 border-t border-white/5">
                          <div className="flex items-center justify-between px-2 pb-1.5 text-[10px] font-bold tracking-widest text-orange-400/90 uppercase">
                            <span>Script Output</span>
                            <span className="text-[9px] text-white/40 font-normal normal-case">{degree === 1 ? 'A-Z Roman' : 'Native'}</span>
                          </div>
                          
                          <div className="flex bg-black/70 p-1 rounded-xl border border-orange-500/25 shadow-inner gap-1">
                            <button 
                              onClick={(e) => { e.stopPropagation(); if(setDegree) setDegree(1); setActivePopup(null); }} 
                              className={`flex-1 text-center text-xs py-1.5 rounded-lg font-semibold cursor-pointer transition-all ${
                                degree === 1 
                                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-black shadow-[0_0_12px_rgba(249,115,22,0.4)]' 
                                  : 'text-white/50 hover:text-white hover:bg-white/5'
                              }`}
                            >
                              Roman (A-Z)
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); if(setDegree) setDegree(2); setActivePopup(null); }} 
                              className={`flex-1 text-center text-xs py-1.5 rounded-lg font-semibold cursor-pointer transition-all ${
                                degree === 2 
                                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-black shadow-[0_0_12px_rgba(249,115,22,0.4)]' 
                                  : 'text-white/50 hover:text-white hover:bg-white/5'
                              }`}
                            >
                              Native
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Dictate Notes Satellite (Top Right) */}
                <motion.div 
                  initial={{ opacity: 0, x: 0, y: 0, scale: 0.5 }}
                  animate={{ opacity: 1, x: 60, y: -30, scale: 1 }}
                  exit={{ opacity: 0, x: 0, y: 0, scale: 0.5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25, delay: 0.1 }}
                  onClick={() => { if(setMode) setMode('Meeting Notes' as any); if(toggleListening) toggleListening(); }}
                  className="absolute w-9 h-9 rounded-full bg-[#1e1e1e] border border-white/10 shadow-xl flex items-center justify-center cursor-pointer hover:bg-white/15 text-white/60 hover:text-white transition-colors z-20"
                >
                  <FileText className="w-4 h-4" />
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* FULL SCREEN APPS */}
      <AnimatePresence>
        {openApp && (
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="absolute inset-0 z-40 bg-[#1e1e1e] flex flex-col"
            style={{ height: 'calc(100vh - 48px)' }}
          >
            {/* Standard Window Title Bar */}
            <div className="h-10 bg-black/40 flex items-center justify-between px-4 select-none">
              <div className="flex items-center gap-2 text-white/70 text-xs font-medium">
                {openApp === 'whatsapp' && <><MessageSquare className="w-4 h-4 text-emerald-400"/> WhatsApp</>}
                {openApp === 'email' && <><Mail className="w-4 h-4 text-blue-400"/> Outlook</>}
                {openApp === 'vscode' && <><Terminal className="w-4 h-4 text-blue-500"/> VS Code</>}
                {openApp === 'ai' && <><Sparkles className="w-4 h-4 text-purple-400"/> Antigravity Canvas</>}
                {openApp === 'whispurr' && <><KiviCatIcon size={16} className="text-orange-400"/> WhisPURR Styles Dashboard</>}
              </div>
              <div className="flex items-center gap-4 text-white/50">
                <Minus 
                  className="w-4 h-4 cursor-pointer hover:text-white transition-colors" 
                  onClick={() => setOpenApp(null)} 
                />
                <X 
                  className="w-5 h-5 cursor-pointer hover:text-red-500 transition-colors" 
                  onClick={() => setOpenApp(null)}
                />
              </div>
            </div>

            {/* App Content */}
            <div className="flex-1 overflow-hidden">
              
              {/* Screen 7: WhatsApp Real Scenario Demo */}
              {openApp === 'whatsapp' && (
                <div className="flex h-full bg-[#111b21] text-[#e9edef] font-sans">
                  {/* WhatsApp Sidebar */}
                  <div className="w-80 border-r border-[#222e35] bg-[#111b21] flex flex-col">
                    <div className="h-14 bg-[#202c33] px-4 flex items-center justify-between border-b border-[#222e35]">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-white text-sm">
                          K
                        </div>
                        <span className="font-semibold text-sm text-white">Chats</span>
                      </div>
                      <div className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 font-medium">
                        WhatsApp Web
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                      <div className="p-3 flex items-center gap-3 bg-[#2a3942]/60 border-l-4 border-emerald-500 cursor-pointer">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white font-bold text-base shadow-sm">
                          A
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-white text-sm truncate">Alex (Client)</span>
                            <span className="text-[11px] text-emerald-400">10:38 AM</span>
                          </div>
                          <p className="text-xs text-white/50 truncate mt-0.5">
                            Hey! Any update on the quarterly report?
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* WhatsApp Main Chat Area */}
                  <div className="flex-1 flex flex-col bg-[#0b141a] relative">
                    {/* Chat Header */}
                    <div className="h-14 bg-[#202c33] px-5 flex items-center justify-between border-b border-[#222e35] z-10">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white font-bold text-sm">
                          A
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white">Alex (Client)</div>
                          <div className="text-[11px] text-emerald-400">online · WhatsApp</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-white/60">
                        <Phone className="w-4 h-4 hover:text-white cursor-pointer" />
                        <Video className="w-4 h-4 hover:text-white cursor-pointer" />
                      </div>
                    </div>

                    {/* Interactive Screen 7 Demo Banner */}
                    <div className="z-10 bg-gradient-to-r from-emerald-950/80 via-black/80 to-emerald-950/80 border-b border-emerald-500/30 px-6 py-3 flex flex-col md:flex-row items-center justify-between gap-3 shadow-lg">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 text-xs font-bold">
                          ✦
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-2">
                            <span>Real Scenario Demo</span>
                            <span className="text-[10px] font-normal text-emerald-300/80 border border-emerald-500/30 px-2 py-0.2 rounded-full">
                              Screen 7
                            </span>
                          </div>
                          <p className="text-[11px] text-emerald-200/70 font-medium">
                            Same thought. Different output. One click.
                          </p>
                        </div>
                      </div>

                      {/* 1-Click Style Switcher */}
                      <div className="flex items-center gap-2 bg-black/60 p-1 rounded-xl border border-white/10">
                        <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider px-2">1-Click Style:</span>
                        {(['Professional', 'Concise', 'Casual'] as const).map((st) => {
                          const isSel = whatsappStyle === st;
                          return (
                            <button
                              key={st}
                              onClick={() => handleWhatsAppStyleSwitch(st)}
                              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                                isSel
                                  ? 'bg-emerald-500 text-black shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                                  : 'text-white/60 hover:text-white hover:bg-white/10'
                              }`}
                            >
                              {isSel && <Check className="w-3 h-3 stroke-[3]" />}
                              <span>{st}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Chat Messages */}
                    <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4 z-10">
                      {/* Alex Message */}
                      <div className="self-start max-w-md bg-[#202c33] rounded-2xl rounded-tl-none p-3.5 shadow-md border border-white/5">
                        <p className="text-sm text-white/90 leading-relaxed">
                          Hey! Any update on the quarterly report? Client meeting is soon.
                        </p>
                        <div className="text-[10px] text-white/30 text-right mt-1">10:38 AM</div>
                      </div>

                      {/* User Sent Messages */}
                      {whatsappMessages.map((msg, idx) => (
                        <div key={idx} className="self-end max-w-md bg-[#005c4b] text-white rounded-2xl rounded-tr-none p-3.5 shadow-md">
                          <p className="text-sm leading-relaxed">{msg.text}</p>
                          <div className="text-[10px] text-emerald-200/60 text-right mt-1 flex items-center justify-end gap-1">
                            <span>{msg.time}</span>
                            <CheckCheck className="w-3.5 h-3.5 text-blue-300" />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* WhatsApp Input Bar */}
                    <div className="p-3 bg-[#202c33] flex items-center gap-3 z-10 border-t border-[#222e35]">
                      <Smile className="w-5 h-5 text-white/40 hover:text-white cursor-pointer" />
                      <Paperclip className="w-5 h-5 text-white/40 hover:text-white cursor-pointer" />

                      <div className="flex-1 bg-[#2a3942] rounded-xl px-4 py-2.5 flex items-center gap-2 border border-white/5 focus-within:border-emerald-500/50">
                        <input
                          type="text"
                          value={whatsappInput}
                          onChange={(e) => setWhatsappInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSendWhatsApp();
                          }}
                          placeholder="Type or speak a message..."
                          className="flex-1 bg-transparent outline-none text-white text-sm placeholder-white/30"
                        />
                      </div>

                      <button
                        onClick={handleSendWhatsApp}
                        className="w-10 h-10 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black flex items-center justify-center transition-all shadow-md cursor-pointer shrink-0"
                        title="Send message"
                      >
                        <Send className="w-4 h-4 ml-0.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

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

              {openApp === 'whispurr' && (
                <WhispurrApp 
                  mode={effectiveMode} 
                  setMode={setMode} 
                  theme={theme} 
                  setTheme={setTheme} 
                  isAdaptiveMode={isAdaptiveMode}
                  onToggleAdaptive={toggleAdaptive}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export default MockOS;
