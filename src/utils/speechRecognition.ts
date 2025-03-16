
import { IWindow, LANGUAGE_CODES } from './speechTypes';

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
