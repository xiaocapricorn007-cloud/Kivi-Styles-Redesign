import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Check, ArrowRight, Wand2 } from 'lucide-react';
import { StyleItem } from './StylesData';

interface CreateStyleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateStyle: (newStyle: StyleItem) => void;
}

export default function CreateStyleModal({
  isOpen,
  onClose,
  onCreateStyle,
}: CreateStyleModalProps) {
  // Step 1: Feelings
  const [feelings, setFeelings] = useState<string[]>(['Friendly', 'Direct']);
  const availableFeelings = ['Professional', 'Warm', 'Direct', 'Friendly', 'Technical', 'Playful'];

  // Step 2: Avoidances
  const [avoidances, setAvoidances] = useState<string[]>(['Too formal', 'Emojis']);
  const availableAvoidances = ['Too formal', 'Too long', 'Emojis', 'Corporate language', 'Filler words'];

  // Step 4: Name
  const [styleName, setStyleName] = useState('Client Friendly');

  if (!isOpen) return null;

  const toggleFeeling = (f: string) => {
    if (feelings.includes(f)) {
      setFeelings(feelings.filter(item => item !== f));
    } else {
      setFeelings([...feelings, f]);
    }
  };

  const toggleAvoidance = (a: string) => {
    if (avoidances.includes(a)) {
      setAvoidances(avoidances.filter(item => item !== a));
    } else {
      setAvoidances([...avoidances, a]);
    }
  };

  // Step 3 Live output computation based on chosen feelings & avoidances
  const getSimulatedExample = () => {
    if (feelings.includes('Playful')) {
      if (avoidances.includes('Emojis')) {
        return "Hey! Could you send over that report whenever you get a quick chance?";
      }
      return "Hey! Could you send over that report whenever you get a quick chance? 🙌";
    }
    if (feelings.includes('Direct') || feelings.includes('Technical')) {
      if (avoidances.includes('Too long')) {
        return "Please send the report when possible.";
      }
      return "Please send the report when you have a moment.";
    }
    if (feelings.includes('Warm') || feelings.includes('Friendly')) {
      return "Could you send me the report when you get a chance?";
    }
    return "Could you please send me the report when you have a chance?";
  };

  const handleCreate = () => {
    const trimmedName = styleName.trim() || 'Custom Style';
    const id = trimmedName.toLowerCase().replace(/\s+/g, '-');

    const newStyle: StyleItem = {
      id,
      name: trimmedName,
      iconSymbol: '★',
      tagline: `Tailored for ${feelings.join(' & ') || 'everyday'} expressions.`,
      desc: feelings.join(' · ') || 'Custom Intention',
      usageText: 'Just created',
      color: 'from-purple-500/20 to-pink-500/20 text-purple-400',
      borderColor: 'border-purple-500/40',
      casualToFormal: feelings.includes('Professional') ? 75 : (feelings.includes('Playful') ? 15 : 45),
      conciseToDetailed: avoidances.includes('Too long') ? 25 : 55,
      customInstructions: `Feel: ${feelings.join(', ')}. Avoid: ${avoidances.join(', ')}.`,
      autoContextEnabled: true,
      isDefault: false,
      sampleInput: "Can you send me the report when you get time?",
      sampleOutput: getSimulatedExample(),
      feelings,
      avoidances,
    };

    onCreateStyle(newStyle);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-xl bg-[#0e0e0e] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col gap-6 relative max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <Wand2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Create a style</h2>
              <p className="text-xs text-white/40">Guided setup without blank prompt fatigue.</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1. What should it feel like? */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-xs font-bold tracking-wider text-orange-400 uppercase">
            <span>1. What should it feel like?</span>
            <span className="text-[11px] text-white/30 font-normal lowercase">multiple selections</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {availableFeelings.map((f) => {
              const isSelected = feelings.includes(f);
              return (
                <button
                  key={f}
                  onClick={() => toggleFeeling(f)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-gradient-to-r from-orange-500/25 to-amber-500/15 border-orange-500/60 text-white shadow-sm'
                      : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 text-orange-400" />}
                  <span>{f}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. What should Kivi avoid? */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-xs font-bold tracking-wider text-orange-400 uppercase">
            <span>2. What should Kivi avoid?</span>
            <span className="text-[11px] text-white/30 font-normal lowercase">multiple selections</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {availableAvoidances.map((a) => {
              const isSelected = avoidances.includes(a);
              return (
                <button
                  key={a}
                  onClick={() => toggleAvoidance(a)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-red-500/20 border-red-500/50 text-red-300 shadow-sm'
                      : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 text-red-400" />}
                  <span>{a}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Show me an example */}
        <div className="flex flex-col gap-2.5 bg-white/[0.02] border border-white/5 rounded-2xl p-4">
          <div className="text-xs font-bold tracking-wider text-white/40 uppercase flex items-center justify-between">
            <span>3. Show me an example</span>
            <span className="text-[10px] text-orange-400/80 lowercase">live simulation</span>
          </div>

          <div className="flex flex-col gap-2 text-xs">
            <div className="text-white/50">
              <strong className="text-white/80">You say:</strong> “Can you send me the report when you get time?”
            </div>
            <div className="text-white bg-black/40 border border-orange-500/20 rounded-xl p-3 leading-relaxed">
              <strong className="text-orange-400">Kivi writes:</strong> “{getSimulatedExample()}”
            </div>
          </div>
        </div>

        {/* 4. Name your style */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold tracking-wider text-orange-400 uppercase">
            4. Name your style
          </label>
          <input
            type="text"
            value={styleName}
            onChange={(e) => setStyleName(e.target.value)}
            placeholder="E.g. Client Friendly, Executive Punchy, Friendly Mentor..."
            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-orange-500/50 font-medium"
          />
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white/50 hover:text-white transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleCreate}
            className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-black font-bold text-xs shadow-lg transition-all cursor-pointer flex items-center gap-2"
          >
            <span>Create Style</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </motion.div>
    </div>
  );
}
