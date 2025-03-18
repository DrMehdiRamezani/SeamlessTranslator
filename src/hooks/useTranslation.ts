
import { useState } from 'react';
import { translateText } from '@/utils/translation';
import { toast } from '@/components/ui/use-toast';

export const useTranslation = () => {
  const [isTranslating, setIsTranslating] = useState(false);

  const translate = async (text: string, from: 'en' | 'fa'): Promise<string | null> => {
    if (!text.trim()) return null;
    
    try {
      setIsTranslating(true);
      
      let toastId;
      const translationTimeout = setTimeout(() => {
        toastId = toast({
          title: "Translation in progress",
          description: "Translating longer text may take a moment...",
          duration: 3000,
        }).id;
      }, 1000);
      
      const translatedText = await translateText(text, from);
      clearTimeout(translationTimeout);
      
      return translatedText;
    } catch (error) {
      console.error('Translation error:', error);
      toast({
        title: "Translation failed",
        description: "An error occurred while translating. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsTranslating(false);
    }
  };

  return {
    translate,
    isTranslating
  };
};
