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
}

export default function StylesManager({ currentMode = 'Professional', setMode }: StylesManagerProps) {
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

  // Current sub-view: 'intro' | 'main' | 'detail'
  const [viewMode, setViewMode] = useState<'intro' | 'main' | 'detail'>(() => {
    try {
      const seen = localStorage.getItem('whispurr_seen_styles_onboarding') === 'true';
      return seen ? 'main' : 'intro';
    } catch (e) {
      return 'intro';
    }
  });

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
    // Automatically make it active and open its detail view
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
