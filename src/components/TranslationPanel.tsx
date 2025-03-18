import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import MicrophoneButton from './MicrophoneButton';
import TranslationItem from './TranslationItem';
import { LANGUAGE_CODES } from '@/utils/speechUtils';
import { useTranslation } from '@/hooks/useTranslation';
import { useSpeech } from '@/hooks/useSpeech';

interface TranslationHistoryItem {
  text: string;
  translation: string;
  timestamp: Date;
  from: 'en' | 'fa';
}

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
  const [history, setHistory] = useState<TranslationHistoryItem[]>([]);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const historyContainerRef = useRef<HTMLDivElement>(null);
  
  const { translate, isTranslating } = useTranslation();
  const { isListening, startListening, stopListening, speak } = useSpeech(from, setInputText);

  useEffect(() => {
    if (historyContainerRef.current) {
      historyContainerRef.current.scrollTop = historyContainerRef.current.scrollHeight;
    }
  }, [history]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputText.trim() && !isTranslating) {
        handleTranslate();
      }
    }
  };

  const handleMicrophoneToggle = () => {
    if (isListening) {
      stopListening(setActiveMicrophone);
    } else {
      startListening(id, setActiveMicrophone);
    }
  };

  const handleTranslate = async (textToTranslate: string = inputText) => {
    const textToUse = textToTranslate.trim() || inputText.trim();
    if (!textToUse) return;
    
    const translatedText = await translate(textToUse, from);
    
    if (translatedText) {
      const newItem: TranslationHistoryItem = {
        text: textToUse,
        translation: translatedText,
        timestamp: new Date(),
        from,
      };
      
      setHistory(prev => [...prev, newItem]);
      
      const targetLanguage = from === 'en' ? LANGUAGE_CODES.PERSIAN : LANGUAGE_CODES.ENGLISH;
      speak(translatedText, targetLanguage);
      
      if (textToTranslate === inputText) {
        setInputText('');
      }
      
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      <div className="mb-4">
        <div className="inline-block px-3 py-1 bg-secondary rounded-full mb-2">
          <span className="text-xs font-medium text-primary">{title}</span>
        </div>
        <h2 className="text-2xl font-semibold">{from === 'en' ? 'English to Persian' : 'فارسی به انگلیسی'}</h2>
      </div>
      
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
          [...history].reverse().map((item, index) => (
            <TranslationItem
              key={index}
              text={item.text}
              translation={item.translation}
              timestamp={item.timestamp}
              from={item.from}
              onSpeak={speak}
            />
          ))
        )}
      </div>
      
      <div className="glass p-4 rounded-xl mt-4">
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
              onKeyDown={handleKeyDown}
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
      
      <div className="text-xs text-gray-500 mb-2 flex items-center">
        {isTranslating && (
          <span className="ml-2 flex items-center">
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            Translating...
          </span>
        )}
      </div>
    </div>
  );
};

export default TranslationPanel;
