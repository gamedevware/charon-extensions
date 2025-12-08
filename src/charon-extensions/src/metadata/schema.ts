import type { Metadata } from "./metadata";
import type { SchemaProperty } from "./schema.property";
import type { SpecificationDictionary } from "./specification.dictionary";
import { SchemaType } from "./schema.type";
import { IdGeneratorType } from "./id.generator.type";
import type { SchemaDocument } from "./schema.document";

export declare interface Schema {
    readonly metadata: Metadata;

    readonly id: string;
    readonly name: string;
    readonly displayName: string;
    readonly description: string;
    readonly type: SchemaType;
    readonly idGenerator: IdGeneratorType;
    readonly specification: string;
    readonly properties: readonly SchemaProperty[];
    readonly group: string;

    getSpecification(): SpecificationDictionary;
    hasSchemaProperty(schemaPropertyIdOrName: string): boolean;
    findSchemaProperty(schemaPropertyIdOrName: string): SchemaProperty | null;
    getSchemaProperty(schemaPropertyIdOrName: string): SchemaProperty;
    getReferencedBySchemas(): ReadonlySet<Schema>;
    getReferencedBySchemaProperty(): ReadonlySet<SchemaProperty>;
    getContainedBySchemas(): ReadonlySet<Schema>;
    getSchemaPropertyOrder(): ReadonlyArray<string>;
    getSchemaPropertyNames(): ReadonlySet<string>;
    getUniqueSchemaProperties(): ReadonlySet<SchemaProperty>;
    getIdProperty(): SchemaProperty;
    convertIdToString(id: any): string;
    formatDisplayText(document: object, specificationOverride?: SpecificationDictionary): string;

    getHashCode(): number;
    toDocument(): SchemaDocument;
    toString(): string;
}