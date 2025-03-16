
import React, { useState, useEffect } from 'react';
import TranslationPanel from '@/components/TranslationPanel';
import { toast } from '@/components/ui/use-toast';
import { LucideVolume2 } from 'lucide-react';

const Index = () => {
  const [activeMicrophone, setActiveMicrophone] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Initialize speech synthesis voices
  useEffect(() => {
    // Some browsers need a manual trigger to load voices
    const loadVoices = () => {
      // Try to get voices
      const voices = window.speechSynthesis.getVoices();
      
      if (voices.length > 0) {
        setIsLoading(false);
      } else {
        // If no voices are available, try again in 100ms
        const interval = setInterval(() => {
          const voices = window.speechSynthesis.getVoices();
          if (voices.length > 0) {
            clearInterval(interval);
            setIsLoading(false);
          }
        }, 100);
        
        // Don't try indefinitely
        setTimeout(() => {
          clearInterval(interval);
          setIsLoading(false);
          
          // Show warning if no voices were loaded
          if (window.speechSynthesis.getVoices().length === 0) {
            toast({
              title: "Text-to-speech limited",
              description: "Your browser may have limited text-to-speech capabilities. Some features might not work as expected.",
              variant: "destructive"
            });
          }
        }, 3000);
      }
    };
    
    loadVoices();
    
    // Safari requires this event
    window.speechSynthesis.onvoiceschanged = loadVoices;
    
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/5 animate-pulse mb-4">
            <LucideVolume2 className="w-8 h-8 text-primary animate-pulse" />
          </div>
          <h1 className="text-xl font-medium text-gray-700">Initializing speech capabilities...</h1>
          <p className="text-gray-500 mt-2">This will only take a moment</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-6 py-4">
        <header className="text-center mb-4">
          <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500">
            Persian-English Translator
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Click the microphone to speak or type directly in the text box.
          </p>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white/80 backdrop-blur-sm shadow-elevated rounded-2xl p-6 h-[700px] transition-transform hover:translate-y-[-2px]">
            <TranslationPanel
              title="ENGLISH INPUT"
              placeholderText="Type in English..."
              from="en"
              activeMicrophone={activeMicrophone}
              setActiveMicrophone={setActiveMicrophone}
              id="english-mic"
            />
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm shadow-elevated rounded-2xl p-6 h-[700px] transition-transform hover:translate-y-[-2px]">
            <TranslationPanel
              title="PERSIAN INPUT"
              placeholderText="به فارسی تایپ کنید..."
              from="fa"
              isRightToLeft={true}
              activeMicrophone={activeMicrophone}
              setActiveMicrophone={setActiveMicrophone}
              id="persian-mic"
            />
          </div>
        </div>
        
        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>
            Built with web speech technologies. 
            No API keys required.
          </p>
          <p className="mt-1">
            © {new Date().getFullYear()} Persian-English Translator
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
