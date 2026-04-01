import { ObservableLike } from "charon-extensions";
import { useState, useEffect, useRef } from "react";

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
