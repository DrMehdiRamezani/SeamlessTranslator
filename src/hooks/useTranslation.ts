
import { useState } from 'react';
import { translateText } from '@/utils/translation';
import { toast } from '@/components/ui/use-toast';

export const useTranslation = () => {
  const [isTranslating, setIsTranslating] = useState(false);
  const [lastTranslationStartTime, setLastTranslationStartTime] = useState<number | null>(null);

  const translate = async (text: string, from: 'en' | 'fa'): Promise<string | null> => {
    if (!text.trim()) return null;
    
    try {
      setIsTranslating(true);
      setLastTranslationStartTime(Date.now());
      
      // Show a short toast for all translations
      let toastId = toast({
        title: "Translation in progress",
        description: "Translating your text...",
        duration: 2000,
      }).id;
      
      // For longer translations (after 2 seconds), update the toast
      const longRunningTimer = setTimeout(() => {
        toast({
          id: toastId,
          title: "Translation in progress",
          description: "This is taking longer than usual. Please wait...",
          duration: 5000,
        });
      }, 2000);
      
      // For very long translations (after 6 seconds), update again
      const veryLongRunningTimer = setTimeout(() => {
        toast({
          id: toastId,
          title: "Still translating",
          description: "The translation server might be slow or overloaded.",
          duration: Infinity, // Keep it until we finish or fail
        });
      }, 6000);
      
      const translatedText = await translateText(text, from);
      
      // Clear all timers
      clearTimeout(longRunningTimer);
      clearTimeout(veryLongRunningTimer);
      
      // Calculate how long it took
      const translationTime = Date.now() - (lastTranslationStartTime || Date.now());
      console.log(`[Translation] Completed in ${translationTime}ms`);
      
      if (translationTime > 5000) {
        // Only show completion toast for long translations
        toast({
          id: toastId,
          title: "Translation complete",
          description: `Translation completed in ${Math.round(translationTime/1000)} seconds`,
          duration: 2000,
        });
      } else {
        // Just dismiss the existing toast
        toast({
          id: toastId,
          duration: 0,
        });
      }
      
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
      setLastTranslationStartTime(null);
    }
  };

  return {
    translate,
    isTranslating
  };
};
