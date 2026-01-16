import type { Language } from "../metadata/language";
import { ObservableLike } from "../reactive/observable.like";
import { DataDocument, DataDocumentMeta, DataDocumentValue } from "./data.document";

export interface RootDocumentControlServices {
    readonly validationProvider: {
        getDocumentValue(path: JsonPointer | string, source?: 'base' | 'current' | 'starting'): DataDocumentValue | undefined;
        listDocuments(schemaNameOrId: string, listDocumentParameters?: Partial<ListDocumentParameters>): ObservableLike<ListResult>;
        listLocalDocuments(schemaNameOrId: string, listDocumentParameters?: Partial<ListDocumentParameters>): ObservableLike<ListResult>;
        findDocument(schemaNameOrId: string, uniqueSchemaPropertyNameOrId: string, uniqueSchemaPropertyValue: string): ObservableLike<FindResult>
    };
    readonly langugeSelectionService: {
        readonly primaryLanguage$: ObservableLike<Language>;
        readonly languages$: ObservableLike<readonly Language[]>;
        readonly currentLanguage$: ObservableLike<Language>;

        selectLanguage(language: Language): void;
    };
    readonly dataService: {
        getId(): ObservableLike<string>;
        find(schemaNameOrId: string, uniqueSchemaPropertyNameOrId: string, uniqueSchemaPropertyValue: string): ObservableLike<FindResult>;
        query(findRequests: FindRequest[]): ObservableLike<readonly FindResult[]>;
        list(schemaNameOrId: string, listDocumentParameters?: Partial<ListDocumentParameters>): ObservableLike<ListResult>;
    };
    readonly aiChatService: {
        startThread(systemPrompt: string): ObservableLike<AiChatThread>;
    };
    readonly undoRedo: {
        readonly stateChange: ObservableLike<void>

        readonly canUndo: boolean;
        readonly canRedo: boolean;

        undo(): void;
        redo(): void;

        push(action: { redo: () => void; undo: () => void; batchGroup?: string; allowBatching?: boolean }): void;
        clear(): void;
    };
    readonly uiState: {
        load(score: 'document' | 'schema', layer: keyof typeof PreferenceLayer): Object | undefined;
        save(score: 'document' | 'schema', layer: keyof typeof PreferenceLayer, state: Object | null | undefined): void;
    };
    readonly serverApiClient: any;
}

export enum PreferenceLayer {
    browserSession = 0,
    browserPersonal = 1,
    browserShared = 2,
    projectPersonal = 3,
    projectTeam = 4,
    workspacePersonal = 5,
    workspaceTeam = 6,
    default = 7
};

export enum FilterOperator {
    greaterThan = 0,
    greaterThanOrEqual = 1,
    lessThan = 2,
    lessThanOrEqual = 3,
    equal = 4,
    notEqual = 5,
    like = 6,
    in = 7,
}

export enum SorterDirection {
    ascending = 0,
    descending = 1,
}

export interface Filter {
    readonly property: string;
    readonly operator: FilterOperator;
    readonly value: any;
    readonly caseSensitive: boolean;
}

export interface Sorter {
    readonly property: string;
    readonly direction: SorterDirection;
}

export interface ListDocumentParameters {
    readonly path: string;
    readonly skip: number;
    readonly take: number;
    readonly query: string;
    readonly select: readonly string[];
    readonly filters: readonly Filter[];
    readonly sorters: readonly Sorter[];
}

export interface ListResult {
    readonly documents: readonly Readonly<DataDocument>[];
    readonly metas: readonly Readonly<DataDocumentMeta>[];
    readonly total: number;
    readonly metadataHash: string;
    readonly revisionHash: string;
}

export interface FindResult {
    readonly document: Readonly<DataDocument> | null;
    readonly meta: Readonly<DataDocumentMeta>;
    readonly metadataHash: string;
    readonly revisionHash: string;
}

export interface FindRequest {
    readonly schemaNameOrId: string;
    readonly uniqueSchemaPropertyNameOrId: string;
    readonly uniqueSchemaPropertyValue: string;
}

export interface AiChatThread {
    readonly messages$: ObservableLike<readonly AiChatMessage[]>;

    sendMessage(userPrompt: string): ObservableLike<this>;
    regenerateAnswer(): ObservableLike<this>;
    delete(timeoutMs: number): ObservableLike<this>;
}

export interface AiChatMessage {
    readonly role: AiChatMessageRole;
    readonly content: string;
    readonly name: string | null | undefined;
}

export enum AiChatMessageRole {
    user = 0,
    assistant = 1,
    system = 2,
}
