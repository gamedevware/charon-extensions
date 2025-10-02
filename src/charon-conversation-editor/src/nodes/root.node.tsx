import { useRef } from 'react';
import { Handle, NodeProps, Position, } from '@xyflow/react';
import { DocumentControl } from 'charon-extensions';
import ArrowHandleIcon from './arrow.handle.icon';
import { useControlValue } from '../reactive';
import type { ConversationTree } from '../models';
import { createRootNodeHandleId } from './node.handle.functions';
import { DialogFlowNode } from './node.types';
import { useControlFocusTarget } from './use.control.focus.target';
import { getDocumentIdAsString } from './document.control.functions';

/**
 * React Flow node component representing the root/start node of a conversation tree
 * Serves as the entry point for conversation flows with connection handle to start nodes
  */
function RootNode({ data }: NodeProps<DialogFlowNode> & { data: { valueControl: DocumentControl<ConversationTree> } }) {

    const { valueControl } = data;
    const [conversationTree] = useControlValue(valueControl);
    const isEmpty = !conversationTree.Nodes?.length;
    const rootNodeId = getDocumentIdAsString(valueControl);

    const focusTargetRef = useRef<HTMLDivElement>(null);
    const [isFocused] = useControlFocusTarget(valueControl, focusTargetRef);

    return (
        <>
            <div className={`ext-ce-conversation-node ext-ce-root-node ${isFocused ? 'focused' : ''} ${isEmpty ? 'empty' : ''}`}
                data-root-node-id={rootNodeId}
                ref={focusTargetRef}
            >
                <div className="ext-ce-root-section">
                    <span>Start</span>
                    <Handle type="source" id={createRootNodeHandleId(rootNodeId)} position={Position.Right} className='ext-ce-dialog-handle svg-arrow-right-handle'>
                        <ArrowHandleIcon size={16} />
                    </Handle>
                </div>
            </div>
        </>
    );
}

export default RootNode;