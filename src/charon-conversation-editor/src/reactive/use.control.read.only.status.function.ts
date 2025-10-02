import { ValueControl } from "charon-extensions";
import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Custom hook to manage and synchronize the read-only status of a ValueControl
 * Provides reactive read-only state and setter function to control the ValueControl's read-only status
 * 
 * @param {ValueControl} valueControl - The ValueControl instance to monitor and control
 * @returns {[readOnly: boolean, setReadOnly: (readOnly: boolean) => void]} 
 * Tuple containing current read-only status and setter function
 * 
 * @example
 * const [readOnly, setReadOnly] = useControlReadOnlyStatus(formControl);
 * // readOnly: true/false based on control status
 * // setReadOnly(true) to make the control read-only
 */
export function useControlReadOnlyStatus(valueControl: ValueControl): [readOnly: boolean, setReadOnly: (readOnly: boolean) => void] {
    const controlRef = useRef(valueControl);
    const [readOnly, setReadOnly] = useState<boolean>(valueControl.readOnly);

    useEffect(() => {
        const subscription = valueControl.statusChanges.subscribe({
            next: function onValueControlStatucChanges() {
                if (readOnly == valueControl.readOnly) {
                    return;
                }
                setReadOnly(valueControl.readOnly);
            }
        });
        if (controlRef.current != valueControl) {
            controlRef.current = valueControl;
            setReadOnly(valueControl.readOnly);
        }

        return () => {
            subscription.unsubscribe();
        };
    }, [valueControl, readOnly]);

    const setControlStatus = useCallback(function setReadOnlyStatus(readOnly: boolean) {
        if (readOnly) {
            valueControl.makeReadOnly();
        } else {
            valueControl.makeWriteable();
        }
    }, [valueControl]);

    return [readOnly, setControlStatus] as const;
}