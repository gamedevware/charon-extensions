import { DocumentControl } from "charon-extensions";
import { FocusEventHandler, useCallback, useContext, useState } from "react";
import { ConversationContext } from "../state/conversation.context";
import { parseHandleOrFlowNodeId } from "./node.handle.functions";
import { OnSelectionChangeFunc, useOnSelectionChange } from "@xyflow/react";
import { DialogFlowEdge, DialogFlowNode } from "./node.types";

/**
 * Custom hook for monitoring and managing focus state for dialog nodes and responses
 * Tracks which document control is currently focused/selected based on user interactions
 * @returns {[DocumentControl | null, FocusEventHandler]} Tuple containing the currently selected document control and focus event handler
 */
export function useSelectedContronMonitor(): [DocumentControl | null, FocusEventHandler] {
    // State to track the currently focused document control
    const [selectedDocumentControl, selectDocumentControl] = useState<DocumentControl | null>(null);
    const { findDialogNode, findDialogResponse, conversationTreeControl } = useContext(ConversationContext);

    /**
     * Handles focus events to determine which dialog node or response was focused
     * Updates the selected document control based on the focused element
     * @param {FocusEvent} event - The focus event from user interaction
     */
    const focusHandler = useCallback<FocusEventHandler>(event => {
        // Extract entity type and IDs from the focused element
        const [type, dialogNodeId, dialogResponseId] = getDialogNodeOrResponseId(event.target);

        switch (type) {
            case "dialog":
                // Focus on a dialog node - find and select its document control
                selectDocumentControl(findDialogNode(dialogNodeId) ?? null);
                break;
            case "response":
                // Focus on a dialog response - find and select its document control
                selectDocumentControl(findDialogResponse(dialogNodeId, dialogResponseId) ?? null);
                break;
            case "flow-node": {
                // Focus on a React Flow node - parse ID and determine type
                const { id: dialogOrRootNodeId, type } = parseHandleOrFlowNodeId(dialogNodeId);
                if (type === 'dialog-node') {
                    // Regular dialog node - map ID and find document control
                    selectDocumentControl(findDialogNode(dialogOrRootNodeId) ?? null);
                } else if (type === 'root-node') {
                    // Root node - select the conversation tree control
                    selectDocumentControl(conversationTreeControl);
                }
                break;
            }
            case "none":
                // No relevant element focused - maintain current state
                break;
        }
    }, [conversationTreeControl, findDialogNode, findDialogResponse]);

    /**
     * Handles selection changes in React Flow to clear focus when nodes are deselected
     * @param {Object} params - Selection change parameters
     * @param {DialogFlowNode[]} params.nodes - Currently selected nodes
     */
    const onChange = useCallback<OnSelectionChangeFunc<DialogFlowNode, DialogFlowEdge>>(({ nodes }) => {
        // Clear selection when no nodes are selected in React Flow
        if (!nodes?.length) {
            selectDocumentControl(null);
        }
    }, []);

    // Subscribe to React Flow selection changes
    useOnSelectionChange({ onChange });

    return [selectedDocumentControl, focusHandler];
}

/**
 * Recursively traverses DOM elements to extract dialog node and response IDs
 * Identifies the type of element focused and its associated IDs
 * @param {Node | null | undefined} el - The DOM element to analyze
 * @returns {['dialog', string, null] | ['response', string, string] | ['flow-node', string, null] | ['none', null, null]} 
 * Tuple containing element type, dialog node ID, and response ID (if applicable)
 */
function getDialogNodeOrResponseId(el: Node | null | undefined): ['dialog', string, null] | ['response', string, string] | ['flow-node', string, null] | ['none', null, null] {

    if (el instanceof HTMLElement) {
        // Extract data attributes from the element
        const dialogResponseId = el.getAttribute('data-response-id');
        const dialogNodeId = el.getAttribute('data-dialog-node-id');
        const flowNodeId = el.getAttribute('data-id');

        if (dialogResponseId) {
            // Element is a dialog response - find parent dialog node
            const [type, parentDialogNodeId] = getDialogNodeOrResponseId(el.parentNode);
            if (type === 'dialog') {
                return ['response', parentDialogNodeId, dialogResponseId];
            }
        } else if (dialogNodeId) {
            // Element is a dialog node
            return ['dialog', dialogNodeId, null];
        } else if (flowNodeId) {
            // Element is a React Flow node
            return ['flow-node', flowNodeId, null];
        } else {
            // No relevant attributes found - recursively check parent element
            return getDialogNodeOrResponseId(el.parentNode);
        }
    }

    // Reached the root without finding relevant elements
    return ['none', null, null];
}