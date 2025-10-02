import { DataType, Requirement, RootDocumentControl } from "charon-extensions";
import { ConversationTree } from "../models";
import { DevMetadata } from "./dev.metadata";
import { DevRootDocumentControl } from "./dev.root.document.control ";
import { DeepPartial } from "ts-essentials";

export function createDevValueControl(value: DeepPartial<ConversationTree>): RootDocumentControl<ConversationTree> {
    const metadata = new DevMetadata();

    metadata.defineSchema('DialogNode', schema => {
        schema.defineIdSchemaProperty(DataType.Text);
        schema.defineSchemaProperty('Text', DataType.Text, property => property.requirement = Requirement.NotNull);
        schema.defineSchemaProperty('NextNode', DataType.Reference, property => property.referenceType = metadata.referenceSchema('DialogNode'));
        schema.defineSchemaProperty('Responses', DataType.DocumentCollection, property => property.referenceType = metadata.referenceSchema('DialogResponse'));
        schema.defineSchemaProperty('Specification', DataType.Text, property => property.requirement = Requirement.NotNull);
    });

    metadata.defineSchema('DialogResponse', schema => {
        schema.defineIdSchemaProperty(DataType.Text);
        schema.defineSchemaProperty('Text', DataType.Text, property => property.requirement = Requirement.NotNull);
        schema.defineSchemaProperty('NextNode', DataType.Reference, property => property.referenceType = metadata.referenceSchema('DialogNode'));
        schema.defineSchemaProperty('Specification', DataType.Text, property => property.requirement = Requirement.NotNull);
    });

    metadata.defineSchema('ConversationTree', schema => {
        schema.defineIdSchemaProperty(DataType.Text);
        schema.defineSchemaProperty('RootNode', DataType.Reference, property => property.referenceType = metadata.referenceSchema('DialogNode'));
        schema.defineSchemaProperty('Nodes', DataType.DocumentCollection, property => property.referenceType = metadata.referenceSchema('DialogNode'));
        schema.defineSchemaProperty('Specification', DataType.Text, property => property.requirement = Requirement.NotNull);
    });

    return new DevRootDocumentControl(value as ConversationTree, metadata.getSchema('ConversationTree'));
}
