import { ValueControl } from "charon-extensions";
import { RefObject, useCallback, useEffect, useState } from "react";

type DoFocus = (options?: FocusOptions) => void;

/**
 * Custom hook that synchronizes focus state between a ValueControl and a DOM element
 * Monitors focus events on a target element and provides programmatic focus control
 * 
 * @param {ValueControl} valueControl - The ValueControl instance to synchronize with
 * @param {RefObject<HTMLElement | null>} targetRef - React ref to the target DOM element
 * @returns {[boolean, DoFocus]} Tuple containing current focus state and focus trigger function
 * 
 * @example
 * const [isFocused, doFocus] = useControlFocusTarget(formControl, inputRef);
 * // isFocused: true when element has focus
 * // doFocus(): programmatically focuses the element
 * // formControl.focus() programmatically focuses the element 
 */
export function useControlFocusTarget(valueControl: ValueControl, targetRef: RefObject<HTMLElement | null>): [boolean, DoFocus] {
    const [isFocused, setIsFocused] = useState(false);

    const handleFocus = useCallback(() => setIsFocused(true), []);
    const handleBlur = useCallback(() => setIsFocused(false), []);

    useEffect(() => {
        const focusableEl = findFocusableParent(targetRef.current);
        if (!focusableEl) {
            return;
        }

        focusableEl.addEventListener('focus', handleFocus);
        focusableEl.addEventListener('blur', handleBlur);

        /**
         * Register focus handler with ValueControl to respond to programmatic focus requests
         * Uses a blur/focus sequence to ensure proper focus behavior across browsers
         * @param {FocusOptions} [options] - Focus options like preventScroll
         */
        const unregisterDoFocus = valueControl.registerDoFocus(options => {
            focusableEl.blur();
            requestAnimationFrame(() => focusableEl.focus(options));
        });

        return () => {
            focusableEl.removeEventListener('focus', handleFocus);
            focusableEl.removeEventListener('blur', handleBlur);
            if (unregisterDoFocus instanceof Function) {
                unregisterDoFocus();
            }
        }
    }, [handleBlur, handleFocus, targetRef, valueControl])

    /**
     * Programmatically triggers focus on the target element through the ValueControl
     * This ensures consistent focus behavior and notifies other components of focus changes
     * @param {FocusOptions} [options] - Browser focus options (preventScroll, etc.)
     */
    const doFocus = useCallback<DoFocus>(options => {
        valueControl.focus(options);
    }, [valueControl]);


    return [isFocused, doFocus]
}


/**
 * Recursively searches for the nearest focusable parent element
 * A focusable element is defined as having tabIndex not equal to -1
 * 
 * @param {HTMLElement | null | undefined} element - Starting element for the search
 * @returns {HTMLElement | null} The first focusable parent element, or null if none found
 */
function findFocusableParent(element: HTMLElement | null | undefined): HTMLElement | null {
    if (!(element instanceof HTMLElement)) {
        return null;
    }
    if (element.tabIndex != -1) {
        return element;
    }
    return findFocusableParent(element.parentElement);
}