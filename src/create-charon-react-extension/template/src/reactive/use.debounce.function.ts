import { useCallback, useRef } from "react";

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
