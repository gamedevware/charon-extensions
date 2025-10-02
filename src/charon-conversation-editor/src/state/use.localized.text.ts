import { DataLocalizationDocument, Language } from "charon-extensions";
import { useContext, useEffect, useState } from "react";
import { from, of } from "rxjs";
import { ConversationContext } from "./conversation.context";

/**
 * Custom React hook that extracts localized text from a DataLocalizationDocument instance 
 * in the currently selected locale. Automatically updates when the language changes.
 * 
 * @param {string | DataLocalizationDocument} text - The text to localize. Can be either 
 *        a plain string (returned as-is) or a DataLocalizationDocument object containing 
 *        localized strings keyed by language ID.
 * @returns {string} The localized text string in the current language, or a fallback 
 *          if the current language is not available. Returns empty string if no text is found.
 * 
 * @example
 * // With plain string
 * const text = useLocalizedText("Hello World"); // Returns "Hello World"
 * 
 * @example
 * // With localization document
 * const localizedText = useLocalizedText({
 *   'en-US': 'Hello World',
 *   'es-ES': 'Hola Mundo'
 * }); // Returns text based on current language selection
 */
export function useLocalizedText(text: string | DataLocalizationDocument): string {
    const { conversationTreeControl } = useContext(ConversationContext);
    const [localizedText, setLocalizedText] = useState('');

    useEffect(() => {
        const currentLanguage$ = from(conversationTreeControl.services?.langugeSelectionService?.currentLanguage$ ?? of(undefined));
        const subscription = currentLanguage$.subscribe({
            next: currentLanguage => setLocalizedText(extractLocalizedText(text, currentLanguage))
        });
        return subscription.unsubscribe.bind(subscription);

    }, [conversationTreeControl, text]);

    return localizedText;
}

/**
 * Extracts localized text from a DataLocalizationDocument based on the specified language.
 * Falls back to the first available non-notes property if the requested language is not found.
 */
function extractLocalizedText(text: string | DataLocalizationDocument, language?: Language) {
    if (text instanceof Object) {
        if (language?.id && language?.id in text) {
            return text[language.id] ?? '';
        }

        for (const key in text) {
            if (!Object.prototype.hasOwnProperty.call(text, key)) continue;
            if (key === 'notes') continue;

            return text[key]?.toString() ?? '';
        }
        return '';
    } else {
        return text?.toString() ?? '';
    }
}