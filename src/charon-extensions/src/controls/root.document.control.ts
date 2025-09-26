import { Schema, SchemaProperty } from "../metadata";
import { ValueControl } from "./value.control";

export declare interface RootDocumentControl extends ValueControl {
    readonly schema: Schema;
    readonly schemaProperty: SchemaProperty & undefined;
    readonly type: 'document';

    readonly controls: Readonly<Record<string, ValueControl>>;
}

export function isRootDocumentControl(value: ValueControl): value is RootDocumentControl {
    return value && value.type === 'document' && 'schema' in value && !value.schemaProperty;
}
