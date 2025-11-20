import { Schema, SchemaProperty } from "../metadata";
import { DataDocument } from "./data.document";
import type { DocumentControl } from "./document.control";
import { RootDocumentControlServices } from "./root.document.services";
import { ValueControl } from "./value.control";

/**
 * Represents the root document control in a form hierarchy
 * @extends DocumentControl
 */
export declare interface RootDocumentControl<T extends DataDocument = DataDocument> extends DocumentControl<T> {
    /** The complete JSON schema for this document */
    readonly schema: Schema;

    /** Schema property is undefined for root documents */
    readonly schemaProperty: SchemaProperty & undefined;

    /** Other services related to current context */
    readonly services: Partial<RootDocumentControlServices>;
}

/**
 * Type guard to check if a ValueControl is a RootDocumentControl
 * @param value - The control to check
 * @returns True if the control is a RootDocumentControl
 */
export function isRootDocumentControl<T extends DataDocument = DataDocument>(value: ValueControl): value is RootDocumentControl<T> {
    return value &&
        value.type === 'document' &&
        'schema' in value &&
        (!value.schemaProperty || Object.is(value.schemaProperty, (<Schema>value.schema).getIdProperty()));
}
