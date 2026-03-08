import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * A custom hook to use the browser's Web Speech API for free Text-to-Speech.
 */
export const useTextToSpeech = () => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const synthRef = useRef(window.speechSynthesis);

    const speak = useCallback((text, languageCode = 'en-US') => {
        if (!synthRef.current) return;

        // Cancel any ongoing speech
        synthRef.current.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = languageCode;

        // Try to find a high-quality voice for the language
        const voices = synthRef.current.getVoices();
        const preferredVoice = voices.find(v => v.lang.startsWith(languageCode) && v.localService)
            || voices.find(v => v.lang.startsWith(languageCode));

        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        synthRef.current.speak(utterance);
    }, []);

    const stop = useCallback(() => {
        if (synthRef.current) {
            synthRef.current.cancel();
            setIsSpeaking(false);
        }
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (synthRef.current) {
                synthRef.current.cancel();
            }
        };
    }, []);

    return {
        speak,
        stop,
        isSpeaking
    };
};
