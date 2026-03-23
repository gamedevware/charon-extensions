import type { DataType } from "./data.type";
import type { IdGeneratorType } from "./id.generator.type";
import type { Requirement } from "./requirement";
import type { SchemaType } from "./schema.type";
import type { Uniqueness } from "./uniqueness";

/* eslint-disable @typescript-eslint/naming-convention */

/** Serializable document representation of a {@link Schema}. */
export interface SchemaDocument {
    Id: string;
    Name: string;
    DisplayName: string;
    Type: SchemaType;
    Description: string | null;
    IdGenerator: IdGeneratorType;
    /** Raw specification string (key=value pairs). */
    Specification: string;
    Properties: SchemaPropertyDocument[];
}

/** Serializable document representation of a {@link SchemaProperty}. */
export interface SchemaPropertyDocument {
    Id: string;
    /** Reference to a shared schema property this property inherits from, or null. */
    SharedProperty: SchemaOrPropertyReferenceDocument | null;
    Name: string;
    DisplayName: string;
    Description: string | null;
    DataType: DataType;
    DefaultValue: any;
    Uniqueness: Uniqueness;
    Requirement: Requirement;
    /** For Reference/ReferenceCollection data types — the target schema. */
    ReferenceType: SchemaOrPropertyReferenceDocument | null;
    Size: number;
    /** Raw specification string (key=value pairs). */
    Specification: string;
}

/** Minimal reference to a schema or schema property by Id. */
export interface SchemaOrPropertyReferenceDocument {
    Id: string;
    DisplayName?: string;
}
