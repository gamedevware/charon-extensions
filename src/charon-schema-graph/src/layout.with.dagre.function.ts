import dagre from 'dagre';
import { Position } from '@xyflow/react';
import { SchemaGraphEdge, SchemaGraphNode } from './schema.to.graph.function';

// Fixed estimate — this graph is read-only and laid out once before the first
// render, so there are no `measured` dimensions from a prior render to read
// (unlike conversation-editor's AutoLayoutButton, which re-lays-out already-mounted nodes).
const NODE_WIDTH = 180;
const NODE_HEIGHT = 40;

/** Computes a left-to-right hierarchical layout for the given nodes/edges using dagre. */
export function layoutWithDagre(nodes: readonly SchemaGraphNode[], edges: readonly SchemaGraphEdge[]): SchemaGraphNode[] {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({ rankdir: 'LR', ranksep: 80, nodesep: 40 });

    for (const node of nodes) {
        dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
    }
    for (const edge of edges) {
        dagreGraph.setEdge(edge.source, edge.target);
    }

    dagre.layout(dagreGraph);

    return nodes.map(node => {
        const { x, y } = dagreGraph.node(node.id);
        return {
            ...node,
            // Layout is left-to-right (rankdir: 'LR'), so edges must connect via the
            // left/right sides — the default top/bottom handles would draw every edge
            // across the grain of the layout instead of along it.
            sourcePosition: Position.Right,
            targetPosition: Position.Left,
            position: {
                x: x - NODE_WIDTH / 2,
                y: y - NODE_HEIGHT / 2,
            },
        };
    });
}
