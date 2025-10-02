import type { Schema } from "./schema";

export declare interface SchemaReference {
    readonly id: string;
    readonly displayName: string;

    getSchema(): Schema;

    toString(): string;
}
