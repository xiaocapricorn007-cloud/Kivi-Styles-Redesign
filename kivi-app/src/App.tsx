import { useEffect } from 'react';
import { useKiviInput } from './useKiviInput';
import MockOS from './components/MockOS';

export default function App() {
  const { isAltPressed, isLoading, mode, setMode, degree, setDegree, translatedText, toggleListening } = useKiviInput();

  // Enter full screen on first user interaction to sell the OS feel
  useEffect(() => {
    const goFullscreen = async () => {
      if (!document.fullscreenElement) {
        try {
          await document.documentElement.requestFullscreen();
        } catch (e) {}
      }
    };
    window.addEventListener('click', goFullscreen, { once: true });
    return () => window.removeEventListener('click', goFullscreen);
  }, []);

  return (
    <div className="relative w-screen h-screen bg-neutral-900 overflow-hidden flex flex-col font-sans">
      <MockOS 
        activeText={(!isAltPressed && !isLoading && translatedText) ? translatedText : ''} 
        mode={mode} 
        setMode={setMode}
        degree={degree}
        setDegree={setDegree}
        isAltPressed={isAltPressed} 
        isLoading={isLoading}
        toggleListening={toggleListening}
      />
    </div>
  );
}
