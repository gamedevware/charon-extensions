import { ControlEventEmitOptions } from "./control.event.emit.options";
import { DataDocument } from "./data.document";
import { ValueControl } from "./value.control";

/**
 * Represents a collection control for full documents
 * @extends ValueControl<DataDocument[]>
 */
export declare interface DocumentCollectionControl extends ValueControl<DataDocument[]> {
    /** Type identifier for document collection controls */
    readonly type: 'document-collection';

    /** Array of child controls for each document in the collection */
    readonly controls: readonly ValueControl<DataDocument>[];

    /**
     * Appends a document to the end of the collection
     * @param document - The document to append
     * @param options - Options for emitting control events
     * @returns The newly created control for the appended document
     */
    append(document: DataDocument, options?: ControlEventEmitOptions): ValueControl<DataDocument>;
    
    /**
     * Inserts a document at the specified index
     * @param index - The index at which to insert the document
     * @param document - The document to insert
     * @param options - Options for emitting control events
     * @returns The newly created control for the inserted document
     */
    insertAt(index: number, document: DataDocument, options?: ControlEventEmitOptions): ValueControl<DataDocument>;
    
    /**
     * Swaps the positions of two documents in the collection
     * @param fromIndex - The index of the first document to swap
     * @param toIndex - The index of the second document to swap
     * @param options - Options for emitting control events
     */
    swap(fromIndex: number, toIndex: number, options?: ControlEventEmitOptions): void;
    
    /**
     * Removes a document at the specified index
     * @param index - The index of the document to remove
     * @param options - Options for emitting control events
     */
    removeAt(index: number, options?: ControlEventEmitOptions): void;
    
    /**
     * Removes a specific document from the collection
     * @param document - The document to remove
     * @param options - Options for emitting control events
     * @returns True if the document was found and removed
     */
    remove(document: DataDocument, options?: ControlEventEmitOptions): boolean;
}

/**
 * Type guard to check if a ValueControl is a DocumentCollectionControl
 * @param value - The control to check
 * @returns True if the control is a DocumentCollectionControl
 */
export function isDocumentCollectionControl(value: ValueControl): value is DocumentCollectionControl {
    return value && value.type === 'document-collection';
}
