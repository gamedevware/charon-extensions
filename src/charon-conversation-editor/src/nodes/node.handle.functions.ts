/**
 * Creates a unique React Flow node ID for dialog nodes in React Flow
 * @param {string | number | bigint} dialogNodeId - The original dialog node ID
 * @returns {string} Formatted node ID for React Flow (prefix: 'node-dialog-')
 */
export function createDialogFlowNodeId(dialogNodeId: string | number | bigint) {
    return 'node-dialog-' + String(dialogNodeId);
}

/**
 * Creates a unique React Flow node ID for root nodes in React Flow
 * @param {string | number | bigint} rootNodeId - The original root node ID
 * @returns {string} Formatted node ID for React Flow (prefix: 'node-root-')
 */
export function createRootFlowNodeId(rootNodeId: string | number | bigint) {
    return 'node-root-' + String(rootNodeId);
}

/**
 * Creates a unique handle ID for dialog node connection points in React Flow
 * @param {string | number | bigint} dialogNodeId - The dialog node ID
 * @returns {string} Formatted handle ID for React Flow (prefix: 'handle-dialog-')
 */
export function createDialogHandleId(dialogNodeId: string | number | bigint) {
    return 'handle-dialog-' + String(dialogNodeId);
}

/**
 * Creates a unique handle ID for dialog response connection points in React Flow
 * @param {string | number | bigint} dialogResponseId - The dialog response ID
 * @returns {string} Formatted handle ID for React Flow (prefix: 'handle-response-')
 */
export function createDialogResponseHandleId(dialogResponseId: string | number | bigint) {
    return 'handle-response-' + String(dialogResponseId);
}

/**
 * Creates a unique handle ID for root node connection points in React Flow
 * @param {string | number | bigint} rootNodeId - The root node ID
 * @returns {string} Formatted handle ID for React Flow (prefix: 'handle-root-')
 */
export function createRootNodeHandleId(rootNodeId: string | number | bigint) {
    return 'handle-root-' + String(rootNodeId);
}

/**
 * Parses React Flow node and handle IDs to extract the original ID and type
 * Used to reverse-engineer the entity type and original ID from React Flow generated IDs
 * @param {string} handleId - The React Flow node or handle ID to parse
 * @returns {{type: 'response-handle' | 'dialog-handle' | 'root-handle' | 'dialog-node' | 'root-node' | 'unknown', id: string}} Object containing the entity type and original ID
 */
export function parseHandleOrFlowNodeId(handleId: string): { type: 'response-handle' | 'dialog-handle' | 'root-handle' | 'dialog-node' | 'root-node' | 'unknown', id: string } {

    if (handleId.startsWith('handle-dialog-')) {
        return { type: 'dialog-handle', id: handleId.substring('handle-dialog-'.length) };
    } else if (handleId.startsWith('handle-response-')) {
        return { type: 'response-handle', id: handleId.substring('handle-response-'.length) };
    } else if (handleId.startsWith('handle-root-')) {
        return { type: 'root-handle', id: handleId.substring('handle-root-'.length) };
    } else if (handleId.startsWith('node-dialog-')) {
        return { type: 'dialog-node', id: handleId.substring('node-dialog-'.length) };
    } else if (handleId.startsWith('node-root-')) {
        return { type: 'root-node', id: handleId.substring('node-root-'.length) };
    } else {
        return { type: 'unknown', id: handleId };
    }
}