import { ValueControl } from "charon-extensions";
import { ChangeEvent, memo, useCallback, useEffect, useRef } from "react";
import Toggle from "react-toggle";
import { useControlDisabledStatus, useControlValue } from "./reactive";
import { focusComponentInput } from "./focus.component.input.function";

function LogicalToggle({ valueControl }: { valueControl: ValueControl<boolean> }) {
    const [checked, setChecked] = useControlValue<boolean>(valueControl);
    const [disabled] = useControlDisabledStatus(valueControl);
    const toggleRef = useRef<Toggle>(null);

    // handle toggling and pass value to valueControl
    const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setChecked(e.target.checked);
    }, [setChecked]);

    // subscribe to focus requests
    useEffect(() => {
        return valueControl.registerDoFocus((options?: FocusOptions) =>
            focusComponentInput(toggleRef, options)
        );
    }, [valueControl]);

    return <Toggle ref={toggleRef} checked={checked} onChange={handleChange} disabled={disabled} />;
}

export default memo(LogicalToggle);