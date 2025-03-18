import { persianToEnglish, englishToPersian } from '../translationDictionaries';

// Enhanced dictionary translation with better phrase handling
export const enhancedDictionaryTranslation = (text: string, from: 'en' | 'fa'): string => {
  console.log(`[Dictionary] Attempting dictionary translation for: "${text}"`);
  
  // Normalize the input text
  const normalizedText = text.trim()
    .replace(/\s+/g, ' ')
    .replace(from === 'fa' ? /[،؛؟]/g : /[,.;?!]/g, '');
  
  if (from === 'fa') {
    // Try to translate the whole phrase first
    if (persianToEnglish[normalizedText]) {
      console.log(`[Dictionary] Found exact match for Persian phrase: "${normalizedText}"`);
      return persianToEnglish[normalizedText];
    }
    
    // Advanced multi-word processing for Persian to English
    const result = translateMultiWordPersian(normalizedText, persianToEnglish);
    console.log(`[Dictionary] Persian to English result: "${result}"`);
    return result;
  } else {
    // Try to translate the whole phrase first
    if (englishToPersian[normalizedText]) {
      console.log(`[Dictionary] Found exact match for English phrase: "${normalizedText}"`);
      return englishToPersian[normalizedText];
    }
    
    // Advanced multi-word processing for English to Persian
    const result = translateMultiWordEnglish(normalizedText, englishToPersian);
    console.log(`[Dictionary] English to Persian result: "${result}"`);
    return result;
  }
};

// Helper function to handle multi-word Persian sentences
const translateMultiWordPersian = (text: string, dictionary: Record<string, string>): string => {
  console.log(`[Dictionary] Processing multi-word Persian: "${text}"`);
  
  // Step 1: Try to match known phrases first (longest to shortest)
  const phrases = Object.keys(dictionary).sort((a, b) => b.length - a.length);
  for (const phrase of phrases) {
    if (text.includes(phrase)) {
      // Replace the phrase with its translation
      console.log(`[Dictionary] Found partial phrase match: "${phrase}" -> "${dictionary[phrase]}"`);
      return text.replace(phrase, dictionary[phrase]);
    }
  }
  
  // Step 2: Word by word translation with context
  const words = text.split(' ');
  const translatedWords: string[] = [];
  
  console.log(`[Dictionary] Processing ${words.length} Persian words individually`);
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    
    // Try two-word combinations first
    if (i < words.length - 1) {
      const twoWords = `${word} ${words[i+1]}`;
      if (dictionary[twoWords]) {
        console.log(`[Dictionary] Found two-word match: "${twoWords}" -> "${dictionary[twoWords]}"`);
        translatedWords.push(dictionary[twoWords]);
        i++; // Skip the next word since we used it
        continue;
      }
    }
    
    // Then try single words
    if (dictionary[word]) {
      console.log(`[Dictionary] Found single word match: "${word}" -> "${dictionary[word]}"`);
      translatedWords.push(dictionary[word]);
    } else {
      // Keep the original word if no translation found
      console.log(`[Dictionary] No match for word: "${word}"`);
      translatedWords.push(`[${word}]`);
    }
  }
  
  // Step 3: Attempt to create a grammatically correct English sentence
  let result = translatedWords.join(' ');
  console.log(`[Dictionary] Final multi-word Persian result: "${result}"`);
  
  return result || `[Could not translate: ${text}]`;
};

// Helper function to handle multi-word English sentences
const translateMultiWordEnglish = (text: string, dictionary: Record<string, string>): string => {
  console.log(`[Dictionary] Processing multi-word English: "${text}"`);
  
  // Step 1: Try to match known phrases first (longest to shortest)
  const phrases = Object.keys(dictionary).sort((a, b) => b.length - a.length);
  for (const phrase of phrases) {
    if (text.toLowerCase().includes(phrase.toLowerCase())) {
      // Replace the phrase with its translation (case-insensitive)
      console.log(`[Dictionary] Found partial phrase match: "${phrase}" -> "${dictionary[phrase]}"`);
      const regex = new RegExp(phrase, 'i');
      return text.replace(regex, dictionary[phrase]);
    }
  }
  
  // Step 2: Word by word translation with context
  const words = text.toLowerCase().split(' ');
  const translatedWords: string[] = [];
  
  console.log(`[Dictionary] Processing ${words.length} English words individually`);
  
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
        console.log(`[Dictionary] Found two-word match: "${twoWords}" -> "${dictionary[twoWordKey]}"`);
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
      console.log(`[Dictionary] Found single word match: "${word}" -> "${dictionary[singleWordKey]}"`);
      translatedWords.push(dictionary[singleWordKey]);
    } else {
      // Keep the original word if no translation found
      console.log(`[Dictionary] No match for word: "${word}"`);
      translatedWords.push(`[${word}]`);
    }
  }
  
  // Step 3: Create a Persian sentence
  let result = translatedWords.join(' ');
  console.log(`[Dictionary] Final multi-word English result: "${result}"`);
  
  return result || `[قابل ترجمه نیست: ${text}]`;
};
