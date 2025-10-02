import { DocumentControl, isDocumentControl, ValueControl, type DataDocument, type DataLocalizationDocument } from "charon-extensions";
import type { DialogNodeReference } from "./dialog.node.reference";

/**
 * Represents a player response option within a dialog node
 * @extends DataDocument
 */
export interface DialogResponse extends DataDocument {
    Id: string | number | bigint;
    Text: string | DataLocalizationDocument;
    NextNode: DialogNodeReference | null;
    Specification: string;
}

/**
 * Checks if a value control represents a DialogResponse document
 * @param {ValueControl} valueControl - The control to validate
 * @returns {boolean} True if the control has DialogResponse schema properties
 */
export function isDialogResponseControl(valueControl: ValueControl): valueControl is DocumentControl<DialogResponse> {
    return isDocumentControl(valueControl) && !valueControl.schema.hasSchemaProperty('Responses') &&
        valueControl.schema.hasSchemaProperty('Text') &&
        valueControl.schema.hasSchemaProperty('NextNode');
}

/**
 * Generates a temporary unique ID placeholder for a dialog response
 * The ID will be replaced with an actual unique value during save operation
 * @returns {string} A temporary unique ID string for dialog response
 */
export function generateDialogNodeResponseIdPlaceholder(): string {
    return '_ID_DIALOG_RESPONSE_' + Math.abs((Math.random() * Number.MAX_SAFE_INTEGER) | 0).toString(16);
}