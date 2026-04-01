import { ControlEventEmitOptions, ValueControl } from "charon-extensions";
import { useState, useEffect, useCallback, useRef } from "react";

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
