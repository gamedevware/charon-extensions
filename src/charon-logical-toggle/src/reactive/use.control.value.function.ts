import { ValueControl } from "charon-extensions";
import { useState, useEffect, useCallback } from "react";

export function useControlValue<T = any>(
    valueControl: ValueControl<T>,
    equalityFn?: (x: T, y: T) => boolean
): [value: T, updateValue: (value: T) => void] {

    const [value, setValue] = useState<T>(valueControl.value);

    useEffect(() => {
        const subscription = valueControl.valueChanges.subscribe({
            next: () => {
                if (equalityFn ? equalityFn(value, valueControl.value) : value === valueControl.value) {
                    return;
                }
                setValue(valueControl.value);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [valueControl, value, equalityFn]);

    const setControlValue = useCallback((newValue: T) => {
        valueControl.setValue(newValue);
    }, [valueControl]);

    return [value, setControlValue] as const;
}