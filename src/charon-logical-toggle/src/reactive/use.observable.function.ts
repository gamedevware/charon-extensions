import { ObservableLike } from "charon-extensions";
import { useState, useEffect, useRef } from "react";

/**
 * Custom hook to subscribe to an Observable and track its state
 * Provides the current value, error, and completion status of an Observable
 * 
 * @template T - The type of value emitted by the Observable
 * @param {ObservableLike<T>} observable - The Observable to subscribe to
 * @returns {[value: T | undefined, error: Error | undefined, completed: boolean]} 
 * Tuple containing current value, error (if any), and completion status
 * 
 * @example
 * const [data, error, completed] = useObservable(api.getData$());
 * 
 * @example
 * // Usage with conditional rendering
 * if (error) return <div>Error: {error.message}</div>;
 * if (!data) return <div>Loading...</div>;
 * return <div>Data: {data}</div>;
 */
export function useObservable<T = any>(
    observable: ObservableLike<T>
): [value: T | undefined, error: Error | undefined, completed: boolean] {

    const controlRef = useRef(observable);
    const [value, setValue] = useState<T | undefined>(undefined);
    const [error, setError] = useState<Error | undefined>(undefined);
    const [completed, setCompleted] = useState<boolean>(false);

    useEffect(() => {
        if (controlRef.current && controlRef.current != observable) {
            setValue(undefined);
            setError(undefined);
            setCompleted(false);
        }
        controlRef.current = observable;

        const subscription = observable.subscribe({
            next: function onObservableNext(value) {
                setValue(value);
            },
            error: function onObservableError(error) {
                setError(error);
                setCompleted(true);
            },
            complete: function onObservableCompleted() {
                setCompleted(true);
            },
        });
        return subscription.unsubscribe.bind(subscription);
    }, [observable]);

    return [value, error, completed] as const;
}