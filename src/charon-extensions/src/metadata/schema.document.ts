import type { DataType } from "./data.type";
import type { IdGeneratorType } from "./id.generator.type";
import type { Requirement } from "./requirement";
import type { SchemaType } from "./schema.type";
import type { Uniqueness } from "./uniqueness";

/* eslint-disable @typescript-eslint/naming-convention */

export interface SchemaDocument {
    Id: string;
    Name: string;
    DisplayName: string;
    Type: SchemaType;
    Description: string | null;
    IdGenerator: IdGeneratorType;
    Specification: string;
    Properties: SchemaPropertyDocument[];
}

export interface SchemaPropertyDocument {
    Id: string;
    SharedProperty: SchemaOrPropertyReferenceDocument | null;
    Name: string;
    DisplayName: string;
    Description: string | null;
    DataType: DataType;
    DefaultValue: any;
    Uniqueness: Uniqueness;
    Requirement: Requirement;
    ReferenceType: SchemaOrPropertyReferenceDocument | null;
    Size: number;
    Specification: string;
}

export interface SchemaOrPropertyReferenceDocument {
    Id: string;
    DisplayName?: string;
}
