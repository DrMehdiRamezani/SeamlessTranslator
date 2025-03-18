
import React, { useRef } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import MicrophoneButton from './MicrophoneButton';

interface TranslationInputProps {
  inputText: string;
  setInputText: (text: string) => void;
  isTranslating: boolean;
  isRightToLeft?: boolean;
  placeholderText: string;
  isListening: boolean;
  onMicrophoneToggle: () => void;
  onTranslate: () => void;
  isMicrophoneDisabled: boolean;
  handleKeyDown: (e: React.KeyboardEvent) => void;
}

const TranslationInput: React.FC<TranslationInputProps> = ({
  inputText,
  setInputText,
  isTranslating,
  isRightToLeft = false,
  placeholderText,
  isListening,
  onMicrophoneToggle,
  onTranslate,
  isMicrophoneDisabled,
  handleKeyDown
}) => {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  return (
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
            isDisabled={isMicrophoneDisabled}
            onClick={onMicrophoneToggle}
          />
          
          <button
            className={cn(
              "rounded-full w-12 h-12 flex items-center justify-center shadow-sm",
              isTranslating ? "bg-green-500" : "bg-green-500 hover:bg-green-600",
              !inputText.trim() && "opacity-50 cursor-not-allowed"
            )}
            onClick={onTranslate}
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
      
      <div className="text-xs text-gray-500 mt-2 flex items-center">
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

export default TranslationInput;
