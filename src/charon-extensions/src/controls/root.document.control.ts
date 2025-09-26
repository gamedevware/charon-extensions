import { Schema, SchemaProperty } from "../metadata";
import { ValueControl } from "./value.control";

/**
 * Represents the root document control in a form hierarchy
 * @extends ValueControl
 */
export declare interface RootDocumentControl extends ValueControl {
    /** The complete JSON schema for this document */
    readonly schema: Schema;
    
    /** Schema property is undefined for root documents */
    readonly schemaProperty: SchemaProperty & undefined;
    
    /** Type identifier for root document controls */
    readonly type: 'document';

    /** Child controls indexed by property name */
    readonly controls: Readonly<Record<string, ValueControl>>;
}

/**
 * Type guard to check if a ValueControl is a RootDocumentControl
 * @param value - The control to check
 * @returns True if the control is a RootDocumentControl
 */
export function isRootDocumentControl(value: ValueControl): value is RootDocumentControl {
    return value && value.type === 'document' && 'schema' in value && !value.schemaProperty;
}
