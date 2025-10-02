import { DocumentControl, isDocumentControl, type DataDocument, type ValueControl } from "charon-extensions";
import type { DialogNode } from "./dialog.node";
import type { DialogNodeReference } from "./dialog.node.reference";

/**
 * Represents a conversation tree document containing dialog nodes and flow structure
 * @extends DataDocument
 */
export interface ConversationTree extends DataDocument {
    Id: string | number | bigint;
    RootNode: DialogNodeReference;
    Nodes: DialogNode[];
    Specification: string;
}

/**
 * Checks if a value control represents a ConversationTree document
 * @param {ValueControl} valueControl - The control to validate
 * @returns {boolean} True if the control has ConversationTree schema properties
 */
export function isConversationTreeControl(valueControl: ValueControl): valueControl is DocumentControl<ConversationTree> {
    return isDocumentControl(valueControl) && valueControl.schema.hasSchemaProperty('Nodes') &&
        valueControl.schema.hasSchemaProperty('RootNode');
}