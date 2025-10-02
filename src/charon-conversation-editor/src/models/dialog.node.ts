import { DocumentControl, isDocumentControl, ValueControl, type DataDocument, type DataLocalizationDocument } from "charon-extensions";
import type { DialogNodeReference } from "./dialog.node.reference";
import type { DialogResponse } from "./dialog.response";

/**
 * Represents a single dialog node in a conversation tree
 * @extends DataDocument
 */
export interface DialogNode extends DataDocument {
    Id: string | number | bigint;
    Text: string | DataLocalizationDocument;
    NextNode: DialogNodeReference | null;
    Responses: DialogResponse[];
    Specification: string;
}

/**
 * Checks if a value control represents a DialogNode document
 * @param {ValueControl} valueControl - The control to validate
 * @returns {boolean} True if the control has DialogNode schema properties
 */
export function isDialogNodeControl(valueControl: ValueControl): valueControl is DocumentControl<DialogNode> {
    return isDocumentControl(valueControl) && valueControl.schema.hasSchemaProperty('Responses') &&
        valueControl.schema.hasSchemaProperty('Text') &&
        valueControl.schema.hasSchemaProperty('NextNode');
}

/**
 * Generates a temporary unique ID placeholder for a dialog node
 * The ID will be replaced with an actual unique value during save operation
 * @returns {string} A temporary unique ID string for dialog node
 */
export function generateDialogNodeIdPlaceholder(): string {
    return '_ID_DIALOG_NODE_' + Math.abs((Math.random() * Number.MAX_SAFE_INTEGER) | 0).toString(16);
}