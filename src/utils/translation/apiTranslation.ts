
import { enhancedDictionaryTranslation } from './dictionaryTranslation';

// Enhanced Translation with LibreTranslate API
export const translateText = async (
  text: string, 
  from: 'en' | 'fa'
): Promise<string> => {
  if (!text.trim()) {
    console.log('Translation skipped: Empty text received');
    return '';
  }
  
  const sourceLanguage = from === 'fa' ? 'fa' : 'en';
  const targetLanguage = from === 'fa' ? 'en' : 'fa';
  
  console.log(`[Translation] Request: "${text}" (${text.length} chars) from ${sourceLanguage} to ${targetLanguage}`);
  
  try {
    // Get the current hostname dynamically
    const hostname = window.location.hostname;
    const apiUrl = hostname === 'localhost' 
      ? 'http://localhost:5000/translate'
      : `http://${hostname}:5000/translate`;
    
    console.log(`[Translation] Sending request to LibreTranslate API at ${apiUrl}`);
    
    const requestBody = {
      q: text,
      source: sourceLanguage,
      target: targetLanguage,
      format: 'text',
    };
    
    console.log(`[Translation] Request payload:`, requestBody);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
        'Origin': window.location.origin,
      },
      credentials: 'omit' // Important for CORS
    });
    
    console.log(`[Translation] Response status:`, response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Translation] API error (${response.status}):`, errorText);
      
      // Try to parse the error if it's JSON
      try {
        const errorJson = JSON.parse(errorText);
        console.error('[Translation] Parsed error:', errorJson);
        throw new Error(`Translation API error: ${errorJson.error || 'Unknown error'}`);
      } catch (parseError) {
        // If it's not JSON, use the raw text
        throw new Error(`Translation failed: ${response.status} ${errorText.slice(0, 100)}`);
      }
    }
    
    const data = await response.json();
    console.log('[Translation] API response data:', data);
    
    if (data.translatedText) {
      console.log(`[Translation] Success: "${data.translatedText}"`);
      return data.translatedText;
    } else {
      console.error('[Translation] Unexpected API response format:', data);
      throw new Error('Unexpected API response format');
    }
  } catch (error) {
    console.error('[Translation] Error during translation:', error);
    
    // Handle network errors more gracefully
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('[Translation] Network error - Is LibreTranslate server running at http://localhost:5000?');
      return `[Translation error: Could not connect to translation server. Is LibreTranslate running?]`;
    }
    
    // Fall back to dictionary translation if API fails
    console.log('[Translation] Attempting fallback to dictionary translation...');
    try {
      const dictionaryTranslation = enhancedDictionaryTranslation(text, from);
      console.log('[Translation] Fallback translation result:', dictionaryTranslation);
      
      if (dictionaryTranslation && dictionaryTranslation !== `[Could not translate: ${text}]`) {
        return `[API failed, dictionary fallback] ${dictionaryTranslation}`;
      }
    } catch (fallbackError) {
      console.error('[Translation] Fallback translation also failed:', fallbackError);
    }
    
    return `[Translation error: ${error instanceof Error ? error.message : String(error)}]`;
  }
};
