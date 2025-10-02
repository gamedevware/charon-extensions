import { ControlEventEmitOptions, ValueControl } from "charon-extensions";
import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Custom hook to manage and synchronize the value of a ValueControl
 * Provides reactive value state and setter function with optional custom equality comparison
 * 
 * @template T - The type of the value controlled by the ValueControl
 * @param {ValueControl<T>} valueControl - The ValueControl instance to monitor and control
 * @param {(x: T, y: T) => boolean} [equalityFn] - Optional custom equality function for value comparison
 * @returns {[value: T, updateValue: (value: T, opts?: ControlEventEmitOptions) => void]} 
 * Tuple containing current value and setter function with emit options
 * 
 * @example
 * // Basic usage
 * const [value, setValue] = useControlValue(formControl);
 * 
 * @example
 * // With custom equality function
 * const [value, setValue] = useControlValue(formControl, (a, b) => deepEqual(a, b));
 */
export function useControlValue<T = any>(
    valueControl: ValueControl<T>,
    equalityFn?: (x: T, y: T) => boolean
): [value: T, updateValue: (value: T, opts?: ControlEventEmitOptions) => void] {

    const controlRef = useRef(valueControl);
    const [value, setValue] = useState<T>(valueControl.value);

    useEffect(() => {
        const subscription = valueControl.valueChanges.subscribe({
            next: function onValueControlValueChanges() {
                if (equalityFn ? equalityFn(value, valueControl.value) : value === valueControl.value) {
                    return;
                }
                setValue(valueControl.value);
            }
        });
        if (controlRef.current != valueControl) {
            controlRef.current = valueControl;
            setValue(valueControl.value);
        }

        return () => {
            subscription.unsubscribe();
        };
    }, [valueControl, value, equalityFn]);

    const setControlValue = useCallback((value: T, opts?: ControlEventEmitOptions) =>
        valueControl.setValue(value, opts),
        [valueControl]
    );

    return [value, setControlValue] as const;
}