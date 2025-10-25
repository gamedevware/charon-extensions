import { Schema, DataType } from "charon-extensions";
import { SchemaValidationError } from "./schema.validation.error";

export function validateSchema(conversationTreeSchema: Schema): readonly SchemaValidationError[] {
    const errors: SchemaValidationError[] = [];

    // Validate root ConversationTree properties
    const conversationPath = [conversationTreeSchema.displayName];
    validateProperty(conversationTreeSchema, conversationPath, 'RootNode', [DataType.Reference], errors);
    validateProperty(conversationTreeSchema, conversationPath, 'Nodes', [DataType.DocumentCollection], errors);
    validateProperty(conversationTreeSchema, conversationPath, 'Specification', [DataType.Text], errors);

    // Validate DialogNode properties if Nodes collection exists
    const nodesProperty = conversationTreeSchema.findSchemaProperty('Nodes');
    if (nodesProperty?.dataType === DataType.DocumentCollection) {
        try {
            const dialogNodeSchema = nodesProperty.getReferencedSchema();
            const dialogPath = [conversationTreeSchema.displayName, 'Nodes', dialogNodeSchema.displayName];

            validateProperty(dialogNodeSchema, dialogPath, 'Text', [DataType.Text, DataType.LocalizedText], errors);
            validateProperty(dialogNodeSchema, dialogPath, 'NextNode', [DataType.Reference], errors);
            validateProperty(dialogNodeSchema, dialogPath, 'Responses', [DataType.DocumentCollection], errors);
            validateProperty(dialogNodeSchema, dialogPath, 'Specification', [DataType.Text], errors);

            // Validate DialogResponse properties if Responses collection exists
            const responsesProperty = dialogNodeSchema.findSchemaProperty('Responses');
            if (responsesProperty?.dataType === DataType.DocumentCollection) {
                try {
                    const dialogResponseSchema = responsesProperty.getReferencedSchema();
                    const responsePath = [conversationTreeSchema.displayName, 'Nodes', dialogNodeSchema.displayName, 'Responses', dialogResponseSchema.displayName];

                    validateProperty(dialogResponseSchema, responsePath, 'Text', [DataType.Text, DataType.LocalizedText], errors);
                    validateProperty(dialogResponseSchema, responsePath, 'NextNode', [DataType.Reference], errors);
                    validateProperty(dialogResponseSchema, responsePath, 'Specification', [DataType.Text], errors);
                } catch {
                    // Unable to get referenced schema
                }
            }
        } catch {
            // Unable to get referenced schema
        }
    }

    return errors;
}

function validateProperty(
    schema: Schema,
    modelPath: string[],
    propertyName: string,
    expectedTypes: DataType[],
    errors: SchemaValidationError[]
): void {
    const property = schema.findSchemaProperty(propertyName);

    if (!property) {
        errors.push({
            modelPath,
            propertyName,
            expectedTypes,
            missing: true
        });
        return;
    }

    const isValidType = expectedTypes.some(expectedType => property.dataType === expectedType);
    if (!isValidType) {
        errors.push({
            modelPath,
            propertyName,
            expectedTypes,
            actualType: property.dataType,
            missing: false
        });
    }
}