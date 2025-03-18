
import React, { useState } from 'react';
import { LANGUAGE_CODES } from '@/utils/speechUtils';
import { useTranslation } from '@/hooks/useTranslation';
import { useSpeech } from '@/hooks/useSpeech';
import TranslationHistory from './TranslationHistory';
import TranslationInput from './TranslationInput';

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
  
  const { translate, isTranslating } = useTranslation();
  const { isListening, startListening, stopListening, speak } = useSpeech(from, setInputText);

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
      
      <TranslationHistory 
        history={history}
        onSpeak={speak}
      />
      
      <TranslationInput
        inputText={inputText}
        setInputText={setInputText}
        isTranslating={isTranslating}
        isRightToLeft={isRightToLeft}
        placeholderText={placeholderText}
        isListening={isListening}
        onMicrophoneToggle={handleMicrophoneToggle}
        onTranslate={() => handleTranslate()}
        isMicrophoneDisabled={activeMicrophone !== null && activeMicrophone !== id}
        handleKeyDown={handleKeyDown}
      />
    </div>
  );
};

export default TranslationPanel;
