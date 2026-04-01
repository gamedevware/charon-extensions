import { ValueControl } from "charon-extensions";
import { useState, useEffect, useCallback, useRef } from "react";

export function useControlReadOnlyStatus(valueControl: ValueControl): [readOnly: boolean, setReadOnly: (readOnly: boolean) => void] {
    const controlRef = useRef(valueControl);
    const [readOnly, setReadOnly] = useState<boolean>(valueControl.readOnly);

    useEffect(() => {
        const subscription = valueControl.statusChanges.subscribe({
            next: function onValueControlStatusChanges() {
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
