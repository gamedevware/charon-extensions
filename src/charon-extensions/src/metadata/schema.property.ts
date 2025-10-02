import type { Metadata } from "./metadata";
import type { Schema } from "./schema";
import type { SchemaReference } from "./schema.reference";
import type { SpecificationDictionary } from "./specification.dictionary";
import { Uniqueness } from "./uniqueness";
import { Requirement } from "./requirement";
import { DataType } from "./data.type";

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
    readonly schema: Schema | null;

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