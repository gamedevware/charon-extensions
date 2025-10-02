import { NodeProps, Handle, Position } from "@xyflow/react";
import { DocumentControl, ValueControl, DataType } from "charon-extensions";
import { useContext, useRef, useCallback, MouseEventHandler } from "react";
import { DialogNode } from "../models";
import { useControlValue } from "../reactive";
import { ConversationContext, useLocalizedText } from "../state";
import ArrowHandleIcon from "./arrow.handle.icon";
import DialogTreeResponse from "./dialog.tree.response";
import { getDocumentIdAsString } from "./document.control.functions";
import { createDialogHandleId, createDialogResponseHandleId } from "./node.handle.functions";
import { DialogFlowNode } from "./node.types";
import { useControlFocusTarget } from "./use.control.focus.target";

/**
 * React Flow node component for displaying and interacting with dialog nodes in conversation trees
 * Represents a single dialog node with character information, text, and response options
  */
function DialogTreeNode({ data }: NodeProps<DialogFlowNode> & { data: { valueControl: DocumentControl<DialogNode> } }) {

    const { valueControl } = data;
    const { addDialogResponse } = useContext(ConversationContext);
    const [dialogNode] = useControlValue(valueControl);
    const isEmpty = !dialogNode.Responses.length;
    const responseControls = valueControl.controls.Responses.controls;
    const characterControl = getCharacterControl(valueControl);
    const dialogNodeId = getDocumentIdAsString(valueControl);
    const text = useLocalizedText(dialogNode.Text);

    const focusTargetRef = useRef<HTMLDivElement>(null);
    const [isFocused] = useControlFocusTarget(valueControl, focusTargetRef);

    /**
     * Handles adding a new response option to this dialog node
     * Creates a response with placeholder text and prevents event propagation
     */
    const handleAddResponseHandler = useCallback<MouseEventHandler<HTMLButtonElement>>(event => {
        addDialogResponse(dialogNodeId, '<EMPTY>');

        event.stopPropagation();
        event.preventDefault();
    }, [dialogNodeId, addDialogResponse]);

    return (
        <>
            <div className={`ext-ce-conversation-node ${isFocused ? 'focused' : ''}`}
                data-dialog-node-id={dialogNodeId}
                ref={focusTargetRef}
            >
                <div className="ext-ce-actor-section">
                    {Text && <div>
                        {characterControl && (
                            <charon-asset-preview valueControl={characterControl} size="64" className="ext-ce-actor-picture" />
                        )}
                        <span className="ext-ce-actor-text">{text}</span>
                    </div>}
                    <Handle type="target" position={Position.Left} className='ext-ce-dialog-handle svg-arrow-right-handle'>
                        <ArrowHandleIcon size={16} />
                    </Handle>
                    <Handle type="source" id={createDialogHandleId(dialogNodeId)} position={Position.Right} className='ext-ce-dialog-handle svg-arrow-right-handle' hidden={!isEmpty}>
                        <ArrowHandleIcon size={16} />
                    </Handle>
                </div>

                <div className="ext-ce-responses-section">
                    {responseControls.map((responseControl, index) => (
                        <DialogTreeResponse key={getDocumentIdAsString(responseControl)} responseControl={responseControl} index={index}>
                            <Handle id={createDialogResponseHandleId(getDocumentIdAsString(responseControl))} type="source" position={Position.Right} className='ext-ce-response-handle svg-arrow-right-handle'>
                                <ArrowHandleIcon size={16} />
                            </Handle >
                        </DialogTreeResponse>
                    ))}
                    {!dialogNode.NextNode && (
                        <button type='button' className="ext-ce-add-response-button" onClick={handleAddResponseHandler}>
                            <svg width={16}
                                height={16}
                                viewBox="0 0 20 20"
                                stroke="currentColor">
                                <path d="M4 10H16" strokeWidth="2" />
                                <path d="M10 4L10 16" strokeWidth="2" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>
        </>
    );
}

/**
 * Extracts the character control from a dialog node value control for asset preview
 * Searches for Character or Actor properties that contain asset references
 * 
 * @param {DocumentControl} valueControl - The dialog node document control to search
 * @returns {ValueControl | null} Control suitable for charon-asset-preview, or null if not found
 * Only returns controls with data types that can contain asset references (Text, Document, Reference)
 */
function getCharacterControl(valueControl: DocumentControl): ValueControl | null {
    let characterControl: ValueControl | null = null;

    // Search for character control in common property names
    if ('Character' in valueControl.controls) {
        characterControl = valueControl.controls.Character;
    } else if ('Actor' in valueControl.controls) {
        characterControl = valueControl.controls.Actor;
    }

    // Validate that the control has a data type suitable for asset references
    switch (characterControl?.schemaProperty.dataType) {
        case DataType.Text:    // Could contain asset path as string
        case DataType.Document: // Could contain asset reference in document
        case DataType.Reference: // Could reference document with assets
            return characterControl;
        default:
            return null;
    }
}

export default DialogTreeNode;
