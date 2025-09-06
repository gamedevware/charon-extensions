import { Schema } from "../metadata";
import { ValueControl } from "./value.control";

export declare interface DocumentControl<TValue = any> extends Omit<ValueControl, 'schemaProperty'> {
    readonly schema: Schema;
}
