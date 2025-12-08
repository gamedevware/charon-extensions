import type { Schema } from "../metadata";
import type { DataDocument, DataDocumentReference } from "./data.document";
import type { DocumentCollectionControl } from "./document.collection";
import type { ReferenceCollectionControl } from "./reference.collection";
import { ValueControl } from "./value.control";

/**
 * Represents a control for a single document (non-root)
 * @extends ValueControl<DataDocument>
 */
export declare interface DocumentControl<DocumentT extends DataDocument = DataDocument> extends ValueControl<DocumentT> {
    /** Schema of document */
    readonly schema: Schema;

    /** Type identifier for document controls */
    readonly type: 'document';

    /** Child controls indexed by property name */
    readonly controls: DocumentControls<DocumentT>;
}

/**
 * Type guard to check if a ValueControl is a DocumentControl
 * @param value - The control to check
 * @returns True if the control is a DocumentControl
 */
export function isDocumentControl<DocumentT extends DataDocument = DataDocument>(value: ValueControl  | null | undefined): value is DocumentControl<DocumentT> {
    return !!value && value.type === 'document';
}

type ArrayItemType<T> = T extends (infer U)[] ? U : never;

type InferValueControlType<T> =
    [T] extends [any[]] ? ArrayItemType<T> extends DataDocumentReference ? ReferenceCollectionControl<ArrayItemType<T>> : DocumentCollectionControl<ArrayItemType<T>> :
    [T] extends [DataDocument] ? DocumentControl<T> :
    ValueControl<T>;

type DocumentControls<T extends DataDocument> = {
    readonly [K in keyof T]: InferValueControlType<T[K]>;
};