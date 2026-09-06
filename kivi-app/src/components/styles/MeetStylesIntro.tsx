import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Check } from 'lucide-react';

interface MeetStylesIntroProps {
  onProceed: () => void;
  onSkip?: () => void;
}

export default function MeetStylesIntro({ onProceed, onSkip }: MeetStylesIntroProps) {
  const [selectedDemoStyle, setSelectedDemoStyle] = useState<'Professional' | 'Casual' | 'Concise'>('Professional');

  const demoPhrases = {
    Professional: "Hi, could you please send this to the client and ask whether tomorrow works?",
    Casual: "Hey, could you ping the client and check if tomorrow's good for them?",
    Concise: "Please send this to the client and ask if tomorrow works.",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 relative overflow-y-auto max-w-4xl mx-auto my-auto w-full select-none"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Tag & Title */}
      <div className="text-center max-w-2xl mb-8 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-300 text-xs font-semibold tracking-wider uppercase mb-4 shadow-sm">
          <Sparkles className="w-3.5 h-3.5" />
          First Discovery · Meet Styles
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-3">
          Meet Styles
        </h1>
        <p className="text-lg text-white/60 font-medium leading-relaxed">
          You don't need to think about how to phrase things. <br className="hidden sm:inline" />
          <span className="text-orange-200/90 font-semibold">You just speak.</span>
        </p>
      </div>

      {/* Interactive Transformation Card */}
      <div className="w-full bg-[#0d0d0d]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl relative z-10 flex flex-col gap-6">
        
        {/* You say */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-bold tracking-widest text-white/40 uppercase">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-400" />
              You say
            </span>
            <span className="text-[11px] text-white/30 font-normal lowercase">raw unedited thought</span>
          </div>
          <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 text-white/80 font-mono text-base md:text-lg leading-relaxed shadow-inner flex items-center gap-3">
            <span className="text-orange-400 font-serif text-2xl leading-none">“</span>
            <span className="flex-1">hey can you send this to the client and ask if tomorrow works</span>
            <span className="text-orange-400 font-serif text-2xl leading-none">”</span>
          </div>
        </div>

        {/* Style Selector Chips */}
        <div className="flex flex-col gap-3">
          <div className="text-xs font-bold tracking-widest text-orange-400/90 uppercase flex items-center justify-between">
            <span>Kivi adapts it</span>
            <span className="text-[11px] text-white/40 font-normal">Click any style to preview</span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {(['Professional', 'Casual', 'Concise'] as const).map((style) => {
              const isSelected = selectedDemoStyle === style;
              return (
                <button
                  key={style}
                  onClick={() => setSelectedDemoStyle(style)}
                  className={`py-3 px-4 rounded-xl border text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-orange-500/25 to-amber-500/15 border-orange-500/60 text-white shadow-[0_0_20px_rgba(249,115,22,0.3)] scale-[1.02]'
                      : 'bg-white/[0.02] border-white/10 text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {isSelected && <Check className="w-4 h-4 text-orange-400 shrink-0" />}
                  <span>{style}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Transformed Output Display */}
        <motion.div
          key={selectedDemoStyle}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-gradient-to-br from-orange-950/20 to-black/60 border border-orange-500/30 rounded-2xl p-5 md:p-6 shadow-xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-orange-400 to-amber-600" />
          <div className="flex items-start justify-between gap-4">
            <div className="text-lg md:text-xl font-medium text-white leading-relaxed font-sans">
              “{demoPhrases[selectedDemoStyle]}”
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-orange-300/60">
            <Sparkles className="w-3.5 h-3.5 text-orange-400" />
            <span>Transformed in real-time under {selectedDemoStyle} style</span>
          </div>
        </motion.div>

        {/* Bottom Banner */}
        <div className="pt-2 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/50 text-center sm:text-left">
            This is Styles. <strong className="text-white/80">You decide what you mean.</strong> Kivi handles how it comes across.
          </p>

          <button
            onClick={onProceed}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-black font-bold text-sm flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(249,115,22,0.4)] transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer shrink-0"
          >
            <span>Try it</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Skip option */}
      {onSkip && (
        <button
          onClick={onSkip}
          className="mt-6 text-xs text-white/40 hover:text-white/70 transition-colors underline cursor-pointer"
        >
          Skip intro and open Styles dashboard
        </button>
      )}
    </motion.div>
  );
}
