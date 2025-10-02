import { ControlEventEmitOptions, DocumentControl, RootDocumentControl } from "charon-extensions";
import { DialogResponse, generateDialogNodeIdPlaceholder, generateDialogNodeResponseIdPlaceholder, type ConversationTree, type DialogNode, type DialogNodeReference } from "../models";
import { NodeChange, Position, NodeAddChange, EdgeAddChange, EdgeChange, XYPosition } from "@xyflow/react";
import type { DialogFlowEdge, DialogFlowNode } from "../nodes/node.types";
import { createDialogHandleId, createDialogFlowNodeId, createDialogResponseHandleId, createRootNodeHandleId, createRootFlowNodeId, parseHandleOrFlowNodeId } from "../nodes";
import { formatDocumentDisplayText, getDocumentIdAsString } from "../nodes/document.control.functions";
import { arePositionsEquals, clampPosition, getPosition, setPosition } from "./x.y.position";
import { bindInstanceMethods } from "./bind.instance.methods.function";

const noChanges: readonly EdgeChange<DialogFlowEdge>[] = [];

export class ConversationState {
    private readonly originalIdToControlMap: Map<string, WeakRef<DocumentControl>>;

    constructor(
        public readonly conversationTreeControl: RootDocumentControl<ConversationTree>
    ) {
        this.originalIdToControlMap = new Map();

        bindInstanceMethods(this);
    }

    public getConversationNodeChanges(nodes: readonly DialogFlowNode[]): NodeChange<DialogFlowNode>[] {

        const nodesById = new Map<string, DialogFlowNode>(nodes.map(node => [node.id, node]));
        const changes: NodeChange<DialogFlowNode>[] = [];

        // create or update dialog nodes
        const nodesControl = this.conversationTreeControl.controls.Nodes;
        for (const dialogNodeControl of nodesControl.controls) {
            const { Id, Specification } = dialogNodeControl.value;

            const dialogFlowNodeId = createDialogFlowNodeId(Id);
            const existingNode = nodesById.get(dialogFlowNodeId);
            const specification = new URLSearchParams(String(Specification || ''));
            const position = getPosition(specification);

            nodesById.delete(dialogFlowNodeId); // prevent deletion of this node
            if (existingNode && Object.is(existingNode.data.valueControl, dialogNodeControl)) {
                if (position && !arePositionsEquals(position, existingNode.position)) {
                    changes.push({
                        id: existingNode.id,
                        type: 'position',
                        position,
                        dragging: false,
                    });
                }
            } else {
                const newNode: DialogFlowNode = this.createNode(dialogFlowNodeId, position, {
                    valueControl: dialogNodeControl
                }, 'dialog');

                if (existingNode) {
                    changes.push({
                        id: existingNode.id,
                        item: newNode,
                        type: 'replace'
                    });
                } else {

                    changes.push({
                        item: newNode,
                        type: 'add'
                    });
                }
            }
        }

        // create or update root node
        const rootFlowNodeId = createRootFlowNodeId(this.conversationTreeControl.controls.Id.value);
        const existingRootNode = nodesById.get(rootFlowNodeId);
        const rootNodeSpecification = new URLSearchParams(String(this.conversationTreeControl.controls.Specification?.value || ''));
        const rootPosition = getPosition(rootNodeSpecification);
        nodesById.delete(rootFlowNodeId); // prevent deletion of this node
        if (existingRootNode && Object.is(existingRootNode.data.valueControl, this.conversationTreeControl)) {
            if (rootPosition && !arePositionsEquals(rootPosition, existingRootNode.position)) {
                changes.push({
                    id: existingRootNode.id,
                    type: 'position',
                    position: rootPosition,
                    dragging: false
                });
            }
        } else {
            const newRootNode: DialogFlowNode = this.createNode(rootFlowNodeId, rootPosition, {
                valueControl: this.conversationTreeControl
            }, 'root');

            if (existingRootNode) {
                changes.push({
                    id: existingRootNode.id,
                    item: newRootNode,
                    type: 'replace'
                });
            } else {

                changes.push({
                    item: newRootNode,
                    type: 'add'
                });
            }
        }

        this.fixNodePositions(changes);

        // delete all not synced nodes
        for (const id of nodesById.keys()) {
            changes.push({
                id,
                type: 'remove',
            });
        }

        return changes;
    }

    public getInitalNodes(): DialogFlowNode[] {
        return this.getConversationNodeChanges([])
            .filter((change: NodeChange<DialogFlowNode>): change is NodeAddChange<DialogFlowNode> => change.type === 'add')
            .map(addChange => addChange.item);
    }

    public getConversationEdgeChanges(edges: readonly DialogFlowEdge[]): EdgeChange<DialogFlowEdge>[] {
        const edgeById = new Map<string, DialogFlowEdge>(edges.map(edge => [edge.id, edge]));
        const changes: EdgeChange<DialogFlowEdge>[] = [];
        const nodesControl = this.conversationTreeControl.controls.Nodes;
        for (const dialogNodeControl of nodesControl.controls) {

            const { Id, NextNode, Responses } = dialogNodeControl.value;
            if (NextNode != null && !Responses?.length) {
                changes.push(...this.getEdgeChange(edgeById, createDialogFlowNodeId(Id), createDialogFlowNodeId(NextNode.Id), createDialogHandleId(Id)));
            }
            for (const response of Responses) {
                if (response.NextNode?.Id === undefined) {
                    continue;
                }
                changes.push(...this.getEdgeChange(edgeById, createDialogFlowNodeId(Id), createDialogFlowNodeId(response.NextNode.Id), createDialogResponseHandleId(response.Id)));
            }
        }

        const { Id: rootId, RootNode: rootNextNode } = this.conversationTreeControl.value;
        if (rootNextNode) {
            changes.push(...this.getEdgeChange(edgeById, createRootFlowNodeId(rootId), createDialogFlowNodeId(rootNextNode.Id), createRootNodeHandleId(rootId)));
        }

        for (const id of edgeById.keys()) {
            changes.push({
                id,
                type: 'remove',
            });
        }

        return changes;
    }

    public getInitalEdges(): DialogFlowEdge[] {
        return this.getConversationEdgeChanges([])
            .filter((change: EdgeChange<DialogFlowEdge>): change is EdgeAddChange<DialogFlowEdge> => change.type === 'add')
            .map(addChange => addChange.item);
    }

    public createEdge(source: string, target: string, sourceHandle: string | undefined, targetHandle: string | undefined): DialogFlowEdge {
        const id = 'edge-' + (sourceHandle ?? source) + '_' + (targetHandle ?? target);
        return {
            id,
            source,
            target,
            sourceHandle,
            targetHandle,
            data: {}
        };
    }

    public createNode(id: string, position: XYPosition | undefined, data: DialogFlowNode['data'], type: 'dialog' | 'root'): DialogFlowNode {
        return {
            id,
            position: position ?? { x: NaN, y: NaN }, // will be fixed later
            sourcePosition: Position.Left,
            targetPosition: Position.Right,
            data,
            draggable: true,
            type
        };
    }

    public createDialogContinuationNode(source: string, sourceHandleId: string, position: XYPosition, opts?: ControlEventEmitOptions) {
        const nodesControl = this.conversationTreeControl.controls.Nodes;
        const newDialogNodeId = generateDialogNodeIdPlaceholder();
        const specification = setPosition('', position);

        const newDialogNodeControl = nodesControl.append({
            Id: newDialogNodeId,
            Text: '<EMPTY>',
            NextNode: null,
            Responses: [],
            Specification: specification.toString(),

        }, opts);

        // save it for actualizeId function
        this.originalIdToControlMap.set(newDialogNodeId, new WeakRef(newDialogNodeControl));

        const { id: sourceDialogNodeId } = parseHandleOrFlowNodeId(source);
        const { id: sourceDialogNodeOrResponseId, type: handleType } = parseHandleOrFlowNodeId(sourceHandleId);
        switch (handleType) {
            case "response-handle": this.setDialogResponseNextNode(sourceDialogNodeId, sourceDialogNodeOrResponseId, newDialogNodeId, undefined, opts); break;
            case "dialog-handle": this.setDialogNextNode(sourceDialogNodeId, newDialogNodeId, undefined, opts); break;
            case "root-handle": this.setRootNode(newDialogNodeId, undefined, opts); break;
            case "unknown": break;
        }
    }

    public createDialogNode(initialData: Partial<DialogNode>, position: XYPosition, opts?: ControlEventEmitOptions) {
        const nodesControl = this.conversationTreeControl.controls.Nodes;
        const specification = setPosition(initialData?.Specification ?? '', position);
        const newDialogNodeId = initialData.Id || generateDialogNodeIdPlaceholder();
        const newDialogNodeControl = nodesControl.append({
            ...initialData,

            Id: newDialogNodeId,
            Text: initialData.Text ?? '<EMPTY>',
            NextNode: initialData.NextNode ?? null,
            Responses: (initialData.Responses ?? []).map(mapResponse),
            Specification: specification.toString(),

        }, opts);

        // save it for actualizeId function
        if (typeof newDialogNodeId === 'string' && newDialogNodeId.startsWith('_ID_')) {
            this.originalIdToControlMap.set(newDialogNodeId, new WeakRef(newDialogNodeControl));
        }

        function mapResponse(responseData: Partial<DialogResponse>): DialogResponse {

            return {
                ...responseData,

                Id: responseData.Id || generateDialogNodeResponseIdPlaceholder(),
                Text: responseData.Text ?? '<EMPTY>',
                NextNode: initialData.NextNode ?? null,
                Specification: initialData.Specification ?? '',
            };
        }
    }

    public setDialogNextNode(dialogNodeId: string, targetDialogNodeId: string | null, comparisonTargetDialogNodeId?: string | null, opts?: ControlEventEmitOptions) {
        const dialogNodeControl = this.findDialogNode(dialogNodeId);
        if (!dialogNodeControl) {
            return;
        }

        const nextNodeControl = dialogNodeControl.controls.NextNode;
        if (comparisonTargetDialogNodeId !== undefined && nextNodeControl.value?.Id != comparisonTargetDialogNodeId) {
            return; // unexpected original value
        }

        const nextNodeReference = this.getNextNodeReference(targetDialogNodeId);
        nextNodeControl.setValue(nextNodeReference, opts);
    }

    public setDialogResponseNextNode(dialogNodeId: string, dialogResponseId: string, targetDialogNodeId: string | null, comparisonTargetDialogNodeId?: string | null, opts?: ControlEventEmitOptions) {
        const dialogResponseControl = this.findDialogResponse(dialogNodeId, dialogResponseId);
        if (!dialogResponseControl) {
            return;
        }

        const nextNodeControl = dialogResponseControl.controls.NextNode;
        if (comparisonTargetDialogNodeId !== undefined && nextNodeControl.value?.Id != comparisonTargetDialogNodeId) {
            return; // unexpected original value
        }
        const nextNodeReference = this.getNextNodeReference(targetDialogNodeId);
        nextNodeControl.setValue(nextNodeReference, opts);
    }

    public setRootNode(targetDialogNodeId: string | null, comparisonTargetDialogNodeId?: string | null, opts?: ControlEventEmitOptions) {

        const rootNodeControl = this.conversationTreeControl.controls.RootNode;
        if (comparisonTargetDialogNodeId !== undefined && rootNodeControl.value?.Id != comparisonTargetDialogNodeId) {
            return; // unexpected original value
        }

        const nextNodeReference = this.getNextNodeReference(targetDialogNodeId);
        rootNodeControl.setValue(nextNodeReference as DialogNodeReference, opts);
    }

    public setDialogNodePosition(dialogNodeId: string, position: XYPosition | undefined, opts?: ControlEventEmitOptions) {
        const dialogNodeControl = this.findDialogNode(dialogNodeId);
        if (!dialogNodeControl) {
            return;
        }

        const specificationControl = dialogNodeControl.controls.Specification;
        const specification = new URLSearchParams(String(specificationControl.value ?? ''));
        if (arePositionsEquals(getPosition(specification), clampPosition(position))) {
            return; // same positions
        }

        setPosition(specification, position);
        specificationControl.setValue(specification.toString(), opts);
    }

    public setRootNodePosition(position: XYPosition | undefined, opts?: ControlEventEmitOptions) {

        const specificationControl = this.conversationTreeControl.controls.Specification;
        const specification = new URLSearchParams(String(specificationControl.value ?? ''));
        if (arePositionsEquals(getPosition(specification), clampPosition(position))) {
            return; // same positions
        }

        setPosition(specification, position);
        specificationControl.setValue(specification.toString(), opts);
    }

    public addDialogResponse(dialogNodeId: string, text: string, opts?: ControlEventEmitOptions) {
        const dialogNodeControl = this.findDialogNode(dialogNodeId);
        if (!dialogNodeControl) {
            return;
        }

        const nextNodeControl = dialogNodeControl.controls.NextNode;
        if (nextNodeControl.value !== null) {
            nextNodeControl.setValue(null, opts); // nullify next node because we have options to select
        }

        const newDialogResponseId = generateDialogNodeResponseIdPlaceholder();
        const responsesControl = dialogNodeControl.controls.Responses;
        const newDialogResponseControl = responsesControl.append({
            Id: newDialogResponseId,
            Text: text,
            NextNode: null,
            Specification: ''
        }, opts);

        // save it for actualizeId function
        this.originalIdToControlMap.set(newDialogResponseId, new WeakRef(newDialogResponseControl));
    }

    public removeDialogResponse(dialogNodeId: string, dialogResponseId: string, opts?: ControlEventEmitOptions) {
        dialogResponseId = this.actualizeId(dialogResponseId);

        const dialogNodeControl = this.findDialogNode(dialogNodeId);
        if (!dialogNodeControl) {
            return;
        }
        const responsesControl = dialogNodeControl.controls.Responses;
        const responseIndex = responsesControl.controls.findIndex(responseControl => responseControl.controls.Id.value == dialogResponseId);
        if (responseIndex < 0) {
            return false;
        }
        responsesControl.removeAt(responseIndex, opts);
        return true;
    }

    public removeDialogNode(dialogNodeId: string, opts?: ControlEventEmitOptions) {
        dialogNodeId = this.actualizeId(dialogNodeId);

        const nodesControl = this.conversationTreeControl.controls.Nodes;
        const dialogNodeIndex = nodesControl.value.findIndex(node => node.Id == dialogNodeId);
        if (dialogNodeIndex < 0) {
            return false;
        }
        nodesControl.removeAt(dialogNodeIndex, opts);

        // clear all references to this node
        for (const dialogNodeControl of nodesControl.controls) {

            // clear references from other dialog nodes
            clearNextNodeIfMatch(dialogNodeControl);

            // clear reference from respones
            const responsesControl = dialogNodeControl.controls.Responses;
            for (const responseControl of responsesControl.controls) {
                clearNextNodeIfMatch(responseControl);
            }

            function clearNextNodeIfMatch(documentControl: DocumentControl<DialogNode> | DocumentControl<DialogResponse>) {
                const nextNodeControl = documentControl.controls.NextNode;
                const nextNode = nextNodeControl.value;

                if (nextNode && nextNode.Id == dialogNodeId) {
                    nextNodeControl.setValue(null, opts);
                }
            }
        }

        // clear root node reference to this node
        const rootNodeControl = this.conversationTreeControl.controls.RootNode;
        if (rootNodeControl.value?.Id == dialogNodeId) {
            rootNodeControl.setValue(null as unknown as DialogNodeReference, opts); // this is kinda invalid to set root node to null, but it is better tan broken reference
        }

        return true;
    }

    public findDialogNode(dialogNodeId: string | null | undefined) {
        dialogNodeId = this.actualizeId(dialogNodeId);

        if (!dialogNodeId) {
            return;
        }

        const nodesControl = this.conversationTreeControl.controls.Nodes;
        const dialogNodeIndex = nodesControl.value.findIndex(node => node.Id == dialogNodeId);
        if (dialogNodeIndex < 0) {
            return; // source node is not found
        }
        return nodesControl.controls[dialogNodeIndex];
    }

    public findDialogResponse(dialogNodeId: string | null | undefined, dialogResponseId: string | null | undefined) {
        dialogNodeId = this.actualizeId(dialogNodeId);
        dialogResponseId = this.actualizeId(dialogResponseId);

        if (!dialogNodeId || !dialogResponseId) {
            return;
        }

        const dialogNodeControl = this.findDialogNode(dialogNodeId);
        if (!dialogNodeControl) {
            return;
        }
        const responsesControl = dialogNodeControl.controls.Responses;
        for (const responseControl of responsesControl.controls) {
            const id = String(responseControl.controls.Id.value);
            if (id === dialogResponseId) {
                return responseControl;
            }
        }
    }


    // original Id of DialogNode/DialogResponse could be edited, but original ones could be left in DOM and used with any methods above, 
    // so we keep map of "original id -> document" to miltigate this issue
    private actualizeId(dialogNodeOrResponseId: string): string;
    private actualizeId(dialogNodeOrResponseId: string | undefined | null): string | undefined | null;
    private actualizeId(dialogNodeOrResponseId: string | undefined | null): string | undefined | null {
        if (!dialogNodeOrResponseId) {
            return null;
        }
        const control = this.originalIdToControlMap.get(dialogNodeOrResponseId)?.deref();
        if (control) {
            return getDocumentIdAsString(control); // since findDialogNode/findDialogResponse use loose Id comparison, conversion to string won't break anything
        }

        return dialogNodeOrResponseId;
    }

    private getEdgeChange(
        edges: Map<string, DialogFlowEdge>,
        source: string,
        target: string,
        sourceHandle: string
    ): readonly EdgeChange<DialogFlowEdge>[] {

        const newEdge = this.createEdge(source, target, sourceHandle, undefined);
        const existingEdge = edges.get(newEdge.id);
        edges.delete(newEdge.id);

        if (existingEdge &&
            existingEdge.source === source &&
            existingEdge.target === target &&
            existingEdge.sourceHandle === newEdge.sourceHandle &&
            existingEdge.targetHandle === newEdge.targetHandle) {
            return noChanges;
        }

        if (existingEdge) {
            return [{
                id: newEdge.id,
                type: 'replace',
                item: newEdge
            }];
        } else {
            return [{
                type: 'add',
                item: newEdge
            }];
        }
    }

    private fixNodePositions(changes: NodeChange<DialogFlowNode>[]) {
        let lastX = 0;
        let lastY = 0;
        const nodeWidth = 200;
        const nodeGap = 20;
        const nodeHeight = 500;
        for (const nodeChange of changes) {
            if (nodeChange.type !== 'replace' && nodeChange.type !== 'add') {
                continue;
            }
            if (isNaN(nodeChange.item.position.x) || !isFinite(nodeChange.item.position.x) ||
                isNaN(nodeChange.item.position.y) || !isFinite(nodeChange.item.position.y)) {
                nodeChange.item.position.x = lastX;
                nodeChange.item.position.y = lastY;

                lastX += nodeWidth + nodeGap;
                if (lastX > nodeWidth * 10) { // new line of nodes when overflow
                    lastY += nodeHeight + nodeGap;
                    lastX = 0;
                }
            }
        }
    }
    private getNextNodeReference(targetDialogNodeId: string | null): DialogNodeReference | null {
        if (targetDialogNodeId === null) {
            return null; // target is null
        }
        const targetDialogNode = this.findDialogNode(targetDialogNodeId);
        if (!targetDialogNode) {
            return null; // target is not found
        }
        const targetDisplayName = formatDocumentDisplayText(targetDialogNode) ?? targetDialogNodeId;
        const targetId = targetDialogNode.schema.getIdProperty().convertFrom(targetDialogNode.controls.Id.value ?? targetDialogNodeId);
        return { Id: targetId, DisplayName: targetDisplayName };
    }
}