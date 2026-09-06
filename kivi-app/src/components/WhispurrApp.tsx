import { useState, useEffect, useRef } from 'react';
import { PanelLeftClose, PanelLeft, Home, BookOpen, Zap, Palette, Clock, FileText, X, Mic, Pencil, User, Settings, Shield, LayoutTemplate, CreditCard, PlayCircle, Copy, Check, Trash2, Square, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import FootprintManager from './FootprintManager';
import KiviCatIcon from './KiviCatIcon';
import { transformText } from '../transformEngine';
import StylesManager from './styles/StylesManager';

export default function WhispurrApp({
  mode,
  setMode,
  theme: propTheme,
  setTheme: propSetTheme,
}: {
  mode?: string;
  setMode?: (m: any) => void;
  theme?: string;
  setTheme?: (t: string) => void;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Home');
  const [showTutorial, setShowTutorial] = useState(true);
  
  // Persisted Theme State
  const [internalTheme, setInternalTheme] = useState<string>(() => {
    try {
      return localStorage.getItem('whispurr_theme') || 'midnight';
    } catch (e) {
      return 'midnight';
    }
  });

  const currentTheme = propTheme || internalTheme;

  const handleThemeChange = (newTheme: string) => {
    try {
      localStorage.setItem('whispurr_theme', newTheme);
    } catch (e) {}
    if (propSetTheme) {
      propSetTheme(newTheme);
    }
    setInternalTheme(newTheme);
  };
  
  useEffect(() => {
    if (mode === 'Notes') {
      setActiveTab('Notes');
    }
  }, [mode]);

  // Home Voice-to-Text Chat Box State
  const [homeChatText, setHomeChatText] = useState('');
  const [isHomeListening, setIsHomeListening] = useState(false);
  const [isHomeCopied, setIsHomeCopied] = useState(false);
  const [isHomeTransforming, setIsHomeTransforming] = useState(false);
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
  let whispurrIcon: React.ReactNode = (
    <video src="/kitten.mp4" autoPlay loop muted playsInline className="w-full h-full scale-150 object-contain mix-blend-screen" />
  );
  let whispurrStage = 'Kitten';
  let animationClass = '';
  
  if (timeSavedWeekHrs >= 2 && timeSavedWeekHrs < 5) {
    whispurrIcon = '🥱';
    whispurrStage = 'Waking Up';
    animationClass = 'animate-[bounce_3s_infinite]';
  } else if (timeSavedWeekHrs >= 5 && timeSavedWeekHrs < 12) {
    whispurrIcon = '🐱';
    whispurrStage = 'Active Kat';
    animationClass = 'animate-bounce';
  } else if (timeSavedWeekHrs >= 12) {
    whispurrIcon = (
      <video src="/zoomies.mp4" autoPlay loop muted playsInline className="w-full h-full scale-[2.0] object-contain mix-blend-screen" />
    );
    whispurrStage = 'Zoomies';
    animationClass = '';
  }

  // Animation variants
  const tabVariants = {
    initial: { opacity: 0, y: 15, scale: 0.98, filter: 'blur(4px)' },
    animate: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', transition: { duration: 0.3, ease: 'easeOut' } },
    exit: { opacity: 0, y: -15, scale: 0.98, filter: 'blur(4px)', transition: { duration: 0.2, ease: 'easeIn' } }
  };

  // Glassmorphism classes
  const glassPanel = "bg-[#0f0f0f] shadow-lg border border-white/[0.08] rounded-3xl";
  const glassInput = "bg-black/20 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-orange-500/50 focus:bg-black/40 transition-all text-sm";
  const glassButton = "bg-orange-500/90 hover:bg-orange-400 text-black font-bold px-8 py-3 rounded-2xl transition-all shadow-[0_0_15px_rgba(249,115,22,0.2)] hover:shadow-[0_0_25px_rgba(249,115,22,0.4)] text-sm";

  return (
    <div className={`h-full w-full bg-black text-white flex font-sans overflow-hidden ${currentTheme === 'coffee' ? 'theme-coffee' : ''}`}>
      
      {/* Sidebar */}
      <motion.div 
        animate={{ width: isSidebarOpen ? 260 : 80 }}
        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
        className="h-full bg-white/[0.01] border-r border-white/5 flex flex-col whitespace-nowrap overflow-hidden shrink-0 relative z-20 shadow-[4px_0_24px_rgba(0,0,0,0.5)]"
      >
        <div className={`h-16 flex items-center border-b border-white/5 relative shrink-0 transition-all ${isSidebarOpen ? 'px-6' : 'justify-center'}`}>
          <motion.div animate={{ opacity: isSidebarOpen ? 1 : 0, width: isSidebarOpen ? 'auto' : 0 }} className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center border border-orange-500/30 shrink-0">
              <KiviCatIcon size={20} className="text-orange-400" />
            </div>
            <span className="font-bold text-lg tracking-wide text-orange-50">WhisPURR</span>
          </motion.div>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className={`text-white/40 hover:text-white transition-colors shrink-0 ${isSidebarOpen ? 'absolute right-4 z-10' : ''}`}>
            {isSidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeft className="w-5 h-5" />}
          </button>
        </div>
        
        <div className="flex-1 py-6 flex flex-col gap-2">
          <div onClick={() => setActiveTab('Home')} className={`flex items-center gap-4 py-3 rounded-xl cursor-pointer transition-all ${isSidebarOpen ? 'px-4 mx-4' : 'justify-center mx-4'} ${activeTab === 'Home' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20 shadow-sm' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}>
            <Home className="w-5 h-5 shrink-0" />
            <motion.div animate={{ opacity: isSidebarOpen ? 1 : 0, width: isSidebarOpen ? 'auto' : 0 }} className="text-base font-medium">Home</motion.div>
          </div>
          
          <motion.div animate={{ opacity: isSidebarOpen ? 1 : 0 }} className={`mt-6 mb-2 text-xs font-bold text-white/30 uppercase tracking-widest h-5 transition-all ${isSidebarOpen ? 'px-8' : 'px-0 text-center w-full'}`}>
            Customize
          </motion.div>
          
          {[
            { name: 'Dictionary', icon: BookOpen },
            { name: 'Shortcuts', icon: Zap },
            { name: 'Styles', icon: Palette },
            { name: 'Notes', icon: FileText },
          ].map((tab) => (
            <div key={tab.name} onClick={() => setActiveTab(tab.name)} className={`flex items-center gap-4 py-3 rounded-xl cursor-pointer transition-all ${isSidebarOpen ? 'px-4 mx-4' : 'justify-center mx-4'} ${activeTab === tab.name ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20 shadow-sm' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}>
              <tab.icon className="w-5 h-5 shrink-0" />
              <motion.div animate={{ opacity: isSidebarOpen ? 1 : 0, width: isSidebarOpen ? 'auto' : 0 }} className="text-base font-medium">{tab.name}</motion.div>
            </div>
          ))}
        
          <div className="mt-auto mb-4 w-full px-4">
            <div 
              onClick={() => setIsSettingsOpen(!isSettingsOpen)} 
              className={`flex items-center gap-3 py-3 px-3 rounded-xl cursor-pointer transition-all ${isSettingsOpen ? 'bg-white/10 shadow-inner' : 'hover:bg-white/5'} ${!isSidebarOpen && 'justify-center'}`}
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center shrink-0 border border-white/10 overflow-hidden shadow-inner">
                <User className="w-5 h-5 text-black" strokeWidth={2.5} />
              </div>
              <motion.div animate={{ opacity: isSidebarOpen ? 1 : 0, width: isSidebarOpen ? 'auto' : 0 }} className="flex flex-col justify-center overflow-hidden">
                <span className="text-sm font-medium text-white">Mr.Kat</span>
              </motion.div>
            </div>
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
                { name: 'Settings', icon: Settings },
                { name: 'User Policy', icon: Shield },
                { name: 'Theme', icon: LayoutTemplate },
                { name: 'Plans & Billing', icon: CreditCard },
                { name: 'Tutorial', icon: PlayCircle },
              ].map((tab) => (
                <div key={tab.name} onClick={() => setActiveTab(tab.name)} className={`flex items-center gap-4 py-2.5 rounded-xl cursor-pointer transition-all px-4 mx-4 ${activeTab === tab.name ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20 shadow-sm' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}>
                  <tab.icon className="w-4 h-4 shrink-0" />
                  <div className="text-sm font-medium">{tab.name}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div className="h-14 border-b border-white/5 flex items-center px-8 shrink-0 bg-[#050505] z-10">
          <div className="font-medium text-white/40 flex items-center gap-2 text-sm">
            <span className="text-white/20">App</span> / <span className="text-orange-200/70">{activeTab}</span>
          </div>
        </div>

        <div className="flex-1 p-4 flex gap-4 overflow-hidden relative">
          <AnimatePresence>
              {activeTab === 'Home' && (
              <motion.div key="home" variants={tabVariants} initial="initial" animate="animate" exit="exit" className="absolute inset-4 flex gap-4">
                <div className="flex-1 flex flex-col gap-6 relative z-10">
                  <FootprintManager contained={true} />
                  <div className="px-2 pointer-events-none relative z-10">
                    <h1 className="text-3xl font-bold tracking-tight mb-2 text-white">Good afternoon, User.</h1>
                    <p className="text-white/50 text-sm">Your invisible translation layer is active and standing by.</p>
                  </div>
                  {/* Voice-to-Text Chat Box */}
                  <div className={`flex-1 ${glassPanel} p-6 flex flex-col relative z-10 overflow-hidden shadow-2xl border border-white/10 min-h-0`}>
                    {/* Header */}
                    <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-4 shrink-0">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 shadow-sm">
                          <Mic className="w-5 h-5" />
                        </div>
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
                          <p className="text-xs text-white/40">Speak naturally and convert your speech into copyable text</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {homeChatText && (
                          <button
                            onClick={handleClearHomeChat}
                            className="p-2 text-white/40 hover:text-red-400 hover:bg-white/5 rounded-xl transition-colors"
                            title="Clear text"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={handleCopyHomeChat}
                          disabled={!homeChatText.trim()}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                            isHomeCopied
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : homeChatText.trim()
                              ? 'bg-white/10 hover:bg-white/15 text-white border border-white/15 shadow-sm active:scale-95'
                              : 'bg-white/5 text-white/30 border border-white/5 cursor-not-allowed'
                          }`}
                        >
                          {isHomeCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{isHomeCopied ? 'Copied!' : 'Copy to Clipboard'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Textarea Area */}
                    <div className="flex-1 relative flex flex-col min-h-0">
                      <textarea
                        value={homeChatText}
                        onChange={(e) => setHomeChatText(e.target.value)}
                        placeholder={
                          isHomeListening
                            ? 'Listening to your voice... Speak clearly into your microphone...'
                            : 'Click "Speak" below and speak, or type here directly to convert and copy anywhere...'
                        }
                        className="flex-1 w-full bg-black/40 border border-white/5 focus:border-orange-500/40 rounded-2xl p-5 text-white placeholder-white/20 resize-none outline-none font-sans text-base leading-relaxed transition-all shadow-inner"
                      />
                      
                      {/* Character & Word count */}
                      <div className="flex items-center justify-between pt-2 px-1 text-xs text-white/30 shrink-0">
                        <div className="flex items-center gap-4">
                          <span>{homeChatText.trim() ? homeChatText.trim().split(/\s+/).length : 0} words</span>
                          <span>{homeChatText.length} characters</span>
                        </div>
                        {isHomeCopied && (
                          <span className="text-emerald-400 font-medium animate-pulse">
                            ✓ Copied to clipboard! Ready to paste anywhere (Ctrl+V / Cmd+V)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Controls Bar */}
                    <div className="flex items-center justify-between gap-4 pt-4 mt-2 border-t border-white/5 shrink-0">
                      <div className="flex items-center gap-2">
                        {/* Primary Speak / Stop Button */}
                        <button
                          onClick={toggleHomeListening}
                          className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl font-semibold text-sm transition-all shadow-lg active:scale-95 ${
                            isHomeListening
                              ? 'bg-red-500 hover:bg-red-600 text-white shadow-[0_0_20px_rgba(239,68,68,0.45)]'
                              : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-black shadow-[0_0_20px_rgba(249,115,22,0.3)]'
                          }`}
                        >
                          {isHomeListening ? (
                            <>
                              <Square className="w-4 h-4 fill-current animate-pulse" />
                              <span>Stop Listening</span>
                            </>
                          ) : (
                            <>
                              <Mic className="w-4 h-4" />
                              <span>Click to Speak</span>
                            </>
                          )}
                        </button>

                        {/* Polish with AI Button */}
                        <button
                          onClick={handleFormatWithAI}
                          disabled={!homeChatText.trim() || isHomeTransforming}
                          className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-semibold transition-all border ${
                            homeChatText.trim() && !isHomeTransforming
                              ? 'bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border-white/10 active:scale-95'
                              : 'bg-white/[0.02] text-white/20 border-white/5 cursor-not-allowed'
                          }`}
                          title="Polish transcript using Kivi translation layer"
                        >
                          <Sparkles className={`w-3.5 h-3.5 text-purple-400 ${isHomeTransforming ? 'animate-spin' : ''}`} />
                          <span>{isHomeTransforming ? 'Polishing...' : 'Polish with AI'}</span>
                        </button>
                      </div>

                      {/* Copy Button */}
                      <button
                        onClick={handleCopyHomeChat}
                        disabled={!homeChatText.trim()}
                        className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-semibold text-sm transition-all border ${
                          isHomeCopied
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : homeChatText.trim()
                            ? 'bg-white/10 hover:bg-white/15 text-white border-white/20 active:scale-95 shadow-md'
                            : 'bg-white/5 text-white/25 border-white/5 cursor-not-allowed'
                        }`}
                      >
                        {isHomeCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        <span>{isHomeCopied ? 'Copied!' : 'Copy Text'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className={`w-[320px] ${glassPanel} bg-black/40 p-6 flex flex-col relative z-10 overflow-hidden`}>
                  <div className="w-full flex-1 min-h-[160px] rounded-2xl bg-black/60 mb-8 relative shadow-inner border border-white/5 flex flex-col items-center justify-center group overflow-hidden">
                     <div className="absolute inset-0 bg-orange-500/10 blur-2xl rounded-full scale-150 group-hover:scale-110 transition-transform duration-1000"></div>
                     <div className={`text-7xl relative z-10 ${animationClass} drop-shadow-[0_0_15px_rgba(249,115,22,0.4)] flex items-center justify-center w-full h-full`}>
                       {whispurrIcon}
                     </div>
                     <div className="absolute bottom-4 left-0 right-0 text-center z-10">
                       <span className="text-orange-300 font-bold tracking-widest text-xs uppercase bg-black/60 px-4 py-1.5 rounded-full border border-orange-500/20 backdrop-blur-md">
                         Stage: {whispurrStage}
                       </span>
                     </div>
                  </div>
                  <h3 className="text-lg font-bold text-orange-50 mb-4 text-center border-b border-white/10 pb-3">Today's Impact</h3>
                  <div className="flex flex-col gap-4 items-center">
                    <div className="flex flex-col items-center justify-center p-4 w-full rounded-2xl bg-orange-500/10 border border-orange-500/20 shadow-[0_0_20px_rgba(249,115,22,0.05)]">
                      <div className="text-xs text-orange-100/70 mb-1 uppercase tracking-wider font-semibold">Time Saved Today</div>
                      <div className="font-bold text-4xl text-orange-400">1h 42m</div>
                      <div className="text-xs text-orange-200/40 mt-2">Weekly Total: {timeSavedWeekHrs} Hours</div>
                    </div>
                    <div className="flex w-full gap-3">
                      <div className="flex-1 flex flex-col items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/5">
                        <Clock className="w-5 h-5 text-white/30" />
                        <div className="text-center">
                          <div className="font-bold text-sm text-white">24m</div>
                          <div className="text-[10px] text-white/40 uppercase">Dictating</div>
                        </div>
                      </div>
                      <div className="flex-1 flex flex-col items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/5">
                        <FileText className="w-5 h-5 text-white/30" />
                        <div className="text-center">
                          <div className="font-bold text-sm text-white">3.4k</div>
                          <div className="text-[10px] text-white/40 uppercase">Words</div>
                        </div>
                      </div>
                    </div>
                  </div>
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
                  <p className="text-white/40 text-sm">Teach Kat terms that often get misspelled due to accents or jargon.</p>
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

            {activeTab === 'Shortcuts' && (
              <motion.div key="shortcuts" variants={tabVariants} initial="initial" animate="animate" exit="exit" className={`absolute inset-4 flex flex-col gap-6 p-8 overflow-y-auto ${glassPanel}`}>
                <div className="px-2">
                  <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                    <Zap className="text-orange-400 w-8 h-8" />
                    Shortcuts
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

            {activeTab === 'Notes' && (
              <motion.div key="notes" variants={tabVariants} initial="initial" animate="animate" exit="exit" className={`absolute inset-4 flex flex-col gap-6 p-8 ${glassPanel}`}>
                <div className="px-2">
                  <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                    <FileText className="text-orange-400 w-8 h-8" />
                    Notes
                  </h1>
                  <p className="text-white/40 text-sm">Your dictated thoughts, structured and summarized automatically by WhisPURR.</p>
                </div>
                <div className="flex-1 flex flex-col mt-2 bg-[#050505] rounded-2xl border border-white/5 p-8 overflow-y-auto shadow-inner">
                    <div className="text-center text-white/30 py-24 italic text-sm">No notes captured yet. Hold Alt and speak while in Notes mode to begin.</div>
                </div>
              </motion.div>
            )}

            {activeTab === 'Styles' && (
              <motion.div key="styles" variants={tabVariants} initial="initial" animate="animate" exit="exit" className={`absolute inset-4 flex flex-col gap-6 p-6 md:p-8 overflow-y-auto ${glassPanel}`}>
                <StylesManager currentMode={mode} setMode={setMode} />
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
                      onClick={() => handleThemeChange('midnight')}
                      className={`flex flex-col rounded-2xl border p-2 cursor-pointer transition-all ${currentTheme === 'midnight' ? 'border-orange-500 bg-orange-500/10' : 'border-white/10 bg-[#0f0f0f] hover:border-white/30'}`}
                    >
                      <div className="h-40 rounded-xl bg-black border border-white/10 mb-4 flex items-center justify-center overflow-hidden relative">
                         <div className="w-16 h-16 rounded-full bg-orange-500/20 flex items-center justify-center">
                           <LayoutTemplate className="w-8 h-8 text-orange-500" />
                         </div>
                      </div>
                      <div className="px-4 pb-4">
                        <div className="text-lg font-bold text-white mb-1">Midnight Dark</div>
                        <div className="text-sm text-white/50">Pure blacks with electric orange accents for a focused environment.</div>
                      </div>
                    </div>
                    
                    <div 
                      onClick={() => handleThemeChange('coffee')}
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
            
            {!['Home', 'Dictionary', 'Shortcuts', 'Notes', 'Styles', 'Theme'].includes(activeTab) && (
              <motion.div key="fallback" style={{ willChange: "transform, opacity, filter" }} variants={tabVariants} initial="initial" animate="animate" exit="exit" className={`absolute inset-4 flex flex-col items-center justify-center gap-4 p-8 ${glassPanel}`}>
                <Settings className="w-16 h-16 text-white/10" />
                <h1 className="text-2xl font-bold text-white/50">{activeTab}</h1>
                <p className="text-white/30 text-sm">This section is currently under construction.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Tutorial Overlay */}
        <AnimatePresence>
          {showTutorial && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-8"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.95, y: -10, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-[2rem] shadow-[0_0_50px_rgba(249,115,22,0.1)] overflow-hidden flex flex-col"
              >
                <div className="h-48 relative overflow-hidden bg-gradient-to-br from-orange-500/20 to-black flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent z-10"></div>
                  <KiviCatIcon size={96} className="text-orange-400 relative z-20 drop-shadow-[0_0_20px_rgba(249,115,22,0.6)]" />
                </div>
                
                <div className="p-10 flex flex-col items-center text-center relative z-20 -mt-8">
                  <h2 className="text-3xl font-bold tracking-tight text-white mb-4">Welcome to WhisPURR</h2>
                  <p className="text-white/60 mb-8 max-w-md leading-relaxed text-sm">
                    Your personal AI translation layer. 
                    WhisPURR acts as a bridge between your raw thoughts and polished professional communication. 
                    Hold <kbd className="px-2 py-1 bg-white/10 rounded border border-white/20 text-orange-400 mx-1">Alt</kbd> anywhere on your OS to summon Kivi and start dictating.
                  </p>
                  
                  <div className="flex gap-4 w-full">
                    <button 
                      onClick={() => setShowTutorial(false)}
                      className="flex-1 bg-orange-500 hover:bg-orange-400 text-black font-bold py-4 rounded-2xl transition-all shadow-[0_0_15px_rgba(249,115,22,0.2)] hover:shadow-[0_0_25px_rgba(249,115,22,0.4)]"
                    >
                      Start Exploring
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

