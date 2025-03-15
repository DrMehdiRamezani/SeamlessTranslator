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

// Translation using LibreTranslate API
export const translateText = async (
  text: string, 
  from: 'en' | 'fa'
): Promise<string> => {
  if (!text.trim()) {
    return '';
  }
  
  // Map our language codes to LibreTranslate format
  const sourceLang = from === 'fa' ? 'fa' : 'en';
  const targetLang = from === 'fa' ? 'en' : 'fa';
  
  console.log(`Translating "${text}" from ${sourceLang} to ${targetLang}`);
  
  try {
    // First try the LibreTranslate API
    const response = await fetch('https://libretranslate.de/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        q: text,
        source: sourceLang,
        target: targetLang,
        format: 'text'
      })
    });
    
    if (!response.ok) {
      throw new Error(`LibreTranslate API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.translatedText) {
      console.log(`Translation successful: "${data.translatedText}"`);
      return data.translatedText;
    } else {
      throw new Error('Translation response did not contain translated text');
    }
  } catch (error) {
    console.error('Translation API error:', error);
    
    // Fallback to our dictionary for basic phrases if API fails
    console.log('Falling back to dictionary translation');
    return fallbackTranslation(text, from);
  }
};

// Simple fallback dictionary translation - keep our original dictionary as backup
const fallbackTranslation = (text: string, from: 'en' | 'fa'): string => {
  const persianToEnglish: Record<string, string> = {
    'سلام': 'Hello',
    'چطوری': 'How are you',
    'خوبم': 'I am good',
    'من گرسنه هستم': 'I am hungry',
    'تشکر': 'Thank you',
    'خداحافظ': 'Goodbye',
    'بله': 'Yes',
    'نه': 'No',
    'لطفا': 'Please',
    'ببخشید': 'Excuse me',
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
    'هوا ابری است': 'The weather is cloudy'
  };
  
  const englishToPersian: Record<string, string> = {
    'Hello': 'سلام',
    'How are you': 'چطوری',
    'I am good': 'خوبم',
    'I am hungry': 'من گرسنه هستم',
    'Thank you': 'تشکر',
    'Goodbye': 'خداحافظ',
    'Yes': 'بله',
    'No': 'نه',
    'Please': 'لطفا',
    'Excuse me': 'ببخشید',
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
    'The weather is cloudy': 'هوا ابری است'
  };
  
  if (from === 'fa') {
    // Try direct matching
    if (persianToEnglish[text]) {
      return persianToEnglish[text];
    }
    
    // Try normalized text
    const normalizedText = text.trim()
      .replace(/\s+/g, ' ')
      .replace(/[،؛؟]/g, '');
    
    if (persianToEnglish[normalizedText]) {
      return persianToEnglish[normalizedText];
    }
    
    // Check for partial matches
    for (const [persian, english] of Object.entries(persianToEnglish)) {
      if (normalizedText.includes(persian)) {
        return english;
      }
    }
    
    // Try word by word matching
    const words = normalizedText.split(' ');
    if (words.length > 0) {
      for (const word of words) {
        if (persianToEnglish[word]) {
          return persianToEnglish[word];
        }
      }
    }
    
    // If no match found in dictionary
    return `[Translation not available for: ${text}]`;
  } else {
    // English to Persian translation follows the same pattern
    if (englishToPersian[text]) {
      return englishToPersian[text];
    }
    
    const normalizedText = text.trim()
      .replace(/\s+/g, ' ')
      .replace(/[,.;?!]/g, '');
    
    if (englishToPersian[normalizedText]) {
      return englishToPersian[normalizedText];
    }
    
    // Check for case-insensitive matches
    for (const [english, persian] of Object.entries(englishToPersian)) {
      if (normalizedText.toLowerCase() === english.toLowerCase()) {
        return persian;
      }
    }
    
    // Check for partial matches (case insensitive)
    for (const [english, persian] of Object.entries(englishToPersian)) {
      if (normalizedText.toLowerCase().includes(english.toLowerCase())) {
        return persian;
      }
    }
    
    // If no match found in dictionary
    return `[ترجمه برای: ${text} موجود نیست]`;
  }
};
