import { useCallback, useContext } from "react";
import { isDialogNodeControl, isDialogResponseControl } from "../models";
import { ValueControl } from "charon-extensions";
import { ConversationContext } from "../state";
import { getDocumentIdAsString } from "./document.control.functions";

type DeleteControlHandler = () => void;

/**
 * Custom hook that provides deletion behavior for ValueControl instances
 * Handles deletion of dialog nodes and responses with proper focus management
 * 
 * @param {ValueControl | null} valueControl - The ValueControl to delete, or null if none selected
 * @returns {DeleteControlHandler} Function that triggers deletion with appropriate cleanup
 * @description
 * This hook provides intelligent deletion that:
 * - Removes dialog nodes and updates the conversation tree
 * - Removes dialog responses from their parent nodes
 * - Manages focus transitions after deletion for better UX
 * - Prevents deletion of conversation tree roots
 */
export function useDeleteControlHandler(valueControl: ValueControl | null | undefined): DeleteControlHandler {

    const { removeDialogNode, removeDialogResponse } = useContext(ConversationContext);

    const deleteHandler = useCallback(() => {
        if (!valueControl) {
            return; // No control selected, nothing to delete
        }

        // Handle dialog node deletion
        if (isDialogNodeControl(valueControl)) {
            const conversationTreeControl = valueControl.parent;
            const dialogNodeId = getDocumentIdAsString(valueControl);
            removeDialogNode(dialogNodeId);

            // Focus the conversation tree after node deletion for continuous workflow
            conversationTreeControl?.focus();

            // Handle dialog response deletion  
        } else if (isDialogResponseControl(valueControl) &&
            valueControl.parent?.parent &&
            isDialogNodeControl(valueControl.parent?.parent)) {

            const dialogNodeControl = valueControl.parent.parent;
            const dialogNodeId = getDocumentIdAsString(dialogNodeControl);
            const dialogResponseId = getDocumentIdAsString(valueControl);
            removeDialogResponse(dialogNodeId, dialogResponseId);

            // Focus the parent dialog node after response deletion
            dialogNodeControl.focus();
        } else {
            // Conversation tree or other non-deletable control selected
            // Deletion is prevented for root conversation tree elements
        }

    }, [removeDialogNode, removeDialogResponse, valueControl]);

    return deleteHandler;
}