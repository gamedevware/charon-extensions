import { ControlEventEmitOptions } from "./control.event.emit.options";
import { DataDocument, DataDocumentId, DataDocumentReference } from "./data.document";
import { ValueControl } from "./value.control";

/**
 * Represents a collection control for document references
 * @extends ValueControl<DataDocumentReference[]>
 */
export declare interface ReferenceCollectionControl<T extends DataDocumentReference = DataDocumentReference> extends ValueControl<T[]> {
    /** Type identifier for reference collection controls */
    readonly type: 'reference-collection';

    /**
     * Checks if the collection contains a reference with the specified ID
     * @param id - The reference ID to check for
     * @returns True if the collection contains the referenceID
     */
    containsId(id: DataDocumentId): boolean;

    /**
     * Appends a reference to the end of the collection
     * @param document - The reference to append
     * @param opts - Options for emitting control events
     */
    append(document: T, opts?: ControlEventEmitOptions): void;

    /**
     * Inserts a reference at the specified index
     * @param index - The index at which to insert the reference
     * @param reference - The reference to insert
     * @param opts - Options for emitting control events
     */
    insertAt(index: number, reference: T, opts?: ControlEventEmitOptions): void;

    /**
     * Swaps the positions of two reference in the collection
     * @param fromIndex - The index of the first reference to swap
     * @param toIndex - The index of the second reference to swap
     * @param opts - Options for emitting control events
     */
    swap(fromIndex: number, toIndex: number, opts?: ControlEventEmitOptions): void;

    /**
     * Removes a reference at the specified index
     * @param index - The index of the reference to remove
     * @param opts - Options for emitting control events
     */
    removeAt(index: number, opts?: ControlEventEmitOptions): void;

    /**
     * Removes a specific reference from the collection
     * @param reference - The reference to remove
     * @param opts - Options for emitting control events
     * @returns True if the reference was found and removed
     */
    remove(reference: T, opts?: ControlEventEmitOptions): boolean;
}

/**
 * Type guard to check if a ValueControl is a ReferenceCollectionControl
 * @param value - The control to check
 * @returns True if the control is a ReferenceCollectionControl
 */
export function isReferenceCollectionControl<T extends DataDocumentReference = DataDocumentReference>(value: ValueControl<any>): value is ReferenceCollectionControl<T> {
    return value && value.type === 'reference-collection';
}
