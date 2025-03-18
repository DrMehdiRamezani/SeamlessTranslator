
import { LANGUAGE_CODES } from './speechTypes';

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
    // console.log('All available voices:', voices.map(v => `${v.name} (${v.lang})`));
    
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
