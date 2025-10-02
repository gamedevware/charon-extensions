import { ReactNode, useRef, } from 'react';
import { DialogResponse } from '../models';
import { useLocalizedText } from '../state';
import { DocumentControl } from 'charon-extensions';
import { useControlValue } from '../reactive';
import { useControlFocusTarget } from './use.control.focus.target';
import { getDocumentIdAsString } from './document.control.functions';

/**
 * React Flow node component for displaying and interacting with dialog responses
 * Represents a single player response option within a dialog node
  */
function DialogTreeResponse({ responseControl, index, children }: { responseControl: DocumentControl<DialogResponse>, index: number, children: ReactNode }) {

    const [dialogResponse] = useControlValue(responseControl);
    const text = useLocalizedText(dialogResponse.Text);
    const dialogResponseId = getDocumentIdAsString(responseControl);

    const focusTargetRef = useRef<HTMLDivElement>(null);
    const [isFocused] = useControlFocusTarget(responseControl, focusTargetRef);

    return (
        <div
            className={`ext-ce-response-block ${isFocused ? 'selected' : ''}`}
            tabIndex={0}
            data-response-number={`#${index + 1}`}
            data-response-id={dialogResponseId}
            ref={focusTargetRef}
        >
            <span>{text}</span>

            {children}
        </div>
    );
}

export default DialogTreeResponse;