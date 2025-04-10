import { ChangeEvent, useEffect, useState } from "react";
import Toggle from "react-toggle";
import { BehaviorSubject } from "rxjs";

export function LogicalToggle({
    value$,
    disabledState$,
    onValueChange,
}: {
    value$: BehaviorSubject<boolean>;
    disabledState$: BehaviorSubject<boolean>;
    onValueChange: (newVal: boolean) => void;
}) {
    const [checked, setChecked] = useState<boolean>(value$.value);
    const [disabled, setDisabled] = useState<boolean>(disabledState$.value);

    useEffect(() => {
        const subscription = value$.subscribe({
            next: setChecked,
        });
        subscription.add(disabledState$.subscribe({
            next: setDisabled
        }));

        // Cleanup on unmount
        return () => {
            subscription.unsubscribe();
        };
    }, [value$, disabledState$]); // Re-subscribe only if value$ or disabledState$ changes

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newVal = e.target.checked;
        if (newVal === value$.value) {
            return; // not changed
        }

        setChecked(newVal);
        onValueChange(newVal);
    };

    return <Toggle checked={checked} onChange={handleChange} disabled={disabled} />;
}