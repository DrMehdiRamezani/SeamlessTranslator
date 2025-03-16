
// Type definitions for Speech Recognition
export interface IWindow extends Window {
  webkitSpeechRecognition: any;
  SpeechRecognition: any;
}

// Language codes
export const LANGUAGE_CODES = {
  PERSIAN: 'fa-IR',
  ENGLISH: 'en-US'
};
