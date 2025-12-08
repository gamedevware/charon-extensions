import { Schema, SchemaProperty } from "../metadata";
import { DataDocument } from "./data.document";
import type { DocumentControl } from "./document.control";
import { RootDocumentControlServices } from "./root.document.services";
import { isValueControl, ValueControl } from "./value.control";

/**
 * Represents the root document control in a form hierarchy
 * @extends DocumentControl
 */
export declare interface RootDocumentControl<DocumentT extends DataDocument = DataDocument> extends DocumentControl<DocumentT> {
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
export function isRootDocumentControl<DocumentT extends DataDocument = DataDocument>(value: ValueControl | null | undefined): value is RootDocumentControl<DocumentT> {
    return !!value &&
        value.type === 'document' &&
        'schema' in value &&
        (!value.schemaProperty || Object.is(value.schemaProperty, (<Schema>value.schema).getIdProperty()));
}

/**
 * Get typed RootDocumentControl of specified ValueControl or throws error if root is not available.
 * @param value - The control to root of.
 * @returns RootDocumentControl of specified ValueControl
 */
export function getRootDocumentControl<DocumentT extends DataDocument = DataDocument>(value: ValueControl | null | undefined): RootDocumentControl<DocumentT> {
    const rootOrNull = isValueControl(value) ? value.root : null;
    if (!isRootDocumentControl<DocumentT>(rootOrNull)) {
        throw new Error('Unable to find root node for the specified control.');
    }
    return rootOrNull;
}



