
import React, { useState, useRef, useEffect } from 'react';
import { Volume2, Send, Copy, CheckCircle2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import MicrophoneButton from './MicrophoneButton';
import { LANGUAGE_CODES, speakText, startSpeechRecognition, translateText } from '@/utils/speechUtils';
import { toast } from '@/components/ui/use-toast';

interface TranslationItemProps {
  text: string;
  translation: string;
  timestamp: Date;
  from: 'en' | 'fa';
  onSpeak: (text: string, lang: string) => void;
}

const TranslationItem: React.FC<TranslationItemProps> = ({ 
  text, 
  translation, 
  timestamp, 
  from,
  onSpeak
}) => {
  const [copied, setCopied] = useState(false);
  
  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-subtle mb-3 animate-fade-in">
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs text-gray-400">
          {timestamp.toLocaleTimeString()} · {timestamp.toLocaleDateString()}
        </span>
        <div className="flex space-x-1">
          <button 
            onClick={() => copyToClipboard(translation)}
            className="p-1 rounded-full hover:bg-gray-100"
            aria-label="Copy translation"
          >
            {copied ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-gray-400" />}
          </button>
          <button 
            onClick={() => onSpeak(translation, from === 'en' ? LANGUAGE_CODES.PERSIAN : LANGUAGE_CODES.ENGLISH)}
            className="p-1 rounded-full hover:bg-gray-100"
            aria-label="Speak translation"
          >
            <Volume2 className="h-4 w-4 text-gray-400" />
          </button>
        </div>
      </div>
      
      <div className={cn("mb-2", from === 'fa' ? "persian" : "")}>
        <p className="font-medium">{text}</p>
      </div>
      
      <div className="border-t border-gray-100 pt-2 mt-2">
        <div className={cn("text-gray-700", from === 'en' ? "persian" : "")}>
          <p>{translation}</p>
        </div>
      </div>
    </div>
  );
};

interface TranslationPanelProps {
  title: string;
  placeholderText: string;
  from: 'en' | 'fa';
  isRightToLeft?: boolean;
  activeMicrophone: string | null;
  setActiveMicrophone: (id: string | null) => void;
  id: string;
}

const TranslationPanel: React.FC<TranslationPanelProps> = ({
  title,
  placeholderText,
  from,
  isRightToLeft = false,
  activeMicrophone,
  setActiveMicrophone,
  id
}) => {
  const [inputText, setInputText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [history, setHistory] = useState<TranslationItemProps[]>([]);
  const recognitionRef = useRef<any>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const historyContainerRef = useRef<HTMLDivElement>(null);

  // Scroll history to bottom when new items are added
  useEffect(() => {
    if (historyContainerRef.current) {
      historyContainerRef.current.scrollTop = historyContainerRef.current.scrollHeight;
    }
  }, [history]);

  const handleMicrophoneToggle = () => {
    if (isListening) {
      // Stop listening
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      setIsListening(false);
      setActiveMicrophone(null);
    } else {
      // Start listening
      setActiveMicrophone(id);
      setIsListening(true);
      
      const recognition = startSpeechRecognition(
        from === 'en' ? LANGUAGE_CODES.ENGLISH : LANGUAGE_CODES.PERSIAN,
        (text) => {
          setInputText(text);
        },
        () => {
          setIsListening(false);
          setActiveMicrophone(null);
        },
        // Add a callback for final results that triggers translation
        (finalText) => {
          setInputText(finalText);
          // Automatically translate when speech recognition is complete
          if (finalText.trim()) {
            handleTranslate(finalText);
          }
        }
      );
      
      recognitionRef.current = recognition;
    }
  };

  const handleTranslate = async (textToTranslate: string = inputText) => {
    const textToUse = textToTranslate.trim() || inputText.trim();
    if (!textToUse) return;
    
    try {
      setIsTranslating(true);
      
      // Show toast for longer translations to indicate processing
      let toastId;
      const translationTimeout = setTimeout(() => {
        toastId = toast({
          title: "Translation in progress",
          description: "Translating longer text may take a moment...",
          duration: 3000,
        }).id;
      }, 1000);
      
      const translatedText = await translateText(textToUse, from);
      clearTimeout(translationTimeout);
      
      // Add to history
      const newItem: TranslationItemProps = {
        text: textToUse,
        translation: translatedText,
        timestamp: new Date(),
        from,
        onSpeak: handleSpeak
      };
      
      setHistory(prev => [...prev, newItem]);
      
      // Auto-play the translation with proper language code
      const targetLanguage = from === 'en' ? LANGUAGE_CODES.PERSIAN : LANGUAGE_CODES.ENGLISH;
      handleSpeak(translatedText, targetLanguage);
      
      // Only clear input if we're translating from the input field
      if (textToTranslate === inputText) {
        setInputText('');
      }
      
      // Focus input field for next translation
      if (inputRef.current) {
        inputRef.current.focus();
      }
    } catch (error) {
      console.error('Translation error:', error);
      toast({
        title: "Translation failed",
        description: "An error occurred while translating. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSpeak = (text: string, language: string) => {
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

  return (
    <div className="flex flex-col h-full relative">
      {/* Header */}
      <div className="mb-4">
        <div className="inline-block px-3 py-1 bg-secondary rounded-full mb-2">
          <span className="text-xs font-medium text-primary">{title}</span>
        </div>
        <h2 className="text-2xl font-semibold">{from === 'en' ? 'English to Persian' : 'Persian to English'}</h2>
      </div>
      
      {/* Input Area */}
      <div className="glass p-4 rounded-xl mb-4">
        <div className="flex space-x-4">
          <div className="flex-1">
            <textarea
              ref={inputRef}
              className={cn(
                "w-full p-3 rounded-lg bg-translucent-darker border-0 resize-none h-24 focus:ring-1 focus:ring-primary",
                isRightToLeft && "persian"
              )}
              placeholder={placeholderText}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              dir={isRightToLeft ? "rtl" : "ltr"}
            />
          </div>
          
          <div className="flex flex-col space-y-2 items-center justify-center">
            <MicrophoneButton
              isActive={isListening}
              isDisabled={activeMicrophone !== null && activeMicrophone !== id}
              onClick={handleMicrophoneToggle}
            />
            
            <button
              className={cn(
                "rounded-full w-12 h-12 flex items-center justify-center shadow-sm",
                isTranslating ? "bg-green-500" : "bg-green-500 hover:bg-green-600",
                !inputText.trim() && "opacity-50 cursor-not-allowed"
              )}
              onClick={() => handleTranslate()}
              disabled={isTranslating || !inputText.trim()}
              aria-label="Translate text"
            >
              {isTranslating ? (
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              ) : (
                <Send className="w-5 h-5 text-white" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Translation API Indicator */}
      <div className="text-xs text-gray-500 mb-2 flex items-center">
        <span>Using enhanced dictionary translation</span>
        {isTranslating && (
          <span className="ml-2 flex items-center">
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            Translating...
          </span>
        )}
      </div>
      
      {/* History */}
      <div className="text-sm font-medium text-gray-500 mb-2">Translation History</div>
      <div 
        ref={historyContainerRef}
        className="flex-1 overflow-y-auto pb-4 pr-1" 
        style={{ scrollBehavior: 'smooth' }}
      >
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
            <p className="text-gray-400 italic">Your translations will appear here</p>
          </div>
        ) : (
          history.map((item, index) => (
            <TranslationItem
              key={index}
              {...item}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default TranslationPanel;
