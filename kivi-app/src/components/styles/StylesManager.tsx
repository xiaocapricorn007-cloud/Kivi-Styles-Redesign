import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { 
  DEFAULT_STYLES, 
  DEFAULT_WEEKLY_STATS, 
  StyleItem, 
  WeeklyStats 
} from './StylesData';
import MeetStylesIntro from './MeetStylesIntro';
import MainStylesView from './MainStylesView';
import StyleDetailPage from './StyleDetailPage';
import CreateStyleModal from './CreateStyleModal';

interface StylesManagerProps {
  currentMode?: string;
  setMode?: (mode: any) => void;
  isAdaptiveMode?: boolean;
  onToggleAdaptive?: () => void;
}

export default function StylesManager({ 
  currentMode = 'Professional', 
  setMode,
  isAdaptiveMode: propIsAdaptiveMode,
  onToggleAdaptive: propOnToggleAdaptive,
}: StylesManagerProps) {
  // Styles list with localStorage sync
  const [styles, setStyles] = useState<StyleItem[]>(() => {
    try {
      const saved = localStorage.getItem('whispurr_styles_custom');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEFAULT_STYLES;
  });

  // Current sub-view: defaults to 'main' so the user sees the Styles page & Adaptive Mode immediately
  const [viewMode, setViewMode] = useState<'intro' | 'main' | 'detail'>('main');

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

  const [selectedStyle, setSelectedStyle] = useState<StyleItem | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [weeklyStats] = useState<WeeklyStats>(DEFAULT_WEEKLY_STATS);

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

  const handleRevisitIntro = () => {
    setViewMode('intro');
  };

  const handleOpenDetail = (style: StyleItem) => {
    setSelectedStyle(style);
    setViewMode('detail');
  };

  const handleBackToMain = () => {
    setSelectedStyle(null);
    setViewMode('main');
  };

  const handleSaveStyle = (updatedStyle: StyleItem) => {
    const updatedList = styles.map((s) => (s.id === updatedStyle.id ? updatedStyle : s));
    setStyles(updatedList);
    setSelectedStyle(updatedStyle);
    try {
      localStorage.setItem('whispurr_styles_custom', JSON.stringify(updatedList));
    } catch (e) {}
  };

  const handleCreateStyle = (newStyle: StyleItem) => {
    const updatedList = [...styles, newStyle];
    setStyles(updatedList);
    try {
      localStorage.setItem('whispurr_styles_custom', JSON.stringify(updatedList));
    } catch (e) {}
    handleSelectActiveStyle(newStyle.name);
    setSelectedStyle(newStyle);
    setViewMode('detail');
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
            styles={styles}
            activeStyleName={activeStyleName}
            onSelectActiveStyle={handleSelectActiveStyle}
            onOpenStyleDetail={handleOpenDetail}
            onOpenCreateModal={() => setIsCreateModalOpen(true)}
            onRevisitIntro={handleRevisitIntro}
            weeklyStats={weeklyStats}
            isAdaptiveMode={effectiveAdaptiveMode}
            onToggleAdaptive={handleToggleAdaptive}
          />
        )}

        {viewMode === 'detail' && selectedStyle && (
          <StyleDetailPage
            key={`detail-${selectedStyle.id}`}
            styleItem={selectedStyle}
            isActive={activeStyleName === selectedStyle.name}
            onSetActive={handleSelectActiveStyle}
            onBack={handleBackToMain}
            onSaveStyle={handleSaveStyle}
          />
        )}
      </AnimatePresence>

      <CreateStyleModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateStyle={handleCreateStyle}
      />
    </div>
  );
}
