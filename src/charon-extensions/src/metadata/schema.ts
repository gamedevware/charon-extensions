import type { Metadata } from "./metadata";
import type { SchemaProperty } from "./schema.property";
import type { SpecificationDictionary } from "./specification.dictionary";
import { SchemaType } from "./schema.type";
import { IdGeneratorType } from "./id.generator.type";
import type { SchemaDocument } from "./schema.document";

/** Describes a game data schema — the structure, type, and behavior of a collection of documents. */
export declare interface Schema {
    /** Reference to the parent {@link Metadata} this schema belongs to. */
    readonly metadata: Metadata;

    /** Unique schema identifier. */
    readonly id: string;
    /** Schema name used in code and API calls. */
    readonly name: string;
    /** Human-readable display name shown in the UI. */
    readonly displayName: string;
    /** Schema description text. */
    readonly description: string;
    /** Structural type (Normal, Component, Settings, or Union). */
    readonly type: SchemaType;
    /** Strategy used to auto-generate document Id values. */
    readonly idGenerator: IdGeneratorType;
    /** Raw specification string (key=value pairs for UI hints and behavior). */
    readonly specification: string;
    /** All properties defined on this schema. */
    readonly properties: readonly SchemaProperty[];
    /** Navigation menu folder path (e.g., "Economy/Shop"). Only meaningful for Normal schemas. */
    readonly group: string;

    /** Returns the parsed {@link SpecificationDictionary} for this schema. */
    getSpecification(): SpecificationDictionary;
    /** Checks whether a property with the given name or id exists on this schema. */
    hasSchemaProperty(schemaPropertyIdOrName: string): boolean;
    /** Returns a property by name or id, or null if not found. */
    findSchemaProperty(schemaPropertyIdOrName: string): SchemaProperty | null;
    /** Returns a property by name or id. Throws if not found. */
    getSchemaProperty(schemaPropertyIdOrName: string): SchemaProperty;
    /** Returns schemas that reference this schema via Reference/ReferenceCollection properties. */
    getReferencedBySchemas(): ReadonlySet<Schema>;
    /** Returns properties from other schemas that reference this schema. */
    getReferencedBySchemaProperty(): ReadonlySet<SchemaProperty>;
    /** Returns schemas that embed this schema via Document/DocumentCollection properties. */
    getContainedBySchemas(): ReadonlySet<Schema>;
    /** Returns property ids in their configured display order. */
    getSchemaPropertyOrder(): ReadonlyArray<string>;
    /** Returns the set of all property names on this schema. */
    getSchemaPropertyNames(): ReadonlySet<string>;
    /** Returns properties that have a uniqueness constraint. */
    getUniqueSchemaProperties(): ReadonlySet<SchemaProperty>;
    /** Returns the Id property of this schema. */
    getIdProperty(): SchemaProperty;
    /** Converts a document id value to its string representation. */
    convertIdToString(id: any): string;
    /** Formats a document's display text using the schema's display text template. */
    formatDisplayText(document: object, specificationOverride?: SpecificationDictionary): string;

    /** Returns a hash code representing the current schema state. */
    getHashCode(): number;
    /** Serializes this schema to a {@link SchemaDocument}. */
    toDocument(): SchemaDocument;
    toString(): string;
}
