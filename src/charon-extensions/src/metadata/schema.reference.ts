import type { Schema } from "./schema";

/** A reference to another schema, used by Reference/ReferenceCollection properties and shared schema properties. */
export declare interface SchemaReference {
    /** Unique identifier of the referenced schema. */
    readonly id: string;
    /** Human-readable name of the referenced schema. */
    readonly displayName: string;

    /** Resolves and returns the referenced {@link Schema}. */
    getSchema(): Schema;

    toString(): string;
}
