import type { Metadata } from "./metadata";
import type { Schema } from "./schema";
import type { SchemaReference } from "./schema.reference";
import type { SpecificationDictionary } from "./specification.dictionary";
import { Uniqueness } from "./uniqueness";
import { Requirement } from "./requirement";
import { DataType } from "./data.type";
import type { SchemaPropertyDocument } from "./schema.document";

/** Describes a single property (field) within a schema, including its data type, constraints, and behavior. */
export declare interface SchemaProperty {
    /** Unique property identifier. */
    readonly id: string;
    /** Property name used in code and API calls. */
    readonly name: string;
    /** Human-readable display name shown in the UI. */
    readonly displayName: string;
    /** Property description text. */
    readonly description: string;
    /** The data type of this property's values. */
    readonly dataType: DataType;
    /** Default value as a string, or null if none. */
    readonly defaultValue: string | null;
    /** Uniqueness constraint for this property's values. */
    readonly uniqueness: Uniqueness;
    /** Requirement level for this property's values. */
    readonly requirement: Requirement;
    /** For Reference/ReferenceCollection — the target schema reference, or null. */
    readonly referenceType: SchemaReference | null;
    /** If this property inherits from a shared schema property — the reference to it, or null. */
    readonly sharedProperty: SchemaReference | null;
    /** Maximum size/length constraint (interpretation depends on data type). */
    readonly size: number;
    /** Raw specification string (key=value pairs for UI hints and behavior). */
    readonly specification: string;

    /** Reference to the parent {@link Metadata}. */
    readonly metadata: Metadata;
    /** The schema this property belongs to, or null for shared properties. */
    readonly schema: Schema | null;

    /** For Reference/ReferenceCollection — resolves and returns the referenced {@link Schema}. */
    getReferencedSchema(): Schema;
    /** Returns the parsed {@link SpecificationDictionary} for this property. */
    getSpecification(): SpecificationDictionary;
    /** Returns the default value converted to its typed representation. */
    getTypedDefaultValue(): any;
    /** Returns the initial value for this property when creating a new document. */
    getValueForNewDocument(): any;
    /** Converts a raw value to this property's typed representation. */
    convertFrom(value: any): any;
    /** Converts a typed value to its string representation, or null. */
    convertToString(value: any): string | null;
    /** Converts a typed value to a human-readable display string. */
    convertToDisplayString(value: any): string;
    /** Checks whether two values are equal according to this property's data type semantics. */
    valuesAreEquals(left: any, right: any): boolean;
    /** Returns the minimum allowed value for numeric types, or undefined. */
    getMinValue(): bigint | undefined;
    /** Returns the maximum allowed value for numeric types, or undefined. */
    getMaxValue(): bigint | undefined;

    /** Returns a hash code representing the current property state. */
    getHashCode(): number;
    /** Serializes this property to a {@link SchemaPropertyDocument}. */
    toDocument(): SchemaPropertyDocument;
    toString(): string;
}
