import { DataType } from "charon-extensions";

export interface SchemaValidationError {
    modelPath: string[];
    propertyName: string;
    expectedTypes: DataType[];
    actualType?: DataType;
    missing: boolean;
}