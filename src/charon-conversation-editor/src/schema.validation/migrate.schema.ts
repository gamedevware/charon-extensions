import { DataDocument, DataType, ExtensionActionContext, FindResult, Schema, SchemaDocument, SchemaPropertyDocument } from "charon-extensions";
import { ImportMode, ValidationOption } from "./game.data.source.with.import";
import { ConversationSchema } from "./conversation.schema";
import { firstValueFrom, from } from "rxjs";
import { DeepReadonly, DeepWritable } from "ts-essentials";
import { RootDocumentControlServices } from "charon-extensions";

type ReadOnlySchemaDocument = DeepReadonly<SchemaDocument>;
type ReadOnlySchemaPropertyDocument = DeepReadonly<SchemaPropertyDocument>;
type GameDataServiceOrNull = RootDocumentControlServices['gameData'] | undefined | null;
interface ProgressReport { update(progress: number, progressMessage?: string): void }

export async function migrateSchema(conversationSchema: Schema | null, dataSource: GameDataServiceOrNull, progress?: ProgressReport, cancellation?: AbortController): Promise<void> {
    if (!dataSource) {
        throw new Error('No game data service is provided for migration procedure.');
    }

    const nodesProperty = conversationSchema?.findSchemaProperty('Nodes');
    const dialogNodeSchema = nodesProperty && nodesProperty.dataType === DataType.DocumentCollection ? nodesProperty.getReferencedSchema() : null;
    const responsesProperty = dialogNodeSchema?.findSchemaProperty('Responses');
    const responseSchema = responsesProperty && responsesProperty.dataType === DataType.DocumentCollection ? responsesProperty.getReferencedSchema() : null;

    cancellation?.signal.throwIfAborted();
    if (progress) {
        progress.update(5, 'Requesting existing schemes...');
        if (cancellation) {
            // give some time for user to cancel this action
            await progressDelay(progress, 5, 25, 2000);
        }
        progress.update(25);
    }
    cancellation?.signal.throwIfAborted();

    // expected documents
    const expectedConversationTreeSchemaDocument = ConversationSchema.Collections.Schema.find(schemaDocument => schemaDocument.Name === 'ConversationTree') as ReadOnlySchemaDocument;
    const expectedDialogNodeSchemaDocument = ConversationSchema.Collections.Schema.find(schemaDocument => schemaDocument.Name === 'DialogNode') as ReadOnlySchemaDocument;
    const expectedDialogResponseSchemaDocument = ConversationSchema.Collections.Schema.find(schemaDocument => schemaDocument.Name === 'DialogResponse') as ReadOnlySchemaDocument;

    const existingSchemaDocuments: FindResult[] = [];
    if (conversationSchema) {
        const schemaQuery = from(dataSource.query(
            [conversationSchema.id, dialogNodeSchema?.id, responseSchema?.id]
                .filter((id): id is string => Boolean(id))
                .map(uniqueSchemaPropertyValue => ({ schemaNameOrId: 'Schema', uniqueSchemaPropertyNameOrId: 'Id', uniqueSchemaPropertyValue }))));
        existingSchemaDocuments.splice(0, 0, ...await firstValueFrom(schemaQuery));
    } else {
        const schemaQuery = from(dataSource.query(
            [expectedConversationTreeSchemaDocument.Name, expectedDialogNodeSchemaDocument.Name, expectedDialogResponseSchemaDocument.Name]
                .filter((id): id is string => Boolean(id))
                .map(uniqueSchemaPropertyValue => ({ schemaNameOrId: 'Schema', uniqueSchemaPropertyNameOrId: 'Name', uniqueSchemaPropertyValue }))));
        existingSchemaDocuments.splice(0, 0, ...await firstValueFrom(schemaQuery));
        for (const findResult of existingSchemaDocuments) {
            if (findResult.document) {
                throw new Error(`A schema named ${findResult.document.Name} already exists. Rename or remove it and try again.`);
            }
        }
    }

    // existing documents
    const conversationTreeSchemaDocument = deepClone(existingSchemaDocuments.find(result => String(result.document?.Id) === conversationSchema?.id)?.document ?? expectedConversationTreeSchemaDocument) as SchemaDocument & DataDocument;
    const dialogNodeSchemaDocument = deepClone(existingSchemaDocuments.find(result => String(result.document?.Id) === dialogNodeSchema?.id)?.document ?? expectedDialogNodeSchemaDocument) as SchemaDocument & DataDocument;
    const dialogResponseSchemaDocument = deepClone(existingSchemaDocuments.find(result => String(result.document?.Id) === responseSchema?.id)?.document ?? expectedDialogResponseSchemaDocument) as SchemaDocument & DataDocument;

    // copy required properties
    updateProperties(conversationTreeSchemaDocument, expectedConversationTreeSchemaDocument);
    updateProperties(dialogNodeSchemaDocument, expectedDialogNodeSchemaDocument);
    updateProperties(dialogResponseSchemaDocument, expectedDialogResponseSchemaDocument);

    updateReferenceType(conversationTreeSchemaDocument, 'RootNode', dialogNodeSchemaDocument);
    updateReferenceType(conversationTreeSchemaDocument, 'Nodes', dialogNodeSchemaDocument);
    updateReferenceType(dialogNodeSchemaDocument, 'NextNode', dialogNodeSchemaDocument);
    updateReferenceType(dialogNodeSchemaDocument, 'Responses', dialogResponseSchemaDocument);
    updateReferenceType(dialogResponseSchemaDocument, 'NextNode', dialogNodeSchemaDocument);

    cancellation?.signal.throwIfAborted();
    if (progress) {
        progress.update(25, 'Creating and updating schemes...');
        if (cancellation) {
            // give some time for user to cancel this action
            await progressDelay(progress, 25, 75, 3000);
        }
        progress.update(75);
    }
    cancellation?.signal.throwIfAborted();

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
        // documents
        importDocuments,
        // import mode
        ImportMode.createAndUpdate,
        // type of documents to import = Schema
        ['Schema'],
        // languages = all
        undefined,
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

    const importResult = await firstValueFrom(importQuery);
    let importErrors = '';
    for (const changeRecord of importResult.changes) {
        for (const changeError of changeRecord.errors) {
            importErrors += `Schema[${changeRecord.id}] at ${changeError.path}: ${changeError.message}\r\n`;
        }
    }
    if (importErrors) {
        throw new Error(importErrors);
    }

    if (progress) {
        progress.update(100, 'Done.');
    }
}

export async function createConversationSchema(context: ExtensionActionContext) {
    const abortSignal = new AbortController();
    const progressRef = context.ui.dialog.showProgress({
        title: 'Creating Conversation Schemas',
        progressMode: 'determinate',
        cancellable: true,
        closedHandler: () => abortSignal.abort()
    });

    try {
        await migrateSchema(null, context.gameData, progressRef, abortSignal);
        context.ui.snackBar.saveSucceed();
        progressRef.close();

    } catch (error) {
        if (abortSignal.signal.aborted) { return; }

        context.ui.snackBar.saveFailed(error);
        progressRef.setFaulted();
        progressRef.close(3000);
        console.error(error);
    }
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

function updateReferenceType(schemaDocument: SchemaDocument, propertyName: string, referencedSchema: ReadOnlySchemaDocument) {
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

function progressDelay(progress: ProgressReport, from: number, to: number, ms: number) {
    const maxCounter = 10;
    let counter = 0;
    let intervalId = 0;
    return new Promise<void>(resolve => intervalId = setInterval(() => {
        if (counter >= maxCounter) {
            resolve();
            clearInterval(intervalId);
            progress.update(to);
        } else {
            counter++;
            progress.update(from + (to - from) * Math.max(0, Math.min(1.0, counter / maxCounter)))
        }
    }, ms / maxCounter));
}