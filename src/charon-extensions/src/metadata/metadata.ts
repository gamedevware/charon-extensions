import type { ProjectSettings } from "./project.settings";
import type { Schema } from "./schema";
import type { SchemaProperty } from "./schema.property";

export declare interface Metadata {
    readonly projectSettings: ProjectSettings;
    readonly schemas: readonly Schema[];

    getSchemas(): IterableIterator<Schema>;
    getSchema(schemaNameOrId: string): Schema;
    findSchema(schemaNameOrId: string): Schema | null;
    hasSchema(schemaNameOrId: string): boolean;
    getSharedSchemaProperties(): IterableIterator<SchemaProperty>;
    getSharedSchemaProperty(sharedSchemaPropertyNameOrId: string): SchemaProperty;
    findSharedSchemaProperty(sharedSchemaPropertyNameOrId: string): SchemaProperty | null;
    hasSharedSchemaProperty(sharedSchemaPropertyNameOrId: string): boolean;

    getHashCode(): number;
}
