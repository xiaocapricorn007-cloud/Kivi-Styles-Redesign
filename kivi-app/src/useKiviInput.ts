import { useState, useEffect, useRef } from 'react';
import { transformText } from './transformEngine';

export type Mode = 'Work Messaging' | 'Personal Messaging' | 'Email' | 'Developer' | 'Prompting' | 'Other Apps' | 'Casual' | 'Professional' | 'Concise' | 'Meeting Notes';
export const MODES: Mode[] = ['Work Messaging', 'Personal Messaging', 'Email', 'Developer', 'Prompting', 'Other Apps'];

export function useKiviInput() {
  const [isAltPressed, setIsAltPressed] = useState(false);
  const [mode, setModeState] = useState<Mode>(() => {
    try {
      return (localStorage.getItem('whispurr_mode') as Mode) || 'Personal Messaging';
    } catch (e) {
      return 'Personal Messaging';
    }
  });
  const [degree, setDegreeState] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('whispurr_degree');
      return saved ? Number(saved) : 2;
    } catch (e) {
      return 2;
    }
  });

  const setMode = (newMode: Mode | ((prev: Mode) => Mode)) => {
    setModeState(prev => {
      const next = typeof newMode === 'function' ? newMode(prev) : newMode;
      try {
        localStorage.setItem('whispurr_mode', next);
      } catch (e) {}
      return next;
    });
  };

  const setDegree = (newDegree: number | ((prev: number) => number)) => {
    setDegreeState(prev => {
      const next = typeof newDegree === 'function' ? newDegree(prev) : newDegree;
      try {
        localStorage.setItem('whispurr_degree', String(next));
      } catch (e) {}
      return next;
    });
  };

  const [transcript, setTranscript] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Web Speech API
  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let currentStr = '';
        for (let i = 0; i < event.results.length; i++) {
          currentStr += event.results[i][0].transcript;
        }
        setTranscript(currentStr);
      };
      
      recognitionRef.current.onerror = (e: any) => console.error("Speech Recognition Error:", e.error);
    } else {
      console.warn("Speech Recognition API not supported in this browser.");
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Alt') {
        e.preventDefault();
        if (!isAltPressed) {
          setIsAltPressed(true);
          setTranscript(''); // clear old transcript on fresh start
          setTranslatedText(''); // clear previous translation
          try {
            recognitionRef.current?.start();
          } catch (err) {
            // ignore if already started
          }
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Alt') {
        setIsAltPressed(false);
        try {
          recognitionRef.current?.stop();
        } catch (err) {}
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isAltPressed]);

  const toggleListening = () => {
    if (isAltPressed) {
      setIsAltPressed(false);
      try { recognitionRef.current?.stop(); } catch (err) {}
    } else {
      setIsAltPressed(true);
      setTranscript('');
      setTranslatedText('');
      try { recognitionRef.current?.start(); } catch (err) {}
    }
  };

  // Debounced Gemini API Call
  useEffect(() => {
    if (!transcript.trim()) {
      setTranslatedText('');
      return;
    }
    
    setIsLoading(true);
    
    if (debounceRef.current) clearTimeout(debounceRef.current);
    
    debounceRef.current = setTimeout(async () => {
      const result = await transformText(transcript, mode, degree);
      setTranslatedText(result);
      setIsLoading(false);
    }, 250);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [transcript, mode, degree]);

  return { isAltPressed, isLoading, mode, setMode, degree, setDegree, transcript, translatedText, toggleListening };
}
