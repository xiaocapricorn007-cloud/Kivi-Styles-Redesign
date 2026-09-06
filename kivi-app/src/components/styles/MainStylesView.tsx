import { useState, useRef } from 'react';
import { 
  Sparkles,
  Mic, 
  Square, 
  Check, 
  Plus, 
  ChevronRight, 
  Settings2, 
  HelpCircle,
  BarChart2
} from 'lucide-react';
import { StyleItem, WeeklyStats, transformLocally } from './StylesData';

interface MainStylesViewProps {
  styles: StyleItem[];
  activeStyleName: string;
  onSelectActiveStyle: (name: string) => void;
  onOpenStyleDetail: (style: StyleItem) => void;
  onOpenCreateModal: () => void;
  onRevisitIntro: () => void;
  weeklyStats: WeeklyStats;
  isAdaptiveMode?: boolean;
  onToggleAdaptive?: () => void;
}

export default function MainStylesView({
  styles,
  activeStyleName,
  onSelectActiveStyle,
  onOpenStyleDetail,
  onOpenCreateModal,
  onRevisitIntro,
  weeklyStats,
  isAdaptiveMode = true,
  onToggleAdaptive,
}: MainStylesViewProps) {
  // Playground state for "Try a Style"
  const defaultPhrase = "hey can you check this when you get time and tell me if everything looks okay";
  const [youSayText, setYouSayText] = useState(defaultPhrase);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

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
        if (text.trim()) setYouSayText(text.trim());
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      setIsListening(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-8 overflow-y-auto pr-1 select-none">
      
      {/* 0. ADAPTIVE MODE TOP HERO SECTION */}
      <div className="bg-gradient-to-r from-orange-500/15 via-amber-500/10 to-[#0e0e0e] border border-orange-500/30 rounded-3xl p-6 sm:p-7 flex flex-col gap-4 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex flex-col gap-2.5">
            {/* The Button called Adaptive Mode */}
            <button
              onClick={onToggleAdaptive}
              className={`w-fit px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-3 transition-all shadow-xl cursor-pointer ${
                isAdaptiveMode
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-black shadow-[0_0_24px_rgba(249,115,22,0.45)] scale-[1.02]'
                  : 'bg-white/10 hover:bg-white/15 text-white/80 border border-white/15'
              }`}
            >
              <Sparkles className={`w-4 h-4 ${isAdaptiveMode ? 'text-black' : 'text-orange-400'}`} />
              <span className="text-base tracking-tight">Adaptive Mode</span>
              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider ${
                isAdaptiveMode ? 'bg-black/20 text-black' : 'bg-white/10 text-white/60'
              }`}>
                {isAdaptiveMode ? 'ON' : 'OFF'}
              </span>
            </button>

            {/* Below the button: exact description */}
            <p className="text-white/80 text-sm font-medium leading-relaxed max-w-xl">
              WhisPURR automatically changes your style based on the app you are working on
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            {/* Meet Styles Replay Link */}
            <button
              onClick={onRevisitIntro}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs border border-white/10 transition-colors cursor-pointer"
              title="Revisit the onboarding intro"
            >
              <HelpCircle className="w-3.5 h-3.5 text-orange-400" />
              <span>Meet Styles Intro</span>
            </button>
          </div>
        </div>

        {/* Live App Mapping / Context feedback */}
        <div className="pt-3 border-t border-white/5 flex flex-wrap items-center gap-2.5 text-xs">
          <span className="text-white/40 text-[11px] uppercase tracking-wider font-bold">
            {isAdaptiveMode ? 'Auto-detected contexts:' : 'Manual mode:'}
          </span>
          {isAdaptiveMode ? (
            <>
              <div className="px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center gap-1.5 text-emerald-300 font-medium">
                <span>WhatsApp</span> → <span className="font-bold text-white">Casual</span>
              </div>
              <div className="px-3 py-1 rounded-xl bg-blue-500/10 border border-blue-500/25 flex items-center gap-1.5 text-blue-300 font-medium">
                <span>Outlook / Email</span> → <span className="font-bold text-white">Professional</span>
              </div>
              <div className="px-3 py-1 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-center gap-1.5 text-purple-300 font-medium">
                <span>VS Code</span> → <span className="font-bold text-white">Technical</span>
              </div>
              <div className="px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center gap-1.5 text-amber-300 font-medium">
                <span>Slack</span> → <span className="font-bold text-white">Concise</span>
              </div>
            </>
          ) : (
            <span className="text-white/50 text-xs italic">
              Locked to {activeStyleName} across all apps. Click "Adaptive Mode" to enable automatic switching.
            </span>
          )}
        </div>
      </div>

      {/* 1. "CURRENTLY USING" STATE BANNER */}
      <div className="bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent border border-orange-500/20 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 text-xl font-bold shadow-sm">
            ✦
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-wider text-orange-300">
                Currently using
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="text-xl font-bold text-white mt-0.5 flex items-center gap-2">
              {activeStyleName}
            </div>
            <p className="text-xs text-white/50 mt-0.5">
              {isAdaptiveMode 
                ? 'Adaptive Mode active: automatically syncing with your foreground app.'
                : "Manual mode: Whisper adapts to your chosen style everywhere."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => {
              const currentStyle = styles.find(s => s.name === activeStyleName) || styles[0];
              onOpenStyleDetail(currentStyle);
            }}
            className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Settings2 className="w-3.5 h-3.5 text-orange-400" />
            <span>Customize {activeStyleName}</span>
          </button>
        </div>
      </div>

      {/* 2. TRY A STYLE (Live comparison) */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>Try a Style</span>
              <span className="text-xs font-normal text-white/40 border border-white/10 px-2 py-0.5 rounded-full">
                Interactive preview
              </span>
            </h2>
            <p className="text-xs text-white/40 mt-0.5">
              Type or speak any sentence to see how the tone adapts instantly across styles.
            </p>
          </div>

          <button
            onClick={() => setYouSayText(defaultPhrase)}
            className="text-xs text-orange-400/80 hover:text-orange-300 transition-colors cursor-pointer"
          >
            Reset phrase
          </button>
        </div>

        {/* You say input */}
        <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-4 flex flex-col gap-2 shadow-inner">
          <div className="flex items-center justify-between text-xs font-bold tracking-widest text-white/40 uppercase">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-400" />
              You say
            </span>
            <span className="text-[11px] text-white/30 lowercase">speak or edit</span>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="text"
              value={youSayText}
              onChange={(e) => setYouSayText(e.target.value)}
              className="flex-1 bg-transparent outline-none text-white/90 font-medium text-base placeholder-white/20"
              placeholder="Speak or type a thought..."
            />

            <button
              onClick={toggleListening}
              className={`p-2.5 rounded-xl border transition-all flex items-center justify-center cursor-pointer ${
                isListening
                  ? 'bg-red-500/20 border-red-500 text-red-400 animate-pulse'
                  : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10'
              }`}
              title={isListening ? "Stop listening" : "Speak into microphone"}
            >
              {isListening ? <Square className="w-4 h-4 fill-current" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* 3 Large Preview Cards: Casual, Professional, Concise */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-1">
          {[
            {
              id: 'casual',
              name: 'Casual',
              desc: 'Natural · Conversational',
              output: transformLocally(youSayText, 'Casual', 20, 40),
            },
            {
              id: 'professional',
              name: 'Professional',
              desc: 'Clear · Polished',
              output: transformLocally(youSayText, 'Professional', 80, 60),
            },
            {
              id: 'concise',
              name: 'Concise',
              desc: 'Short · Direct',
              output: transformLocally(youSayText, 'Concise', 50, 15),
            },
          ].map((card) => {
            const isSelected = activeStyleName === card.name;
            return (
              <div
                key={card.name}
                onClick={() => onSelectActiveStyle(card.name)}
                className={`flex flex-col justify-between p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                  isSelected
                    ? 'bg-gradient-to-b from-orange-500/15 to-amber-500/5 border-orange-500/60 shadow-[0_0_24px_rgba(249,115,22,0.2)]'
                    : 'bg-white/[0.02] border-white/10 hover:bg-white/[0.05] hover:border-white/20'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-base group-hover:text-orange-400 transition-colors">
                        {card.name}
                      </span>
                      <span className="text-[10px] text-white/30 font-mono">
                        {card.desc}
                      </span>
                    </div>

                    {isSelected ? (
                      <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 text-[10px] font-bold border border-orange-500/40 flex items-center gap-1">
                        <Check className="w-3 h-3 text-orange-400" /> Active
                      </span>
                    ) : (
                      <span className="text-[10px] text-white/30 group-hover:text-white/60 transition-colors">
                        Click to use
                      </span>
                    )}
                  </div>

                  <div className="text-sm text-white/80 leading-relaxed font-sans min-h-[4rem] flex items-center italic">
                    “{card.output || '...'}”
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-white/40">
                  <span>Single-click switch</span>
                  <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-orange-400 transition-colors group-hover:translate-x-0.5 transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. YOUR STYLES */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Your Styles</h2>
            <p className="text-xs text-white/40 mt-0.5">
              Select a style to customize its playground, tone sliders, and instructions.
            </p>
          </div>

          <button
            onClick={onOpenCreateModal}
            className="px-3.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-black font-semibold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Create Style</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {styles.map((style) => {
            const isCurrent = activeStyleName === style.name;
            return (
              <div
                key={style.id}
                onClick={() => onOpenStyleDetail(style)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer relative group flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-[#151515] border-orange-500/50 shadow-[0_8px_20px_rgba(0,0,0,0.5)]'
                    : 'bg-white/[0.02] border-white/5 hover:border-white/20 hover:bg-white/[0.05]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg font-bold text-orange-400">
                        {style.iconSymbol}
                      </span>
                      <h3 className="text-base font-bold text-white group-hover:text-orange-300 transition-colors">
                        {style.name}
                      </h3>
                    </div>

                    {isCurrent ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectActiveStyle(style.name);
                        }}
                        className="text-[11px] text-white/30 hover:text-orange-400 transition-colors px-2 py-0.5 rounded bg-white/5 hover:bg-white/10"
                      >
                        Use
                      </button>
                    )}
                  </div>

                  <p className="text-xs font-semibold text-white/60 mb-2">
                    {style.desc}
                  </p>
                  
                  <p className="text-xs text-white/40 line-clamp-2 leading-relaxed">
                    {style.tagline}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px]">
                  <span className="text-white/30 font-mono">
                    {style.usageText}
                  </span>
                  <span className="text-orange-400/80 group-hover:text-orange-300 flex items-center gap-1 font-medium">
                    Customize <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}

          {/* Create Style Card */}
          <div
            onClick={onOpenCreateModal}
            className="p-5 rounded-2xl border border-dashed border-white/15 hover:border-orange-500/50 bg-white/[0.01] hover:bg-orange-500/[0.03] transition-all cursor-pointer flex flex-col items-center justify-center gap-2 text-center min-h-[140px] group"
          >
            <div className="w-10 h-10 rounded-full bg-white/5 group-hover:bg-orange-500/20 border border-white/10 group-hover:border-orange-500/40 flex items-center justify-center text-white/60 group-hover:text-orange-400 transition-colors">
              <Plus className="w-5 h-5" />
            </div>
            <div className="text-sm font-bold text-white group-hover:text-orange-300 transition-colors">
              + Create Style
            </div>
            <p className="text-xs text-white/40 max-w-[200px]">
              Guided step-by-step setup tailored to how you express thoughts.
            </p>
          </div>
        </div>
      </div>

      {/* 4. STYLE USAGE FEEDBACK */}
      <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-md mt-2">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-orange-400/90 mb-1">
            <BarChart2 className="w-4 h-4 text-orange-400" />
            Your week with Kivi
          </div>
          <div className="text-2xl font-extrabold text-white">
            {weeklyStats.messagesAdapted} messages adapted
          </div>
          <p className="text-xs text-white/40 mt-0.5">
            Real usage insights across your everyday writing styles.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {weeklyStats.breakdown.map((item) => (
            <div
              key={item.name}
              className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 ${item.color}`}
            >
              <span className="font-semibold text-white">{item.name}</span>
              <span className="text-white/40">·</span>
              <span>{item.uses} uses</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
