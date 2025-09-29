import { ValueControl } from "charon-extensions";
import { useState, useEffect, useCallback } from "react";

export function useControlDisabledStatus(valueControl: ValueControl): [disabled: boolean, setDisabled: (disabled: boolean) => void] {

    const [disabled, setDisabled] = useState<boolean>(valueControl.disabled);

    useEffect(() => {
        const subscription = valueControl.statusChanges.subscribe({
            next: () => {
                if (disabled == valueControl.disabled) {
                    return;
                }
                setDisabled(valueControl.disabled);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [valueControl, disabled]);

    const setControlDisabled = useCallback((disabled: boolean) => {
        if (disabled) {
            valueControl.disable();
        } else {
            valueControl.enable();
        }
    }, [valueControl]);

    return [disabled, setControlDisabled] as const;
}