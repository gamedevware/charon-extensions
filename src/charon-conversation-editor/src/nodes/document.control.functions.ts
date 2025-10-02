import { DocumentControl } from "charon-extensions";

/**
 * Formats display text for a document stored in a document control
 * Uses the schema's display name formatter to create a user-friendly representation
 * @param {DocumentControl} documentControl - The document control containing the document to format
 * @returns {string} A textual representation of the document suitable for display
 */
export function formatDocumentDisplayText(documentControl: DocumentControl): string {
    return documentControl.schema.formatDisplayText(documentControl.value);
}

/**
 * Extracts and converts the document ID to a string representation
 * Safely retrieves the ID from the document control and converts it using schema conversion.
 * @param {DocumentControl} documentControl - The document control containing the document ID
 * @returns {string} The document ID as a string, or empty string if conversion fails
 */
export function getDocumentIdAsString(documentControl: DocumentControl): string {
    const idControl = documentControl.controls.Id;
    return idControl.schemaProperty.convertToString(idControl.value) ?? '';
}