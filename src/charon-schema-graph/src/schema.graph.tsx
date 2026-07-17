import '@xyflow/react/dist/style.css';
import './schema.graph.scss';
import { Background, BackgroundVariant, Controls, MiniMap, ReactFlow, ReactFlowProvider } from '@xyflow/react';
import { Metadata } from 'charon-extensions';
import { useMemo } from 'react';
import { schemaToGraph } from './schema.to.graph.function';
import { layoutWithDagre } from './layout.with.dagre.function';

function SchemaGraph({ metadata }: { metadata: Metadata }) {
    const { nodes, edges } = useMemo(() => {
        const graph = schemaToGraph(metadata);
        return { nodes: layoutWithDagre(graph.nodes, graph.edges), edges: graph.edges };
    }, [metadata]);

    return (
        <div className="ext-sg-graph">
            <ReactFlowProvider>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    fitView
                    nodesDraggable={false}
                    nodesConnectable={false}
                    edgesFocusable={false}
                    elementsSelectable={false}
                    attributionPosition="top-right"
                >
                    <MiniMap zoomable pannable />
                    <Controls showInteractive={false} />
                    <Background variant={BackgroundVariant.Dots} />
                </ReactFlow>
            </ReactFlowProvider>
        </div>
    );
}

export default SchemaGraph;
