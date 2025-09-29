import { ValueControl } from "charon-extensions";
import { useState, useEffect, useCallback } from "react";

export function useControlReadOnlyStatus(valueControl: ValueControl): [readOnly: boolean, setReadOnly: (readOnly: boolean) => void] {

    const [readOnly, setReadOnly] = useState<boolean>(valueControl.readOnly);

    useEffect(() => {
        const subscription = valueControl.statusChanges.subscribe({
            next: () => {
                if (readOnly == valueControl.readOnly) {
                    return;
                }
                setReadOnly(valueControl.readOnly);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [valueControl, readOnly]);

    const setControlStatus = useCallback((readOnly: boolean) => {
        if (readOnly) {
            valueControl.makeReadOnly();
        } else {
            valueControl.makeWriteable();
        }
    }, [valueControl]);

    return [readOnly, setControlStatus] as const;
}