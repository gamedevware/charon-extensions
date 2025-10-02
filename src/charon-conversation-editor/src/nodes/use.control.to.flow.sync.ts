import { useCallback, useContext, useEffect, useMemo } from "react";
import { Connection, EdgeChange, NodeChange, OnConnect, OnConnectEnd, OnEdgesChange, OnNodesChange, useEdgesState, useNodesState, useReactFlow } from "@xyflow/react";
import { useDebounce, usePerKeyDebounce } from "../reactive";
import type { DialogFlowNode, DialogFlowEdge } from "./node.types";
import { ConversationContext } from "../state/conversation.context";
import { parseHandleOrFlowNodeId } from "./node.handle.functions";

/**
 * Custom hook for syncing conversation tree state in React Flow
 * Handles node and edge changes, connections, and synchronization with ValueControl
 * @returns {[DialogFlowNode[], OnNodesChange<DialogFlowNode>, DialogFlowEdge[], OnEdgesChange<DialogFlowEdge>, OnConnect, OnConnectEnd]} 
 * Tuple containing nodes, node change handler, edges, edge change handler, connect handler, and connect end handler
 */
export function useControlToFlowSync()
    : [DialogFlowNode[], OnNodesChange<DialogFlowNode>, DialogFlowEdge[], OnEdgesChange<DialogFlowEdge>, OnConnect, OnConnectEnd] {

    // Context dependencies for conversation management
    const {
        getInitalNodes,
        getInitalEdges,
        setDialogNodePosition,
        setRootNodePosition,
        setDialogNextNode,
        setDialogResponseNextNode,
        setRootNode,
        removeDialogNode,
        createEdge,
        createDialogContinuationNode,
        getConversationNodeChanges,
        getConversationEdgeChanges,
        conversationTreeControl,
    } = useContext(ConversationContext);

    // React Flow hooks for node/edge management and coordinate conversion
    const { getEdge, getEdges, getNodes, screenToFlowPosition } = useReactFlow<DialogFlowNode, DialogFlowEdge>();

    // Initialize nodes and edges with memoization for performance
    const initialNodes = useMemo(() => getInitalNodes(), [getInitalNodes]);
    const initiaEdges = useMemo(() => getInitalEdges(), [getInitalEdges]);

    // React Flow state management for nodes and edges
    const [nodes, , onNodesChange] = useNodesState<DialogFlowNode>(initialNodes);
    const [edges, , onEdgesChange] = useEdgesState<DialogFlowEdge>(initiaEdges);

    // Debounced position updates to improve performance during dragging
    const setDialogNodePositionDebounced = usePerKeyDebounce(setDialogNodePosition, 200, args => args[0]);
    const setRootNodePositionDebounced = useDebounce(setRootNodePosition, 200);

    /**
     * Handles node changes from React Flow and synchronizes with ValueControl
     * Processes position updates, additions, removals, and dimension changes
     * @param {NodeChange<DialogFlowNode>[]} changes - Array of node changes from React Flow
     */
    const handleOnNodesChange = useCallback((changes: NodeChange<DialogFlowNode>[]) => {
        if (!changes.length) {
            return; // no changes to process
        }

        // Process each node change individually
        for (const change of changes) {
            switch (change.type) {
                case "position": {
                    // Handle node position changes for both dialog and root nodes
                    const { id: dialogNodeId, type } = parseHandleOrFlowNodeId(change.id);
                    if (type === 'dialog-node') {
                        if (!change.dragging) {
                            // Apply final position changes immediately when dragging ends
                            setDialogNodePosition(dialogNodeId, change.position);
                        } else {
                            // Debounce position updates during dragging for better performance
                            setDialogNodePositionDebounced(dialogNodeId, change.position);
                        }
                    } else if (type === 'root-node') {
                        if (!change.dragging) {
                            setRootNodePosition(change.position);
                        } else {
                            setRootNodePositionDebounced(change.position);
                        }
                    }
                    break;
                }
                case "add":
                    // Node additions are handled through other mechanisms (onConnectEnd)
                    break;
                case "remove": {
                    // Handle node deletion and propagate to ValueControl
                    const { id: dialogNodeId, type } = parseHandleOrFlowNodeId(change.id);
                    if (type === 'dialog-node') {
                        removeDialogNode(dialogNodeId);
                    }
                    break;
                }
                case "dimensions":
                    // Dimension changes (resize) are currently not persisted
                    break;
            }
        }

        // Propagate changes to React Flow state
        onNodesChange(changes);
    }, [onNodesChange, setDialogNodePosition, setDialogNodePositionDebounced, setRootNodePosition, setRootNodePositionDebounced, removeDialogNode]);

    /**
     * Handles edge changes from React Flow and synchronizes with ValueControl
     * Processes edge additions, removals, and connection updates
     * @param {EdgeChange<DialogFlowEdge>[]} changes - Array of edge changes from React Flow
     */
    const handleOnEdgesChange = useCallback((changes: EdgeChange<DialogFlowEdge>[]) => {
        if (!changes.length) {
            return; // no changes to process
        }

        // Process each edge change individually
        for (const change of changes) {
            switch (change.type) {
                case "add": {
                    const edge = change.item;
                    // Handle new edge connections between nodes
                    const { id: sourceDialogNodeId } = parseHandleOrFlowNodeId(edge.source);
                    const { id: targetDialogNodeId } = parseHandleOrFlowNodeId(edge.target);
                    const { id: sourceDialogNodeOrResponseId, type: handleType } = parseHandleOrFlowNodeId(edge.sourceHandle ?? '');

                    // Update appropriate connection based on handle type
                    if (handleType === 'dialog-handle') {
                        setDialogNextNode(sourceDialogNodeId, targetDialogNodeId);
                    } else if (handleType === 'response-handle') {
                        setDialogResponseNextNode(sourceDialogNodeId, sourceDialogNodeOrResponseId, targetDialogNodeId);
                    } else if (handleType === 'root-handle') {
                        setRootNode(targetDialogNodeId);
                    }
                    break;
                }
                case "remove": {
                    // Handle edge removal and disconnect nodes
                    const edge = getEdge(change.id);
                    if (!edge) break;

                    const { id: sourceDialogNodeId } = parseHandleOrFlowNodeId(edge.source);
                    const { id: sourceDialogNodeOrResponseId, type: handleType } = parseHandleOrFlowNodeId(edge.sourceHandle ?? '');
                    const { id: targetDialogNodeId } = parseHandleOrFlowNodeId(edge.target);

                    // Clear appropriate connection based on handle type
                    if (handleType === 'dialog-handle') {
                        setDialogNextNode(sourceDialogNodeId, null, targetDialogNodeId);
                    } else if (handleType === 'response-handle') {
                        setDialogResponseNextNode(sourceDialogNodeId, sourceDialogNodeOrResponseId, null, targetDialogNodeId);
                    } else if (handleType === 'root-handle') {
                        setRootNode(null, targetDialogNodeId);
                    }
                    break;
                }
                case "replace":
                    // Edge replacement is handled through remove/add sequence
                    break;
            }
        }

        // Propagate changes to React Flow state
        onEdgesChange(changes);
    }, [onEdgesChange, setDialogNextNode, setDialogResponseNextNode, setRootNode, getEdge]);

    /**
     * Handles connection creation between nodes
     * Manages edge creation and replacement logic
     * @param {Connection} params - Connection parameters from React Flow
     */
    const onConnect = useCallback<OnConnect>((params: Connection) => {
        // Validate source handle exists and is of correct type
        if (!params.sourceHandle) {
            return;
        }
        const { type } = parseHandleOrFlowNodeId(params.sourceHandle);
        if (type !== 'dialog-handle' && type !== 'response-handle' && type !== 'root-handle') {
            return;
        }

        // Create new edge and check for existing connections
        const newEdge = createEdge(params.source, params.target, params.sourceHandle, undefined);
        const existingEdge = getEdges().find(edge => edge.sourceHandle === params.sourceHandle);

        if (existingEdge?.target === params.target) {
            // Disconnect if trying to connect to same target
            handleOnEdgesChange([{ type: 'remove', id: newEdge.id }]);
        } else if (existingEdge) {
            // Replace existing connection with new target
            handleOnEdgesChange([{ type: 'remove', id: existingEdge.id }]);
            handleOnEdgesChange([{ type: 'add', item: newEdge }]);
        } else {
            // Add new connection
            handleOnEdgesChange([{ type: 'add', item: newEdge }]);
        }

    }, [createEdge, getEdges, handleOnEdgesChange]);

    /**
     * Handles connection end events, particularly for creating new nodes
     * Creates continuation nodes when connecting to empty space
     * @param {MouseEvent | TouchEvent} event - The connection end event
     * @param {ConnectionState} connectionState - State of the connection attempt
     */
    const onConnectEnd = useCallback<OnConnectEnd>((event, connectionState) => {
        // Only handle invalid connections to empty space
        if (connectionState.isValid ||
            !connectionState.fromNode ||
            !connectionState.fromHandle?.id ||
            connectionState.fromHandle.type === 'target'
        ) {
            return;
        }

        // Extract connection information and calculate position
        const source = connectionState.fromNode.id;
        const sourceHandle = connectionState.fromHandle.id;
        const { clientX, clientY } = 'changedTouches' in event ? event.changedTouches[0] : event;
        const position = screenToFlowPosition({ x: clientX, y: clientY });

        // Create new continuation node at drop position
        createDialogContinuationNode(source, sourceHandle, position);

        // Refresh node and edge states to reflect new structure
        const nodeChanges = getConversationNodeChanges(getNodes());
        handleOnNodesChange(nodeChanges);

        const edgeChanges = getConversationEdgeChanges(getEdges());
        handleOnEdgesChange(edgeChanges);

    }, [getNodes, getEdges, screenToFlowPosition, createDialogContinuationNode, getConversationNodeChanges, handleOnNodesChange, getConversationEdgeChanges, handleOnEdgesChange]);

    /**
     * Synchronizes React Flow state with ValueControl changes
     * Debounced to prevent excessive updates during rapid changes
     */
    const onConversationTreeChanges = useDebounce(useCallback(() => {
        // Calculate and apply node changes from ValueControl to React Flow
        const nodeChanges = getConversationNodeChanges(getNodes());
        handleOnNodesChange(nodeChanges);

        // Calculate and apply edge changes from ValueControl to React Flow
        const edgeChanges = getConversationEdgeChanges(getEdges());
        handleOnEdgesChange(edgeChanges);

    }, [getConversationEdgeChanges, getConversationNodeChanges, getEdges, getNodes, handleOnEdgesChange, handleOnNodesChange]), 5);

    /**
     * Subscribe to ValueControl changes and synchronize React Flow state
     * Ensures React Flow reflects changes made through ValueControl API
     */
    useEffect(() => {
        const subscription = conversationTreeControl.valueChanges
            .subscribe({ next: onConversationTreeChanges });
        return subscription.unsubscribe.bind(subscription);

    }, [conversationTreeControl, onConversationTreeChanges]);

    return [nodes, handleOnNodesChange, edges, handleOnEdgesChange, onConnect, onConnectEnd];
}
