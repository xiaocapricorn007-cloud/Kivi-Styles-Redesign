import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Mic, 
  Square, 
  Copy, 
  Check, 
  Sparkles, 
  SlidersHorizontal
} from 'lucide-react';
import { StyleItem, transformLocally } from './StylesData';

interface StyleDetailPageProps {
  styleItem: StyleItem;
  isActive: boolean;
  onSetActive: (name: string) => void;
  onBack: () => void;
  onSaveStyle: (updated: StyleItem) => void;
}

export default function StyleDetailPage({
  styleItem,
  isActive,
  onSetActive,
  onBack,
  onSaveStyle,
}: StyleDetailPageProps) {
  // Live Playground State
  const [inputText, setInputText] = useState(
    styleItem.sampleInput || "hey sorry I couldn't finish this today I'll send it tomorrow"
  );
  const [casualToFormal, setCasualToFormal] = useState(styleItem.casualToFormal);
  const [conciseToDetailed, setConciseToDetailed] = useState(styleItem.conciseToDetailed);
  const [instructions, setInstructions] = useState(styleItem.customInstructions || '');
  const [autoContext, setAutoContext] = useState(styleItem.autoContextEnabled ?? true);
  
  // Audio Speech Recognition
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // UI state
  const [isCopied, setIsCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Compute live output reactively
  const liveOutput = transformLocally(
    inputText,
    styleItem.name,
    casualToFormal,
    conciseToDetailed,
    instructions
  );

  // Suggestion chips for Section 5 ("Make it yours")
  const suggestionChips = [
    "Keep it under 2 sentences",
    "Don't use emojis",
    "Sound confident",
    "Keep my wording natural",
    'Never say "Hope you\'re doing well"',
  ];

  const handleChipClick = (chip: string) => {
    if (instructions.includes(chip)) {
      // remove chip if already in
      const cleaned = instructions
        .replace(new RegExp(`(^|\\.\\s*)${chip}(\\.\\s*|$)`, 'g'), '')
        .trim();
      setInstructions(cleaned);
    } else {
      // append chip
      const updated = instructions.trim()
        ? `${instructions.trim()}${instructions.trim().endsWith('.') ? '' : '.'} ${chip}.`
        : `${chip}.`;
      setInstructions(updated);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch (e) {}
      setIsListening(false);
      return;
    }

    const SpeechRec = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRec) {
      alert("Speech recognition is supported in Chromium browsers like Chrome, Edge, and Arc.");
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        let text = '';
        for (let i = 0; i < event.results.length; i++) {
          text += event.results[i][0].transcript;
        }
        if (text.trim()) setInputText(text.trim());
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      setIsListening(false);
    }
  };

  const handleCopy = () => {
    if (!liveOutput) return;
    navigator.clipboard.writeText(liveOutput);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSave = () => {
    const updated: StyleItem = {
      ...styleItem,
      casualToFormal,
      conciseToDetailed,
      customInstructions: instructions,
      autoContextEnabled: autoContext,
    };
    onSaveStyle(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className="flex-1 flex flex-col gap-8 overflow-y-auto pr-1 select-none"
    >
      {/* Top Navigation & Header */}
      <div className="flex flex-col gap-4 border-b border-white/5 pb-6">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-semibold text-white/50 hover:text-white px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to all styles</span>
          </button>

          {isActive ? (
            <span className="px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-300 text-xs font-bold flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
              Currently Active Style
            </span>
          ) : (
            <button
              onClick={() => onSetActive(styleItem.name)}
              className="px-4 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-black font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              Set as active style
            </button>
          )}
        </div>

        <div>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-orange-400">
              {styleItem.iconSymbol}
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              {styleItem.name}
            </h1>
          </div>
          <p className="text-white/60 text-base mt-1 font-medium">
            {styleItem.tagline}
          </p>
        </div>
      </div>

      {/* 4. LIVE PLAYGROUND (Try it) */}
      <div className="bg-[#0b0b0b] border border-white/10 rounded-3xl p-6 md:p-8 flex flex-col gap-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest text-orange-400 uppercase mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              Live Playground
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Try it
            </h2>
            <p className="text-xs text-white/40 mt-0.5">
              Say anything. Don't edit yourself.
            </p>
          </div>

          <button
            onClick={() => setInputText("hey sorry I couldn't finish this today I'll send it tomorrow")}
            className="text-xs text-orange-400/80 hover:text-orange-300 transition-colors cursor-pointer"
          >
            Load example
          </button>
        </div>

        {/* User Raw Input Box */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-bold tracking-widest text-white/40 uppercase">
            <span>You say</span>
            <span className="text-[11px] text-white/30 lowercase">speak or type below</span>
          </div>

          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 flex items-center gap-3 focus-within:border-orange-500/50 transition-colors">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-transparent outline-none text-white/90 font-mono text-base placeholder-white/20"
              placeholder="Say anything..."
            />

            <button
              onClick={toggleListening}
              className={`p-2.5 rounded-xl border transition-all flex items-center justify-center cursor-pointer ${
                isListening
                  ? 'bg-red-500/25 border-red-500 text-red-400 animate-pulse'
                  : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10'
              }`}
              title={isListening ? "Stop listening" : "Speak your message"}
            >
              {isListening ? <Square className="w-4 h-4 fill-current" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Transition Down Arrow */}
        <div className="flex items-center justify-center -my-2">
          <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-orange-400 text-sm font-bold shadow-inner">
            ↓
          </div>
        </div>

        {/* Kivi Writes Output Box */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-bold tracking-widest text-orange-400 uppercase">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Kivi writes
            </span>
            <span className="text-[11px] text-white/30 lowercase font-normal">adapted in real-time</span>
          </div>

          <div className="bg-gradient-to-br from-orange-950/20 via-black to-black/80 border border-orange-500/40 rounded-2xl p-5 md:p-6 shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[5rem]">
            <div className="text-lg md:text-xl font-medium text-white leading-relaxed font-sans">
              “{liveOutput || '...'}”
            </div>

            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
              <span className="text-xs text-orange-300/60 font-medium flex items-center gap-1.5">
                ✦ Adapted with {styleItem.name} intention
              </span>

              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs font-semibold border border-white/10 transition-colors cursor-pointer"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Adjust the feel sliders */}
        <div className="pt-4 border-t border-white/5 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-orange-400" />
              <span>Adjust the feel</span>
            </div>
            <span className="text-xs text-white/40">Fine-tune the output nuance</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Slider 1: Casual <-> Formal */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs font-semibold text-white/70">
                <span className={casualToFormal <= 40 ? 'text-orange-400 font-bold' : ''}>Casual</span>
                <span className="text-white/30 text-[11px] font-mono">{casualToFormal}%</span>
                <span className={casualToFormal >= 60 ? 'text-orange-400 font-bold' : ''}>Formal</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={casualToFormal}
                onChange={(e) => setCasualToFormal(Number(e.target.value))}
                className="w-full accent-orange-500 cursor-pointer h-1.5 bg-white/10 rounded-lg"
              />
            </div>

            {/* Slider 2: Concise <-> Detailed */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs font-semibold text-white/70">
                <span className={conciseToDetailed <= 40 ? 'text-orange-400 font-bold' : ''}>Concise</span>
                <span className="text-white/30 text-[11px] font-mono">{conciseToDetailed}%</span>
                <span className={conciseToDetailed >= 60 ? 'text-orange-400 font-bold' : ''}>Detailed</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={conciseToDetailed}
                onChange={(e) => setConciseToDetailed(Number(e.target.value))}
                className="w-full accent-orange-500 cursor-pointer h-1.5 bg-white/10 rounded-lg"
              />
            </div>
          </div>
        </div>

      </div>

      {/* 5. MAKE IT YOURS (Section 5) */}
      <div className="bg-[#0b0b0b] border border-white/10 rounded-3xl p-6 md:p-8 flex flex-col gap-5 shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Make it yours
          </h2>
          <p className="text-sm text-white/50 mt-0.5">
            Tell Kivi what matters to you.
          </p>
        </div>

        {/* Suggestion Chips */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold tracking-wider text-white/40 uppercase">
            Click to add guidelines
          </span>
          <div className="flex flex-wrap gap-2">
            {suggestionChips.map((chip) => {
              const isIncluded = instructions.includes(chip);
              return (
                <button
                  key={chip}
                  onClick={() => handleChipClick(chip)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer flex items-center gap-1.5 ${
                    isIncluded
                      ? 'bg-orange-500/20 border-orange-500/60 text-orange-300 shadow-sm'
                      : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {isIncluded && <Check className="w-3.5 h-3.5 text-orange-400" />}
                  <span>{chip}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Instructions Textarea */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold tracking-wider text-white/40 uppercase">
            Your instructions
          </label>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Tell Kivi how you want this style to sound..."
            rows={3}
            className="w-full bg-white/[0.02] border border-white/10 rounded-2xl p-4 text-white text-sm leading-relaxed outline-none focus:border-orange-500/50 resize-none font-sans"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-white/40">
            Saved instructions apply automatically to every utterance.
          </span>

          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-black font-bold text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer"
          >
            {isSaved ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Changes saved!</span>
              </>
            ) : (
              <span>Save changes</span>
            )}
          </button>
        </div>
      </div>

      {/* 6. WHEN SHOULD KIVI USE THIS? (Section 6) */}
      <div className="bg-[#0b0b0b] border border-white/10 rounded-3xl p-6 md:p-8 flex flex-col gap-6 shadow-xl mb-6">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            When should Kivi use {styleItem.name}?
          </h2>
          <p className="text-xs text-white/40 mt-0.5">
            Designed for repeated everyday workflow without friction.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Automatically Card */}
          <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-white text-sm">Automatically</span>
                <button
                  onClick={() => setAutoContext(!autoContext)}
                  className={`w-11 h-6 rounded-full transition-colors flex items-center px-1 cursor-pointer ${
                    autoContext ? 'bg-orange-500' : 'bg-white/20'
                  }`}
                >
                  <motion.div
                    layout
                    className={`w-4 h-4 rounded-full bg-black shadow-md ${
                      autoContext ? 'ml-auto' : ''
                    }`}
                  />
                </button>
              </div>
              <p className="text-xs text-white/50 leading-relaxed">
                Kivi chooses based on your context.
              </p>
            </div>

            <div className="text-[11px] text-orange-400/80 font-medium">
              {autoContext ? "✓ Kivi adapts to where you're working." : "Disabled — Manual only"}
            </div>
          </div>

          {/* Manually Card */}
          <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-5 flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-white text-sm">Manually</span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Always available
                </span>
              </div>
              <p className="text-xs text-white/50 leading-relaxed">
                You can switch anytime from the Kivi control.
              </p>
            </div>

            <div className="text-[11px] text-white/40">
              Access via floating cat widget or Alt+Scroll shortcut.
            </div>
          </div>
        </div>
      </div>

    </motion.div>
  );
}
