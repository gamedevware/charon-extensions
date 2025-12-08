import { DataType, Schema, SchemaDocument, SchemaPropertyDocument } from "charon-extensions";
import { DataSourceWithImport, ImportMode, ValidationOption } from "./game.data.source.with.import";
import { ConversationSchema } from "./conversation.schema";
import { firstValueFrom, from } from "rxjs";
import { DeepReadonly, DeepWritable } from "ts-essentials";

type ReadOnlySchemaDocument = DeepReadonly<SchemaDocument>;
type ReadOnlySchemaPropertyDocument = DeepReadonly<SchemaPropertyDocument>;

export async function migrateSchema(schema: Schema, dataSource: DataSourceWithImport): Promise<void> {
    const nodesProperty = schema.findSchemaProperty('Nodes');
    const dialogNodeSchema = nodesProperty && nodesProperty.dataType === DataType.DocumentCollection ? nodesProperty.getReferencedSchema() : null;
    const responsesProperty = dialogNodeSchema?.findSchemaProperty('Responses');
    const responseSchema = responsesProperty && responsesProperty.dataType === DataType.DocumentCollection ? responsesProperty.getReferencedSchema() : null;

    const schemaQuery = from(dataSource.query([schema.id, dialogNodeSchema?.id, responseSchema?.id]
        .filter((id): id is string => Boolean(id))
        .map(uniqueSchemaPropertyValue => ({ schemaNameOrId: 'Schema', uniqueSchemaPropertyNameOrId: 'Id', uniqueSchemaPropertyValue }))));
    const existingSchemaDocuments = await firstValueFrom(schemaQuery);

    // expected documents
    const expectedConversationTreeSchemaDocument = ConversationSchema.Collections.Schema.find(schemaDocument => schemaDocument.Name === 'ConversationTree') as ReadOnlySchemaDocument;
    const expectedDialogNodeSchemaDocument = ConversationSchema.Collections.Schema.find(schemaDocument => schemaDocument.Name === 'DialogNode') as ReadOnlySchemaDocument;
    const expectedDialogResponseSchemaDocument = ConversationSchema.Collections.Schema.find(schemaDocument => schemaDocument.Name === 'DialogResponse') as ReadOnlySchemaDocument;

    // existing documents
    const conversationTreeSchemaDocument = deepClone(existingSchemaDocuments.find(result => String(result.document?.Id) === schema.id)?.document ?? expectedConversationTreeSchemaDocument) as SchemaDocument;
    const dialogNodeSchemaDocument = deepClone(existingSchemaDocuments.find(result => String(result.document?.Id) === dialogNodeSchema?.id)?.document ?? expectedDialogNodeSchemaDocument) as SchemaDocument;
    const dialogResponseSchemaDocument = deepClone(existingSchemaDocuments.find(result => String(result.document?.Id) === responseSchema?.id)?.document ?? expectedDialogResponseSchemaDocument) as SchemaDocument;

    // copy required properties
    updateProperties(conversationTreeSchemaDocument, expectedConversationTreeSchemaDocument);
    updateProperties(dialogNodeSchemaDocument, expectedDialogNodeSchemaDocument);
    updateProperties(dialogResponseSchemaDocument, expectedDialogResponseSchemaDocument);

    updateRefrenceType(conversationTreeSchemaDocument, 'RootNode', dialogNodeSchemaDocument);
    updateRefrenceType(conversationTreeSchemaDocument, 'Nodes', dialogNodeSchemaDocument);
    updateRefrenceType(dialogNodeSchemaDocument, 'NextNode', dialogNodeSchemaDocument);
    updateRefrenceType(dialogNodeSchemaDocument, 'Responses', dialogResponseSchemaDocument);
    updateRefrenceType(dialogResponseSchemaDocument, 'NextNode', dialogNodeSchemaDocument);

    // import modified schemas back
    const importDocuments = {
        Collections: {
            Schema: [
                conversationTreeSchemaDocument,
                dialogNodeSchemaDocument,
                dialogResponseSchemaDocument
            ]
        }
    };
    const importQuery = from(dataSource.import(
        // type of documents to import = Schema
        ['Schema'],
        // languages = all
        [],
        // documents
        importDocuments,
        // import mode
        ImportMode.createAndUpdate,
        // validation options = default for creation/updating
        [
            ValidationOption.repair,
            ValidationOption.repairRequiredWithDefaults,
            ValidationOption.checkRequirements,
            ValidationOption.checkFormat,
            ValidationOption.checkReferences,
            ValidationOption.checkUniqueness,
            ValidationOption.checkSpecification,
            ValidationOption.checkConstraints,
        ],
        // dry run = no
        undefined)
    );
    await firstValueFrom(importQuery);
}

function deepClone<T extends object>(value: T): DeepWritable<T> {
    return JSON.parse(JSON.stringify(value));
}

function updateProperties(schemaDocument: SchemaDocument, expectedSchemaDocument: ReadOnlySchemaDocument) {
    const properties = schemaDocument.Properties ?? [];
    const expectedProperties = expectedSchemaDocument.Properties ?? [];
    for (const expectedProperty of expectedProperties) {
        const existingProperty = properties.find(propertyDocument => String(propertyDocument.Name) === String(expectedProperty.Name));

        if (existingProperty && existingProperty.Name === "Id") {
            continue; // keep Id properties of existing documents
        } else if (existingProperty) {
            updateProperty(existingProperty, expectedProperty);
        } else {
            properties.push(deepClone(expectedProperty));
        }
    }
    schemaDocument.Properties = properties;
}

function updateProperty(schemaPropertyDocument: SchemaPropertyDocument, expectedSchemaPropertyDocument: ReadOnlySchemaPropertyDocument) {

    for (const propertyName in expectedSchemaPropertyDocument) {
        if (!Object.prototype.hasOwnProperty.call(expectedSchemaPropertyDocument, propertyName)) continue;

        const propertyValue = (<any>expectedSchemaPropertyDocument)[propertyName];
        (<any>schemaPropertyDocument)[propertyName] = propertyValue;
    }
}

function updateRefrenceType(schemaDocument: SchemaDocument, propertyName: string, referencedSchema: ReadOnlySchemaDocument) {
    const properties = schemaDocument.Properties ?? [];
    const property = properties.find(propertyDocument => String(propertyDocument.Name) === propertyName);
    if (!property) {
        return; // proeprty not found
    }
    if (![DataType.Document, DataType.DocumentCollection, DataType.Reference, DataType.ReferenceCollection].includes(property.DataType)) {
        return;  // wrong data type
    }
    const schemaReference = { Id: String(referencedSchema.Id), DisplayName: String(referencedSchema.DisplayName) };
    if (property.ReferenceType?.Id === schemaReference.Id) {
        return;
    }
    property.ReferenceType = schemaReference;
}