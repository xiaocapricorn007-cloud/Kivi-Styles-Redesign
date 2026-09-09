import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import MeetStylesIntro from './MeetStylesIntro';
import MainStylesView from './MainStylesView';

interface StylesManagerProps {
  currentMode: string;
  setMode: (val: string) => void;
  // Adaptive mode local sync
  isAdaptiveMode?: boolean;
  onToggleAdaptive?: () => void;
  // Moods toggle
  moodsEnabled?: boolean;
  setMoodsEnabled?: (val: boolean) => void;
}

export default function StylesManager({ 
  currentMode, 
  setMode,
  isAdaptiveMode: propIsAdaptiveMode,
  onToggleAdaptive: propOnToggleAdaptive
}: StylesManagerProps) {
  // Current sub-view: defaults to 'main' so the user sees the Styles page & Adaptive Mode immediately
  const [viewMode, setViewMode] = useState<'intro' | 'main'>('main');

  // Adaptive mode local sync
  const [internalAdaptiveMode, setInternalAdaptiveMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('whispurr_adaptive_mode');
      return saved !== null ? saved === 'true' : true;
    } catch (e) {
      return true;
    }
  });

  const effectiveAdaptiveMode = propIsAdaptiveMode !== undefined ? propIsAdaptiveMode : internalAdaptiveMode;

  const handleToggleAdaptive = () => {
    if (propOnToggleAdaptive) {
      propOnToggleAdaptive();
    } else {
      setInternalAdaptiveMode((prev) => {
        const next = !prev;
        try {
          localStorage.setItem('whispurr_adaptive_mode', String(next));
        } catch (e) {}
        return next;
      });
    }
  };

  // Active style name
  const activeStyleName = currentMode || 'Professional';

  const handleSelectActiveStyle = (styleName: string) => {
    if (setMode) {
      setMode(styleName as any);
    }
    try {
      localStorage.setItem('whispurr_mode', styleName);
    } catch (e) {}
  };

  const handleCompleteIntro = () => {
    try {
      localStorage.setItem('whispurr_seen_styles_onboarding', 'true');
    } catch (e) {}
    setViewMode('main');
  };

  return (
    <div className="w-full h-full flex flex-col relative overflow-hidden">
      <AnimatePresence mode="wait">
        {viewMode === 'intro' && (
          <MeetStylesIntro
            key="intro"
            onProceed={handleCompleteIntro}
            onSkip={handleCompleteIntro}
          />
        )}

        {viewMode === 'main' && (
          <MainStylesView
            key="main"
            activeStyleName={activeStyleName}
            onSelectActiveStyle={handleSelectActiveStyle}
            isAdaptiveMode={effectiveAdaptiveMode}
            onToggleAdaptive={handleToggleAdaptive}
            onRevisitIntro={() => setViewMode('intro')}
          />
        )}
      </AnimatePresence>
    </div>
  );
}


