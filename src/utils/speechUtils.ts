
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

// Simple translation API - in a real application, this would connect to a translation service
// For now, we'll just use a few hardcoded phrases to demonstrate functionality
export const translateText = async (
  text: string, 
  from: 'en' | 'fa'
): Promise<string> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
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
  };
  
  // In a real app, you would connect to a translation API here
  if (from === 'fa') {
    // Return exact match if found
    if (persianToEnglish[text]) {
      return persianToEnglish[text];
    }
    
    // Check for partial matches
    for (const [persian, english] of Object.entries(persianToEnglish)) {
      if (text.includes(persian)) {
        return english;
      }
    }
    
    // If no match found
    return `[Translation not available for: ${text}]`;
  } else {
    // Return exact match if found
    if (englishToPersian[text]) {
      return englishToPersian[text];
    }
    
    // Check for partial matches
    for (const [english, persian] of Object.entries(englishToPersian)) {
      if (text.toLowerCase().includes(english.toLowerCase())) {
        return persian;
      }
    }
    
    // If no match found
    return `[ترجمه برای: ${text} موجود نیست]`;
  }
};
