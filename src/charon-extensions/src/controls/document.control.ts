import { DataDocument } from "./data.document";
import { ValueControl } from "./value.control";

/**
 * Represents a control for a single document (non-root)
 * @extends ValueControl<DataDocument>
 */
export declare interface DocumentControl extends ValueControl<DataDocument> {
    /** Type identifier for document controls */
    readonly type: 'document';

    /** Child controls indexed by property name */
    readonly controls: Readonly<Record<string, ValueControl>>;
}

/**
 * Type guard to check if a ValueControl is a DocumentControl
 * @param value - The control to check
 * @returns True if the control is a DocumentControl
 */
export function isDocumentControl(value: ValueControl): value is DocumentControl {
    return value && value.type === 'document';
}
