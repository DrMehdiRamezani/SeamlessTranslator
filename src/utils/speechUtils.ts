// Type definitions for Speech Recognition
interface IWindow extends Window {
  webkitSpeechRecognition: any;
  SpeechRecognition: any;
}

// Language codes
export const LANGUAGE_CODES = {
  PERSIAN: 'fa-IR',
  ENGLISH: 'en-US'
};

// Function to start speech recognition
export const startSpeechRecognition = (
  language: string,
  onResult: (text: string) => void,
  onEnd: () => void,
  onFinalResult?: (text: string) => void
) => {
  const windowWithSpeech = window as unknown as IWindow;
  const SpeechRecognition = windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    alert("Speech recognition is not supported in this browser.");
    onEnd();
    return null;
  }
  
  const recognition = new SpeechRecognition();
  recognition.lang = language;
  recognition.continuous = false;
  recognition.interimResults = true;
  
  recognition.onresult = (event: any) => {
    const resultIndex = event.resultIndex;
    const transcript = event.results[resultIndex][0].transcript;
    onResult(transcript);
    
    // Check if this is a final result
    if (event.results[resultIndex].isFinal && onFinalResult) {
      onFinalResult(transcript);
    }
  };
  
  recognition.onerror = (event: any) => {
    console.error('Speech recognition error', event.error);
    onEnd();
  };
  
  recognition.onend = () => {
    onEnd();
  };
  
  recognition.start();
  return recognition;
};

// Function to speak text
export const speakText = (text: string, language: string) => {
  return new Promise<void>((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      alert("Text-to-speech is not supported in this browser.");
      reject("Text-to-speech not supported");
      return;
    }

    // Cancel any previous speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    
    // Log all available voices for debugging
    const voices = window.speechSynthesis.getVoices();
    console.log('All available voices:', voices.map(v => `${v.name} (${v.lang})`));
    
    // For Persian, we'll try to find any voice with 'fa' in the language code
    // For English, we'll try to find any voice with 'en' in the language code
    const langPrefix = language.startsWith('fa') ? 'fa' : 'en';
    
    // Find a preferred voice for the language
    const preferredVoice = voices.find(voice => 
      voice.lang.includes(langPrefix)
    );
    
    if (preferredVoice) {
      console.log(`Using voice: ${preferredVoice.name} (${preferredVoice.lang})`);
      utterance.voice = preferredVoice;
    } else {
      console.log(`No specific voice found for ${language}, using default`);
    }
    
    utterance.rate = 1.0;  // Normal speed
    utterance.pitch = 1.0; // Normal pitch
    
    utterance.onend = () => {
      resolve();
    };
    
    utterance.onerror = (err) => {
      console.error('TTS error:', err);
      reject(err);
    };
    
    window.speechSynthesis.speak(utterance);
  });
};

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
  
  // Expanded dictionary with more phrases and common expressions
  const persianToEnglish: Record<string, string> = {
    // Basic phrases
    'سلام': 'Hello',
    'چطوری': 'How are you',
    'چطور هستید': 'How are you',
    'حال شما چطور است': 'How are you',
    'خوبم': 'I am good',
    'من خوبم': 'I am good',
    'من گرسنه هستم': 'I am hungry',
    'گرسنه هستم': 'I am hungry',
    'تشکر': 'Thank you',
    'ممنون': 'Thank you',
    'متشکرم': 'Thank you',
    'خداحافظ': 'Goodbye',
    'خدانگهدار': 'Goodbye',
    'بله': 'Yes',
    'نه': 'No',
    'لطفا': 'Please',
    'ببخشید': 'Excuse me',
    
    // Weather related
    'هوا': 'Weather',
    'سرد': 'Cold',
    'هوا سرد است': 'The weather is cold',
    'گرم': 'Hot',
    'هوا گرم است': 'The weather is hot',
    'باران': 'Rain',
    'باران می‌بارد': 'It is raining',
    'آفتابی': 'Sunny',
    'هوا آفتابی است': 'The weather is sunny',
    'ابری': 'Cloudy',
    'هوا ابری است': 'The weather is cloudy',
    'امروز': 'Today',
    'هوا امروز': 'Today\'s weather',
    'هوا امروز خوب است': 'The weather today is good',
    'هوا امروز خیلی خوب است': 'The weather today is very good',
    
    // Common adjectives
    'خوب': 'Good',
    'خیلی خوب': 'Very good',
    'بد': 'Bad',
    'خیلی بد': 'Very bad',
    'بزرگ': 'Big',
    'کوچک': 'Small',
    'زیبا': 'Beautiful',
    'زشت': 'Ugly',
    
    // Common nouns
    'خانه': 'House',
    'ماشین': 'Car',
    'غذا': 'Food',
    'آب': 'Water',
    'نان': 'Bread',
    
    // Common verbs
    'رفتن': 'To go',
    'آمدن': 'To come',
    'خوردن': 'To eat',
    'نوشیدن': 'To drink',
    'دیدن': 'To see',
    'شنیدن': 'To hear',
    'خوابیدن': 'To sleep',
    'است': 'Is',
    'هست': 'Is',
    'نیست': 'Is not',
    
    // Time expressions
    'فردا': 'Tomorrow',
    'دیروز': 'Yesterday',
    'صبح': 'Morning',
    'ظهر': 'Noon',
    'شب': 'Night',
    
    // Additional common phrases
    'چه خبر': 'What\'s new',
    'خبری نیست': 'Nothing new',
    'نام من': 'My name is',
    'اسم من': 'My name is',
    'من اهل ایران هستم': 'I am from Iran',
    'من فارسی بلد نیستم': 'I don\'t know Persian',
    'من انگلیسی بلد نیستم': 'I don\'t know English',
    'دوست دارم': 'I like',
    'دوست ندارم': 'I don\'t like'
  };
  
  const englishToPersian: Record<string, string> = {
    // Basic phrases
    'Hello': 'سلام',
    'Hi': 'سلام',
    'Hey': 'سلام',
    'How are you': 'چطور هستید',
    'How are you doing': 'حال شما چطور است',
    'I am good': 'من خوبم',
    'I am fine': 'من خوبم',
    'I am well': 'من خوبم',
    'I am hungry': 'من گرسنه هستم',
    'Thank you': 'متشکرم',
    'Thanks': 'ممنون',
    'Goodbye': 'خداحافظ',
    'Bye': 'خداحافظ',
    'Yes': 'بله',
    'No': 'نه',
    'Please': 'لطفا',
    'Excuse me': 'ببخشید',
    'Sorry': 'متأسفم',
    
    // Weather related
    'Weather': 'هوا',
    'Cold': 'سرد',
    'The weather is cold': 'هوا سرد است',
    'Hot': 'گرم',
    'The weather is hot': 'هوا گرم است',
    'Rain': 'باران',
    'It is raining': 'باران می‌بارد',
    'Sunny': 'آفتابی',
    'The weather is sunny': 'هوا آفتابی است',
    'Cloudy': 'ابری',
    'The weather is cloudy': 'هوا ابری است',
    'Today': 'امروز',
    'Today\'s weather': 'هوا امروز',
    'The weather today is good': 'هوا امروز خوب است',
    'The weather today is very good': 'هوا امروز خیلی خوب است',
    
    // Common adjectives
    'Good': 'خوب',
    'Very good': 'خیلی خوب',
    'Bad': 'بد',
    'Very bad': 'خیلی بد',
    'Big': 'بزرگ',
    'Small': 'کوچک',
    'Beautiful': 'زیبا',
    'Ugly': 'زشت',
    
    // Common nouns
    'House': 'خانه',
    'Car': 'ماشین',
    'Food': 'غذا',
    'Water': 'آب',
    'Bread': 'نان',
    
    // Common verbs
    'To go': 'رفتن',
    'To come': 'آمدن',
    'To eat': 'خوردن',
    'To drink': 'نوشیدن',
    'To see': 'دیدن',
    'To hear': 'شنیدن',
    'To sleep': 'خوابیدن',
    'Is': 'است',
    'Is not': 'نیست',
    
    // Time expressions
    'Tomorrow': 'فردا',
    'Yesterday': 'دیروز',
    'Morning': 'صبح',
    'Noon': 'ظهر',
    'Night': 'شب',
    
    // Additional common phrases
    'What\'s new': 'چه خبر',
    'Nothing new': 'خبری نیست',
    'My name is': 'اسم من',
    'I am from Iran': 'من اهل ایران هستم',
    'I don\'t know Persian': 'من فارسی بلد نیستم',
    'I don\'t know English': 'من انگلیسی بلد نیستم',
    'I like': 'دوست دارم',
    'I don\'t like': 'دوست ندارم'
  };

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
