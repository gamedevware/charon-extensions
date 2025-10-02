import { ValueControl } from "charon-extensions";
import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Custom hook to manage and synchronize the disabled status of a ValueControl
 * Provides reactive disabled state and setter function to control the ValueControl's disabled status
 * 
 * @param {ValueControl} valueControl - The ValueControl instance to monitor and control
 * @returns {[disabled: boolean, setDisabled: (disabled: boolean) => void]} 
 * Tuple containing current disabled status and setter function
 * 
 * @example
 * const [disabled, setDisabled] = useControlDisabledStatus(formControl);
 * // disabled: true/false based on control status
 * // setDisabled(true) to disable the control
 */
export function useControlDisabledStatus(valueControl: ValueControl): [disabled: boolean, setDisabled: (disabled: boolean) => void] {
    const controlRef = useRef(valueControl);
    const [disabled, setDisabled] = useState<boolean>(valueControl.disabled);

    useEffect(() => {
        const subscription = valueControl.statusChanges.subscribe({
            next: function onValueControlStatucChanges() {
                if (disabled == valueControl.disabled) {
                    return;
                }
                setDisabled(valueControl.disabled);
            }
        });
        if (controlRef.current != valueControl) {
            controlRef.current = valueControl;
            setDisabled(valueControl.disabled);
        }

        return () => {
            subscription.unsubscribe();
        };
    }, [valueControl, disabled]);

    const setControlStatus = useCallback(function setDisabledStatus(disabled: boolean) {
        if (disabled) {
            valueControl.disable();
        } else {
            valueControl.enable();
        }
    }, [valueControl]);

    return [disabled, setControlStatus] as const;
}