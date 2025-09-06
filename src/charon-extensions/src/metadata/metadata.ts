import { DataType } from "./data.type";
import { IdGeneratorType } from "./id.generator.type";
import { Language } from "./language";
import { Requirement } from "./requirement";
import { SchemaType } from "./schema.type";
import { SpecificationDictionary } from "./specification.dictionary";
import { Uniqueness } from "./uniqueness";

export declare interface Metadata {
    readonly projectSettings: ProjectSettings;

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
    formatDisplayName(document: object, specificationOverride?: SpecificationDictionary): string;

    getHashCode(): number;
    toString(): string;
}

export declare interface SchemaProperty {
    readonly id: string;
    readonly name: string;
    readonly displayName: string;
    readonly description: string;
    readonly dataType: DataType;
    readonly defaultValue: string | null;
    readonly uniqueness: Uniqueness;
    readonly requirement: Requirement;
    readonly referenceType: SchemaReference | null;
    readonly sharedProperty: SchemaReference | null;
    readonly size: number;
    readonly specification: string;

    readonly metadata: Metadata;
    readonly schema: Schema;

    getReferencedSchema(): Schema;
    getSpecification(): SpecificationDictionary;
    getTypedDefaultValue(): any;
    getValueForNewDocument(): any;
    convertFrom(value: any): any;
    convertToString(value: any): string | null;
    convertToDisplayString(value: any): string;
    valuesAreEquals(left: any, right: any): boolean;
    getMinValue(): bigint | undefined;
    getMaxValue(): bigint | undefined;

    getHashCode(): number;
    toString(): string;
}

export declare interface ProjectSettings {
    readonly id: string;
    readonly name: string;
    readonly version: string;
    readonly copyright: string;
    readonly languages: string;
    readonly primaryLanguage: string;
    readonly extensions: string;

    getLanguages(): ReadonlyArray<Language>;
    getLanguageIds(): ReadonlyArray<string>;
    getPrimaryLanguage(): Language;
    getExtensions(): ReadonlyMap<string, string>;

    getHashCode(): number;
    toString(): string;
}

export declare interface SchemaReference {
    readonly id: string;
    readonly displayName: string;

    getSchema(): Schema;

    toString(): string;
}
