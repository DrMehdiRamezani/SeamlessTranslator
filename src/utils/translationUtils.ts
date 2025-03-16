import { persianToEnglish, englishToPersian } from './translationDictionaries';

// Enhanced Translation with NLP-like techniques
export const translateText = async (
  text: string, 
  from: 'en' | 'fa'
): Promise<string> => {
  if (!text.trim()) {
    return '';
  }
  
  console.log(`Translating "${text}" from ${from === 'fa' ? 'Persian' : 'English'} to ${from === 'fa' ? 'English' : 'Persian'}`);
  
  // Use our enhanced dictionary translation directly
  return enhancedDictionaryTranslation(text, from);
};

// Enhanced dictionary translation with better phrase handling
const enhancedDictionaryTranslation = (text: string, from: 'en' | 'fa'): string => {
  // Normalize the input text
  const normalizedText = text.trim()
    .replace(/\s+/g, ' ')
    .replace(from === 'fa' ? /[،؛؟]/g : /[,.;?!]/g, '');
  
  if (from === 'fa') {
    // Try to translate the whole phrase first
    if (persianToEnglish[normalizedText]) {
      return persianToEnglish[normalizedText];
    }
    
    // Advanced multi-word processing for Persian to English
    return translateMultiWordPersian(normalizedText, persianToEnglish);
  } else {
    // Try to translate the whole phrase first
    if (englishToPersian[normalizedText]) {
      return englishToPersian[normalizedText];
    }
    
    // Advanced multi-word processing for English to Persian
    return translateMultiWordEnglish(normalizedText, englishToPersian);
  }
};

// Helper function to handle multi-word Persian sentences
const translateMultiWordPersian = (text: string, dictionary: Record<string, string>): string => {
  // Step 1: Try to match known phrases first (longest to shortest)
  const phrases = Object.keys(dictionary).sort((a, b) => b.length - a.length);
  for (const phrase of phrases) {
    if (text.includes(phrase)) {
      // Replace the phrase with its translation
      return text.replace(phrase, dictionary[phrase]);
    }
  }
  
  // Step 2: Word by word translation with context
  const words = text.split(' ');
  const translatedWords: string[] = [];
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    
    // Try two-word combinations first
    if (i < words.length - 1) {
      const twoWords = `${word} ${words[i+1]}`;
      if (dictionary[twoWords]) {
        translatedWords.push(dictionary[twoWords]);
        i++; // Skip the next word since we used it
        continue;
      }
    }
    
    // Then try single words
    if (dictionary[word]) {
      translatedWords.push(dictionary[word]);
    } else {
      // Keep the original word if no translation found
      translatedWords.push(`[${word}]`);
    }
  }
  
  // Step 3: Attempt to create a grammatically correct English sentence
  let result = translatedWords.join(' ');
  
  // Additional context-based improvements can be added here
  // For example, adding "the" before certain nouns, fixing subject-verb agreement, etc.
  
  return result || `[Could not translate: ${text}]`;
};

// Helper function to handle multi-word English sentences
const translateMultiWordEnglish = (text: string, dictionary: Record<string, string>): string => {
  // Step 1: Try to match known phrases first (longest to shortest)
  const phrases = Object.keys(dictionary).sort((a, b) => b.length - a.length);
  for (const phrase of phrases) {
    if (text.toLowerCase().includes(phrase.toLowerCase())) {
      // Replace the phrase with its translation (case-insensitive)
      const regex = new RegExp(phrase, 'i');
      return text.replace(regex, dictionary[phrase]);
    }
  }
  
  // Step 2: Word by word translation with context
  const words = text.toLowerCase().split(' ');
  const translatedWords: string[] = [];
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    
    // Try two-word combinations first
    if (i < words.length - 1) {
      const twoWords = `${word} ${words[i+1]}`;
      
      // Check for matches in the dictionary (case-insensitive)
      const twoWordKey = Object.keys(dictionary).find(
        key => key.toLowerCase() === twoWords
      );
      
      if (twoWordKey) {
        translatedWords.push(dictionary[twoWordKey]);
        i++; // Skip the next word since we used it
        continue;
      }
    }
    
    // Then try single words (case-insensitive)
    const singleWordKey = Object.keys(dictionary).find(
      key => key.toLowerCase() === word
    );
    
    if (singleWordKey) {
      translatedWords.push(dictionary[singleWordKey]);
    } else {
      // Keep the original word if no translation found
      translatedWords.push(`[${word}]`);
    }
  }
  
  // Step 3: Create a Persian sentence
  let result = translatedWords.join(' ');
  
  return result || `[قابل ترجمه نیست: ${text}]`;
};
