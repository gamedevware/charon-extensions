import { ControlEventEmitOptions } from "./control.event.emit.options";
import { DataDocument } from "./data.document";
import { ValueControl } from "./value.control";

export declare interface DocumentCollectionControl extends ValueControl<DataDocument[]> {
    readonly type: 'document-collection';

    readonly controls: readonly ValueControl<DataDocument>[];

    append(document: DataDocument, options?: ControlEventEmitOptions): ValueControl<DataDocument>;
    insertAt(index: number, document: DataDocument, options?: ControlEventEmitOptions): ValueControl<DataDocument>;
    swap(fromIndex: number, toIndex: number, options?: ControlEventEmitOptions): void;
    removeAt(index: number, options?: ControlEventEmitOptions): void;
    remove(document: DataDocument, options?: ControlEventEmitOptions): boolean;
}

export function isDocumentCollectionControl(value: ValueControl): value is DocumentCollectionControl {
    return value && value.type === 'document-collection';
}