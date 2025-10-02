import { ValueControl } from "charon-extensions";
import { useCallback, useContext, useEffect, useRef } from "react";
import { DialogNode, isDialogNodeControl } from "../models";
import { ConversationContext } from "../state";
import { useReactFlow, XYPosition } from "@xyflow/react";
import { DialogFlowNode, DialogFlowEdge } from "./node.types";

type CopyToClipboard = () => void;
type PasteFromClipboard = (keyboardEvent: KeyboardEvent) => void;
type Duplicate = () => void;

/**
 * Custom hook for monitoring and handling copy/paste operations for dialog node controls
 * Provides clipboard functionality with fallback for dialog node duplication
 * @param {ValueControl | null} valueControl - The value control to monitor for copy operations
 * @returns {[CopyToClipboard, PasteFromClipboard]} Tuple containing copy and paste functions
 */
export function useControlCopyPasteMonitor(valueControl: ValueControl | null): [CopyToClipboard, PasteFromClipboard, Duplicate] {
    // Local clipboard fallback if global clipboard is not available
    const copiedText = useRef('');
    const { createDialogNode } = useContext(ConversationContext);
    const { screenToFlowPosition } = useReactFlow<DialogFlowNode, DialogFlowEdge>();

    // Track mouse position for paste placement
    const mousePositionRef = useRef<XYPosition>({ x: 0, y: 0 });

    // Track mouse movement in real-time to use it in Paste
    useEffect(() => {
        const handleMouseMove = (mouseEvent: MouseEvent) => {
            mousePositionRef.current = { x: mouseEvent.clientX, y: mouseEvent.clientY };
        };
        document.addEventListener('mousemove', handleMouseMove);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
        }
    }, []);

    /**
     * Copies the current dialog node to clipboard as JSON
     * Only works with valid dialog node controls
     */
    const copyToClipboard = useCallback(() => {
        if (!valueControl || !isDialogNodeControl(valueControl)) {
            return;
        }

        const textToCopy = JSON.stringify(valueControl.value);
        copiedText.current = textToCopy;
        navigator.clipboard.writeText(textToCopy).catch(error => {
            console.error('Failed to copy text to clipboard: ', error);
        });
    }, [valueControl]);

    /**
     * Pastes a dialog node from clipboard and creates a new node at mouse position
     * Clears IDs and NextNode references to create a clean duplicate
     */
    const pasteFromClipboard = useCallback(() => {
        // Convert screen coordinates to flow coordinates for proper node placement
        const position: XYPosition = screenToFlowPosition(mousePositionRef.current);

        /**
         * Reads clipboard content, parses JSON, and creates a new dialog node
         * Uses local fallback if system clipboard is unavailable
         */
        async function readAndParseDialogNodeFromClipboard() {
            let clipboardText = copiedText.current;

            // Attempt to read from system clipboard first
            try {
                clipboardText = await navigator.clipboard.readText();
            } catch (readError) {
                console.error('Failed to read from clipboard: ', readError);
            }

            let dialogNodeDocument: Partial<DialogNode> | undefined;

            // Parse JSON from clipboard text
            try {
                dialogNodeDocument = JSON.parse(clipboardText) as DialogNode;
            } catch (parseError) {
                console.error('Failed to deserialize text from clipboard as JSON object: ', parseError);
            }

            if (!dialogNodeDocument) {
                return;
            }

            // Reset IDs and connections to create a clean duplicate
            dialogNodeDocument.Id = ''; // will be re-generated in createDialogNode
            dialogNodeDocument.NextNode = null;

            // Reset all response IDs and connections
            if (dialogNodeDocument.Responses) {
                for (const response of dialogNodeDocument.Responses) {
                    response.Id = '';
                    response.NextNode = null;
                }
            }

            // Create new dialog node at mouse position
            createDialogNode(dialogNodeDocument, position);
        }

        readAndParseDialogNodeFromClipboard();
    }, [createDialogNode, screenToFlowPosition]);

    const duplicate = useCallback(() => {
        copyToClipboard();
        pasteFromClipboard();
    }, [copyToClipboard, pasteFromClipboard])


    return [copyToClipboard, pasteFromClipboard, duplicate]
}