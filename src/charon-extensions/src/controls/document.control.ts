import { DataDocument } from "./data.document";
import { ValueControl } from "./value.control";

export declare interface DocumentControl extends ValueControl<DataDocument> {
    readonly type: 'document';

    readonly controls: Readonly<Record<string, ValueControl>>;
}

export function isDocumentControl(value: ValueControl): value is DocumentControl {
    return value && value.type === 'document';
}
