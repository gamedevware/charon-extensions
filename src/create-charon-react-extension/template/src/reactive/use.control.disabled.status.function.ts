import { ValueControl } from "charon-extensions";
import { useState, useEffect, useCallback, useRef } from "react";

export function useControlDisabledStatus(valueControl: ValueControl): [disabled: boolean, setDisabled: (disabled: boolean) => void] {
    const controlRef = useRef(valueControl);
    const [disabled, setDisabled] = useState<boolean>(valueControl.disabled);

    useEffect(() => {
        const subscription = valueControl.statusChanges.subscribe({
            next: function onValueControlStatusChanges() {
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
