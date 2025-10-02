import { MouseEventHandler, useCallback, useContext, useEffect, useState } from "react";
import { ConversationContext } from "../state";
import { NodeChange, OnNodesChange, useReactFlow } from "@xyflow/react";
import { DialogFlowNode, DialogFlowEdge } from "../nodes/node.types";
import dagre from 'dagre';
import { UndoRedoContext } from '../state';

/**
 * AutoLayoutButton component that provides automatic node arrangement using Dagre layout algorithm
 * Organizes conversation flow nodes in a left-to-right hierarchical layout
 */
function AutoLayoutButton({ onNodesChange, enabled }: { onNodesChange: OnNodesChange<DialogFlowNode>, enabled: boolean }) {
    const [disabled, setDisabled] = useState(true);
    const { conversationTreeControl } = useContext(ConversationContext);
    const { getNodes, getEdges, fitView } = useReactFlow<DialogFlowNode, DialogFlowEdge>();
    const { saveState } = useContext(UndoRedoContext);

    /**
     * Handles auto layout functionality using Dagre graph layout library
     * Arranges nodes in a hierarchical left-to-right layout with proper spacing
     */
    const autoLayoutHandler = useCallback<MouseEventHandler>(() => {
        // Step 1: Initialize Dagre graph with layout configuration
        const dagreGraph = new dagre.graphlib.Graph();
        dagreGraph.setDefaultEdgeLabel(() => ({}));

        // Configure graph layout: Left-to-Right direction with spacing between ranks and nodes
        dagreGraph.setGraph({
            rankdir: 'LR',    // Layout direction: Left to Right
            ranksep: 50,      // Vertical spacing between ranks (levels)
            nodesep: 50       // Horizontal spacing between nodes in same rank
        });

        const nodes = getNodes();

        // Step 2: Add all nodes to Dagre graph with their dimensions
        for (const node of nodes) {
            const width = getWidth(node);
            const height = getHeight(node);

            // Register node in Dagre with calculated dimensions
            dagreGraph.setNode(node.id, { width, height });
        }

        // Step 3: Add all edges to Dagre graph to establish connections
        for (const edge of getEdges()) {
            dagreGraph.setEdge(edge.source, edge.target);
        }

        // Step 4: Execute Dagre layout algorithm to calculate node positions
        dagre.layout(dagreGraph);

        // Step 5: Apply calculated positions back to React Flow nodes
        const changes: NodeChange<DialogFlowNode>[] = [];
        for (const node of nodes) {
            // Get calculated position from Dagre (center-based coordinates)
            const { x, y } = dagreGraph.node(node.id);
            const width = getWidth(node);
            const height = getHeight(node);

            // Convert center-based coordinates to top-left coordinates for React Flow
            // and create position change update
            changes.push({
                id: node.id,
                type: 'position',
                position: {
                    x: x - width / 2,   // Convert center X to left X
                    y: y - height / 2,  // Convert center Y to top Y
                },
                dragging: false
            });
        }

        // Step 6: Apply all position changes to React Flow
        onNodesChange(changes);

        // Step 7: Fit the view to show all laid out nodes
        fitView();

        // Step 8: Save state for undo/redo functionality
        saveState();

        /**
         * Calculates node width with fallback values
         * Priority: explicit width -> measured width -> default width
         */
        function getWidth(node: DialogFlowNode) {
            return node.width ?? node.measured?.width ?? 260;
        }

        /**
         * Calculates node height with fallback values  
         * Priority: explicit height -> measured height -> default height
         */
        function getHeight(node: DialogFlowNode) {
            return node.height ?? node.measured?.height ?? 300;
        }
    }, [fitView, getEdges, getNodes, onNodesChange, saveState]);

    /**
     * Effect to enable/disable button based on node presence
     * Only enable auto-layout when there are nodes to arrange
     */
    useEffect(() => {
        const nodesControl = conversationTreeControl.controls.Nodes;

        // Subscribe to node changes to update button disabled state
        const subscription = nodesControl.valueChanges.subscribe({
            next: nodes => setDisabled(!nodes.length)
        });

        // Set initial disabled state
        setDisabled(!nodesControl.value.length);

        // Cleanup subscription on unmount
        return subscription.unsubscribe.bind(subscription);
    }, [conversationTreeControl])

    return <>
        <button
            type="button"
            disabled={disabled || !enabled}
            className="react-flow__controls-button ext-ce-redo-button"
            onClick={autoLayoutHandler}
            title="Auto layout nodes - Arranges nodes in hierarchical left-to-right layout"
        >
            {/* Layout/network graph icon */}
            <svg viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M11 6C12.6569 6 14 4.65685 14 3C14 1.34315 12.6569 0 11 0C9.34315 0 8 1.34315 8 3C8 3.22371 8.02449 3.44169 8.07092 3.65143L4.86861 5.65287C4.35599 5.24423 3.70652 5 3 5C1.34315 5 0 6.34315 0 8C0 9.65685 1.34315 11 3 11C3.70652 11 4.35599 10.7558 4.86861 10.3471L8.07092 12.3486C8.02449 12.5583 8 12.7763 8 13C8 14.6569 9.34315 16 11 16C12.6569 16 14 14.6569 14 13C14 11.3431 12.6569 10 11 10C10.2935 10 9.644 10.2442 9.13139 10.6529L5.92908 8.65143C5.97551 8.44169 6 8.22371 6 8C6 7.77629 5.97551 7.55831 5.92908 7.34857L9.13139 5.34713C9.644 5.75577 10.2935 6 11 6Z" />
            </svg>
        </button>
    </>
}

export default AutoLayoutButton;