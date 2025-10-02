import { useCallback, useRef } from "react";

/**
 * Custom hook that creates a debounced version of the provided function
 * Delays function execution until after the specified delay time has elapsed
 * 
 * @template T - The function type to debounce
 * @param {T} fn - The function to debounce
 * @param {number} delayMs - The delay in milliseconds to wait before executing the function
 * @returns {T} Debounced version of the original function
 * 
 * @example
 * const debouncedSearch = useDebounce((query) => {
 *   api.search(query);
 * }, 300);
 * 
 * // Calling debouncedSearch multiple times quickly will only execute once after 300ms
 */
export function useDebounce<T extends (...args: any) => any>(fn: T, delayMs: number): T {
    const timeoutId = useRef<number>(undefined);

    return useCallback(function debounce(...args: any[]) {
        if (timeoutId.current) {
            clearTimeout(timeoutId.current);
        }
        timeoutId.current = setTimeout(
            () => fn(...args), delayMs
        )
    } as unknown as T, [delayMs, fn]);
}

/**
 * Custom hook that creates a debounced function with per-key deduplication
 * Each key has its own separate debounce timer, allowing independent debouncing for different entities
 * 
 * @template T - The function type to debounce
 * @template KeyT - The type of the key used for deduplication
 * @param {T} fn - The function to debounce
 * @param {number} delayMs - The delay in milliseconds to wait before executing the function
 * @param {(args: Parameters<T>) => KeyT} keySelector - Function to extract key from function arguments
 * @returns {T} Debounced version of the original function with per-key deduplication
 * 
 * @example
 * const debouncedUpdate = usePerKeyDebounce(
 *   (userId, data) => api.updateUser(userId, data),
 *   300,
 *   ([userId]) => userId // Use userId as the debounce key
 * );
 * 
 * // Updates for user1 and user2 are debounced independently
 */
export function usePerKeyDebounce<T extends (...args: any) => any, KeyT = any>(fn: T, delayMs: number, keySelector: (args: Parameters<T>) => KeyT): T {
    const timeoutById = useRef<Map<KeyT, number>>(new Map());

    return useCallback(function distinctDebounce(...args: Parameters<T>) {
        const key = keySelector(args);
        const prevTimeoutId = timeoutById.current.get(key);
        if (prevTimeoutId) {
            clearTimeout(prevTimeoutId);
        }
        const newTimeoutId = setTimeout(
            () => fn(...args), delayMs
        );
        timeoutById.current.set(key, newTimeoutId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    } as unknown as T, [delayMs, fn]);
}