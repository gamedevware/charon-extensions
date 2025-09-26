import { ControlEventEmitOptions } from "./control.event.emit.options";
import { DataDocument, DataDocumentId, DataDocumentReference } from "./data.document";
import { ValueControl } from "./value.control";

/**
 * Represents a collection control for document references
 * @extends ValueControl<DataDocumentReference[]>
 */
export declare interface ReferenceCollectionControl extends ValueControl<DataDocumentReference[]> {
    /** Type identifier for reference collection controls */
    readonly type: 'reference-collection';

    /** Array of child controls for each reference in the collection */
    readonly controls: readonly ValueControl<DataDocumentReference>[];

    /**
     * Checks if the collection contains a document with the specified ID
     * @param id - The document ID to check for
     * @returns True if the collection contains the document ID
     */
    containsId(id: DataDocumentId): boolean;
    
    /**
     * Appends a document reference to the end of the collection
     * @param document - The document reference to append
     * @param options - Options for emitting control events
     * @returns The newly created control for the appended document
     */
    append(document: DataDocumentReference, options?: ControlEventEmitOptions): ValueControl;
    
    /**
     * Inserts a document reference at the specified index
     * @param index - The index at which to insert the document
     * @param document - The document reference to insert
     * @param options - Options for emitting control events
     * @returns The newly created control for the inserted document
     */
    insertAt(index: number, document: DataDocument, options?: ControlEventEmitOptions): ValueControl;
    
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
 * Type guard to check if a ValueControl is a ReferenceCollectionControl
 * @param value - The control to check
 * @returns True if the control is a ReferenceCollectionControl
 */
export function isReferenceCollectionControl(value: ValueControl): value is ReferenceCollectionControl {
    return value && value.type === 'reference-collection';
}
