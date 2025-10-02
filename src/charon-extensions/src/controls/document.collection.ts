import { ControlEventEmitOptions } from "./control.event.emit.options";
import { DataDocument } from "./data.document";
import { DocumentControl } from "./document.control";
import { ValueControl } from "./value.control";

/**
 * Represents a collection control for full documents
 * @extends ValueControl<DataDocument[]>
 */
export declare interface DocumentCollectionControl<T extends DataDocument = DataDocument> extends ValueControl<T[]> {
    /** Type identifier for document collection controls */
    readonly type: 'document-collection';

    /** Array of child controls for each document in the collection */
    readonly controls: readonly DocumentControl<T>[];

    /**
     * Appends a document to the end of the collection
     * @param document - The document to append
     * @param opts - Options for emitting control events
     * @returns The newly created control for the appended document
     */
    append(document: T, opts?: ControlEventEmitOptions): DocumentControl<T>;

    /**
     * Inserts a document at the specified index
     * @param index - The index at which to insert the document
     * @param document - The document to insert
     * @param opts - Options for emitting control events
     * @returns The newly created control for the inserted document
     */
    insertAt(index: number, document: T, opts?: ControlEventEmitOptions): DocumentControl<T>;

    /**
     * Swaps the positions of two documents in the collection
     * @param fromIndex - The index of the first document to swap
     * @param toIndex - The index of the second document to swap
     * @param opts - Options for emitting control events
     */
    swap(fromIndex: number, toIndex: number, opts?: ControlEventEmitOptions): void;

    /**
     * Removes a document at the specified index
     * @param index - The index of the document to remove
     * @param opts - Options for emitting control events
     */
    removeAt(index: number, opts?: ControlEventEmitOptions): void;

    /**
     * Removes a specific document from the collection
     * @param document - The document to remove
     * @param opts - Options for emitting control events
     * @returns True if the document was found and removed
     */
    remove(document: T, opts?: ControlEventEmitOptions): boolean;
}

/**
 * Type guard to check if a ValueControl is a DocumentCollectionControl
 * @param value - The control to check
 * @returns True if the control is a DocumentCollectionControl
 */
export function isDocumentCollectionControl<T extends DataDocument = DataDocument>(value: ValueControl): value is DocumentCollectionControl<T> {
    return value && value.type === 'document-collection';
}
