import { useState, useEffect, memo } from 'react';
import { Mail, Terminal, Sparkles, X, Minus, Wifi, Type, FileText, Check, MessageCircle, Briefcase, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import WhispurrApp from './WhispurrApp';
import KiviCatIcon from './KiviCatIcon';

type AppType = 'email' | 'vscode' | 'ai' | 'whispurr' | null;

const MockOS = memo(({ activeText, mode, setMode, degree, setDegree, isAltPressed, isLoading, toggleListening }: { activeText: string, mode?: string, setMode?: any, degree?: number, setDegree?: any, isAltPressed?: boolean, isLoading?: boolean, toggleListening?: any }) => {
  const [openApp, setOpenApp] = useState<AppType>(null);
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  
  // Floating Strip State
  const [isHovered, setIsHovered] = useState(false);
  const [activePopup, setActivePopup] = useState<'styles' | null>(null);

  // Local state for native typing
  const [emailText, setEmailText] = useState('');
  const [vscodeText, setVscodeText] = useState('');
  const [aiText, setAiText] = useState('');

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
      if (openApp === 'email') setEmailText(prev => prev + (prev ? '\n' : '') + activeText);
      if (openApp === 'vscode') setVscodeText(prev => prev + (prev ? '\n' : '') + activeText);
      if (openApp === 'ai') setAiText(prev => prev + (prev ? ' ' : '') + activeText);
    }
  }, [activeText, openApp]);

  const CurrentAppIcon = () => {
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
                     <div className="flex items-center gap-3 text-white hover:bg-white/10 p-2 rounded cursor-pointer" onClick={() => {setOpenApp('whispurr'); setIsStartMenuOpen(false);}}>
                        <KiviCatIcon size={20} className="text-orange-400" />
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
               onClick={() => openApp !== 'whispurr' && setOpenApp('whispurr')}
               className={`w-8 h-8 rounded flex items-center justify-center cursor-pointer transition-colors ${openApp === 'whispurr' ? 'bg-white/10 border-b-2 border-orange-400' : 'hover:bg-white/10'}`}
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

            {/* NEW RADIAL KIVI CONTROL STRIP */}
      <div 
        className={`absolute bottom-[-64px] left-1/2 -translate-x-1/2 z-[80] w-64 h-64 flex items-center justify-center rounded-full ${isHovered ? 'pointer-events-auto' : 'pointer-events-none'}`}
        onMouseLeave={() => { setIsHovered(false); setActivePopup(null); }}
      >
        <div 
          className="relative w-32 h-32 flex items-center justify-center rounded-full pointer-events-auto"
          onMouseEnter={() => setIsHovered(true)}
        >
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
                  onClick={() => setActivePopup(activePopup === 'styles' ? null : 'styles')}
                  className={`absolute w-9 h-9 rounded-full border shadow-xl flex items-center justify-center cursor-pointer transition-all z-20 ${
                    activePopup === 'styles'
                      ? 'bg-orange-500/25 border-orange-400/70 text-orange-300 shadow-[0_0_16px_rgba(249,115,22,0.5)]'
                      : 'bg-[#1e1e1e] border-white/10 text-white/60 hover:bg-orange-500/15 hover:border-orange-400/40 hover:text-orange-300'
                  }`}
                  title="Styles & Scripting"
                >
                  <Type className="w-4 h-4" />
                  
                  <AnimatePresence>
                    {activePopup === 'styles' && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 bg-[#0d0d0d]/95 backdrop-blur-2xl border border-orange-500/30 rounded-2xl p-3 w-56 shadow-[0_16px_40px_rgba(0,0,0,0.85),0_0_30px_rgba(249,115,22,0.2)] flex flex-col gap-2 z-30"
                      >
                        {/* Header */}
                        <div className="flex items-center justify-between px-2 pb-1.5 border-b border-white/5">
                          <span className="text-[10px] font-bold tracking-widest text-orange-400/90 uppercase flex items-center gap-1.5">
                            <Sparkles className="w-3 h-3 text-orange-400" />
                            Style Mode
                          </span>
                          <span className="text-[10px] text-white/40 font-medium">WhisPURR</span>
                        </div>

                        {/* Styles List */}
                        <div className="flex flex-col gap-1">
                          {[
                            { name: 'Casual', desc: 'Friendly & relaxed', icon: MessageCircle },
                            { name: 'Professional', desc: 'Polished & formal', icon: Briefcase },
                            { name: 'Concise', desc: 'Brief & direct', icon: Zap },
                          ].map(s => {
                            const isSelected = mode === s.name;
                            const Icon = s.icon;
                            return (
                              <div 
                                key={s.name}
                                onClick={(e) => { e.stopPropagation(); if(setMode) setMode(s.name as any); setActivePopup(null); }}
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

                {/* Meeting Notes Satellite (Top Right) */}
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
                {openApp === 'email' && <><Mail className="w-4 h-4"/> Outlook</>}
                {openApp === 'vscode' && <><Terminal className="w-4 h-4"/> VS Code</>}
                {openApp === 'ai' && <><Sparkles className="w-4 h-4"/> Antigravity Canvas</>}
                {openApp === 'whispurr' && <><KiviCatIcon size={16} className="text-orange-400"/> Kivi Dashboard</>}
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

              {openApp === 'whispurr' && <WhispurrApp mode={mode} theme={theme} setTheme={setTheme} />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export default MockOS;
