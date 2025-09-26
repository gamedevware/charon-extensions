import { ControlEventEmitOptions } from "./control.event.emit.options";
import { DataDocument, DataDocumentId, DataDocumentReference } from "./data.document";
import { ValueControl } from "./value.control";

export declare interface ReferenceCollectiontControl extends ValueControl<DataDocumentReference[]> {
    readonly type: 'reference-collection';

    readonly controls: readonly ValueControl<DataDocumentReference>[];

    containsId(id: DataDocumentId): boolean;
    append(document: DataDocumentReference, options?: ControlEventEmitOptions): ValueControl;
    insertAt(index: number, document: DataDocument, options?: ControlEventEmitOptions): ValueControl;
    swap(fromIndex: number, toIndex: number, options?: ControlEventEmitOptions): void;
    removeAt(index: number, options?: ControlEventEmitOptions): void;
    remove(document: DataDocument, options?: ControlEventEmitOptions): boolean;
}

export function isReferenceCollectiontControl(value: ValueControl): value is ReferenceCollectiontControl {
    return value && value.type === 'reference-collection';
}