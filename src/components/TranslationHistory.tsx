
import React, { useRef, useEffect } from 'react';
import TranslationItem from './TranslationItem';

interface TranslationHistoryItem {
  text: string;
  translation: string;
  timestamp: Date;
  from: 'en' | 'fa';
}

interface TranslationHistoryProps {
  history: TranslationHistoryItem[];
  onSpeak: (text: string, language: string) => void;
}

const TranslationHistory: React.FC<TranslationHistoryProps> = ({ 
  history,
  onSpeak
}) => {
  const historyContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (historyContainerRef.current) {
      historyContainerRef.current.scrollTop = historyContainerRef.current.scrollHeight;
    }
  }, [history]);

  return (
    <>
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
              onSpeak={onSpeak}
            />
          ))
        )}
      </div>
    </>
  );
};

export default TranslationHistory;
