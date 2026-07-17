import { DataType, Metadata } from "charon-extensions";
import { Edge, Node } from "@xyflow/react";

/** React Flow node type for the schema graph — just a label, nothing editable. */
export type SchemaGraphNode = Node<{ label: string }>;

/** React Flow edge type for the schema graph — a plain reference link, no extra data. */
export type SchemaGraphEdge = Edge<Record<string, never>>;

/**
 * Converts project metadata into a graph: one node per schema, one edge per
 * Reference/ReferenceCollection property (Document/DocumentCollection embedding
 * is intentionally not represented — see design spec §Non-Goals).
 */
export function schemaToGraph(metadata: Metadata): { nodes: SchemaGraphNode[]; edges: SchemaGraphEdge[] } {
    const nodes: SchemaGraphNode[] = metadata.schemas.map(schema => ({
        id: schema.id,
        position: { x: 0, y: 0 },
        data: { label: schema.displayName || schema.name },
    }));

    const edges: SchemaGraphEdge[] = [];
    for (const schema of metadata.schemas) {
        for (const property of schema.properties) {
            if (property.dataType !== DataType.Reference && property.dataType !== DataType.ReferenceCollection) {
                continue;
            }
            if (!property.referenceType) {
                continue; // shouldn't happen per contract, but cheap to guard
            }
            const targetSchema = property.getReferencedSchema();
            edges.push({
                id: `${schema.id}:${property.id}`,
                source: schema.id,
                target: targetSchema.id,
            });
        }
    }

    return { nodes, edges };
}
