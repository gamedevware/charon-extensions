import type { ProjectSettings } from "./project.settings";
import type { Schema } from "./schema";
import type { SchemaProperty } from "./schema.property";

/** Root metadata container providing access to all schemas, shared properties, and project settings. */
export declare interface Metadata {
    /** Project-wide settings and configuration. */
    readonly projectSettings: ProjectSettings;
    /** All schemas defined in the project. */
    readonly schemas: readonly Schema[];

    /** Returns an iterator over all schemas. */
    getSchemas(): IterableIterator<Schema>;
    /** Returns a schema by name or id. Throws if not found. */
    getSchema(schemaNameOrId: string): Schema;
    /** Returns a schema by name or id, or null if not found. */
    findSchema(schemaNameOrId: string): Schema | null;
    /** Checks whether a schema with the given name or id exists. */
    hasSchema(schemaNameOrId: string): boolean;
    /** Returns an iterator over all shared (reusable) schema properties. */
    getSharedSchemaProperties(): IterableIterator<SchemaProperty>;
    /** Returns a shared schema property by name or id. Throws if not found. */
    getSharedSchemaProperty(sharedSchemaPropertyNameOrId: string): SchemaProperty;
    /** Returns a shared schema property by name or id, or null if not found. */
    findSharedSchemaProperty(sharedSchemaPropertyNameOrId: string): SchemaProperty | null;
    /** Checks whether a shared schema property with the given name or id exists. */
    hasSharedSchemaProperty(sharedSchemaPropertyNameOrId: string): boolean;

    /** Returns a hash code representing the current metadata state (changes when schemas are modified). */
    getHashCode(): number;
}
