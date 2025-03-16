
import { useRef, useState } from 'react';
import { speakText, startSpeechRecognition, LANGUAGE_CODES } from '@/utils/speechUtils';
import { toast } from '@/components/ui/use-toast';

export const useSpeech = (from: 'en' | 'fa', onSpeechResult: (text: string) => void) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const startListening = (id: string, setActiveMicrophone: (id: string | null) => void) => {
    setActiveMicrophone(id);
    setIsListening(true);
    
    const recognition = startSpeechRecognition(
      from === 'en' ? LANGUAGE_CODES.ENGLISH : LANGUAGE_CODES.PERSIAN,
      (text) => {
        onSpeechResult(text);
      },
      () => {
        setIsListening(false);
        setActiveMicrophone(null);
      },
      (finalText) => {
        onSpeechResult(finalText);
        if (finalText.trim()) {
          return finalText;
        }
      }
    );
    
    recognitionRef.current = recognition;
  };

  const stopListening = (setActiveMicrophone: (id: string | null) => void) => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
    setActiveMicrophone(null);
  };

  const speak = (text: string, language: string) => {
    console.log('Attempting to speak text:', text, 'in language:', language);
    speakText(text, language).catch(error => {
      console.error('Text-to-speech error:', error);
      toast({
        title: "Speech playback failed",
        description: "An error occurred during text-to-speech playback.",
        variant: "destructive"
      });
    });
  };

  return {
    isListening,
    startListening,
    stopListening,
    speak
  };
};
