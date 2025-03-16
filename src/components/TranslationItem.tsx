
import React, { useState } from 'react';
import { Volume2, Copy, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

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
            onClick={() => onSpeak(translation, from === 'en' ? 'fa-IR' : 'en-US')}
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

export default TranslationItem;
