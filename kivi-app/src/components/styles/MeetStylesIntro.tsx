import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Check, X } from 'lucide-react';

interface MeetStylesIntroProps {
  onProceed: () => void;
  onSkip?: () => void;
}

export default function MeetStylesIntro({ onProceed, onSkip }: MeetStylesIntroProps) {
  const handleExit = onSkip || onProceed;
  const [selectedDemoStyle, setSelectedDemoStyle] = useState<'Professional' | 'Casual' | 'Concise'>('Professional');
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

  const demoPhrases = {
    Professional: moodsEnabled 
      ? "Hi, could you please send this to the client and ask whether tomorrow works? 🤝📅"
      : "Hi, could you please send this to the client and ask whether tomorrow works?",
    Casual: moodsEnabled
      ? "Hey, could you ping the client and check if tomorrow's good for them? 🙌✨"
      : "Hey, could you ping the client and check if tomorrow's good for them?",
    Concise: moodsEnabled
      ? "Please send this to the client and ask if tomorrow works. 👍"
      : "Please send this to the client and ask if tomorrow works.",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className="flex-1 w-full h-full flex flex-col justify-between p-3 md:p-4 max-w-2xl mx-auto select-none overflow-hidden"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3 shrink-0 pb-1 border-b border-[#3e2723]/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#8d6e63]/20 border border-[#8d6e63]/30 flex items-center justify-center text-[#3e2723]">
            <Sparkles className="w-4 h-4 text-[#8d6e63]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-serif font-bold text-[#3e2723] tracking-tight">
                Meet Styles
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-[#8d6e63]/15 text-[#3e2723] text-[10px] font-mono font-bold uppercase tracking-wider">
                Interactive Demo
              </span>
            </div>
            <p className="text-[11px] text-[#3e2723]/70 font-serif italic">
              You just speak naturally — WhisPURR adapts your tone in real time.
            </p>
          </div>
        </div>

        <button
          onClick={handleExit}
          className="p-1.5 rounded-xl hover:bg-[#3e2723]/10 text-[#3e2723]/60 hover:text-[#3e2723] transition-colors cursor-pointer"
          title="Back to Studio"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Interactive Card */}
      <div className="flex-1 min-h-0 flex flex-col justify-between py-2.5 gap-2.5">
        {/* You say */}
        <div className="flex flex-col gap-1 shrink-0">
          <div className="flex items-center justify-between text-[11px] font-bold tracking-wider text-[#3e2723]/60 uppercase">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              You say
            </span>
            <span className="text-[10px] text-[#3e2723]/40 font-normal lowercase italic">raw spoken input</span>
          </div>
          <div className="bg-white/80 border border-[#3e2723]/15 rounded-xl px-3.5 py-2 text-[#3e2723]/80 font-mono text-xs md:text-sm leading-snug flex items-center gap-2 shadow-xs">
            <span className="text-[#8d6e63] font-serif text-lg leading-none font-bold">“</span>
            <span className="flex-1 truncate">hey can you send this to the client and ask if tomorrow works</span>
            <span className="text-[#8d6e63] font-serif text-lg leading-none font-bold">”</span>
          </div>
        </div>

        {/* Style Selector Chips & Moods Switch */}
        <div className="flex flex-col gap-1.5 shrink-0">
          <div className="flex items-center justify-between text-[11px] font-bold tracking-wider text-[#3e2723]/70 uppercase">
            <span>WhisPURR adapts it</span>
            <button
              type="button"
              role="switch"
              aria-checked={moodsEnabled}
              onClick={toggleMoods}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                moodsEnabled 
                  ? 'bg-[#5D4037] text-[#E8D5B5] border-[#3E2723] shadow-xs scale-[1.02]' 
                  : 'bg-[#3e2723]/5 text-[#3e2723]/70 border-transparent hover:bg-[#3e2723]/10'
              }`}
              title="Toggle Moods: adds expressive emojis based on your emotions and undertones"
            >
              <Sparkles className={`w-3 h-3 ${moodsEnabled ? 'text-amber-300' : 'text-[#8d6e63]'}`} />
              <span>Moods: {moodsEnabled ? 'ON' : 'OFF'}</span>
              <span>{moodsEnabled ? '✨' : '🎭'}</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {(['Professional', 'Casual', 'Concise'] as const).map((style) => {
              const isSelected = selectedDemoStyle === style;
              return (
                <button
                  key={style}
                  onClick={() => setSelectedDemoStyle(style)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-[#5D4037] text-[#E8D5B5] border-[#3e2723] shadow-md scale-[1.02]'
                      : 'bg-white/70 border-[#3e2723]/15 text-[#3e2723]/70 hover:bg-white hover:text-[#3e2723]'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#E8D5B5] shrink-0" />}
                  <span>{style}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Transformed Output Display */}
        <motion.div
          key={selectedDemoStyle + String(moodsEnabled)}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18 }}
          className="bg-white/95 border border-[#3e2723]/20 rounded-2xl p-3.5 md:p-4 shadow-md relative overflow-hidden flex flex-col justify-between flex-1 min-h-[90px]"
        >
          <div className="absolute top-0 left-0 w-1.5 h-full bg-[#5D4037]" />
          <div className="text-sm md:text-base font-semibold text-[#3e2723] leading-relaxed font-sans pl-1">
            “{demoPhrases[selectedDemoStyle]}”
          </div>
          <div className="mt-2 pt-2 border-t border-[#3e2723]/10 flex items-center justify-between text-[11px] text-[#3e2723]/70 flex-wrap gap-1.5 pl-1">
            <div className="flex items-center gap-1.5 font-medium">
              <Sparkles className="w-3 h-3 text-[#8d6e63]" />
              <span>Transformed in real-time under <strong>{selectedDemoStyle}</strong></span>
            </div>
            {moodsEnabled && (
              <span className="text-[#8d6e63] font-bold flex items-center gap-1 font-mono">
                ✨ Moods Active · Emotion Emojis Applied
              </span>
            )}
          </div>
        </motion.div>

        {/* Quick Dial Shortcut Banner */}
        <div className="flex items-center gap-2 text-[11px] text-[#3e2723]/80 bg-[#8d6e63]/10 border border-[#8d6e63]/25 px-3 py-1.5 rounded-xl shrink-0">
          <Sparkles className="w-3 h-3 text-[#8d6e63] shrink-0" />
          <span className="truncate">
            <strong>Desktop Dial:</strong> Hold <kbd className="px-1 py-0.2 rounded bg-white border border-[#3e2723]/20 font-mono text-[10px] font-bold">Alt</kbd> + <strong>Scroll</strong> for modes, or <kbd className="px-1 py-0.2 rounded bg-white border border-[#3e2723]/20 font-mono text-[10px] font-bold">Alt</kbd> + <strong>Right-Click</strong> for languages.
          </span>
        </div>
      </div>

      {/* Bottom Action */}
      <div className="pt-2 border-t border-[#3e2723]/10 flex items-center justify-between gap-3 shrink-0">
        <p className="text-[11px] text-[#3e2723]/60 font-serif italic truncate">
          You decide what you mean — WhisPURR handles how it comes across.
        </p>

        <button
          onClick={onProceed}
          className="px-4 py-2 rounded-xl bg-[#5D4037] hover:bg-[#4E342E] text-[#E8D5B5] font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer shrink-0"
        >
          <span>Open Studio</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}
