import { Edge, Node, NodeTypes } from "@xyflow/react";
import DialogTreeNode from "../nodes/dialog.tree.node"
import RootNode from "../nodes/root.node"
import type { DocumentControl } from "charon-extensions";
import type { ConversationTree, DialogNode } from "../models";

/**
 * React Flow node type for dialog conversation trees
 * Contains value control for either DialogNode or ConversationTree documents
 */
export type DialogFlowNode = Node<{ valueControl: DocumentControl<DialogNode> | DocumentControl<ConversationTree> }, keyof typeof nodeTypes>;

/**
 * React Flow edge type for dialog conversation trees
 * Simple edge without additional properties
 */
export type DialogFlowEdge = Edge<Record<string, never>>;

/**
 * Mapping of node types to their React components
 * Used by React Flow to render different node types
 * @type {NodeTypes}
 */
export const nodeTypes: NodeTypes = {
    'dialog': DialogTreeNode,
    'root': RootNode
};

/**
 * Gets the CSS class name for a node, used by React Flow Minimap for styling
 * The class name corresponds to the node type for minimap color coding
 * @param {Node<any, keyof typeof nodeTypes>} node - The React Flow node
 * @returns {string} The node type to use as CSS class name for minimap styling
 */
export function getNodeClassName(node: Node<any, keyof typeof nodeTypes>) { return node.type };