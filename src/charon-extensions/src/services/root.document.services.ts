import type { Language } from "../metadata/language";
import { ObservableLike } from "../reactive/observable.like";
import { DataDocumentValue } from "../controls/data.document";
import { FindResult, GameDataService, ListDocumentParameters, ListResult } from "./game.data.service";
import { AiChatService } from "./ai.chat.service";
import { DocumentScopedUiStateService } from "./preference.service";
import { UndoRedoService } from "./undo.redo.service";

export interface RootDocumentControlServices {
    readonly validationProvider: {
        getDocumentValue(path: JsonPointer | string, source?: 'base' | 'current' | 'starting'): DataDocumentValue | undefined;
        listDocuments(schemaNameOrId: string, listDocumentParameters?: Partial<ListDocumentParameters>): ObservableLike<ListResult>;
        listLocalDocuments(schemaNameOrId: string, listDocumentParameters?: Partial<ListDocumentParameters>): ObservableLike<ListResult>;
        findDocument(schemaNameOrId: string, uniqueSchemaPropertyNameOrId: string, uniqueSchemaPropertyValue: string): ObservableLike<FindResult>
    };
    readonly translationLanguage: {
        readonly primaryLanguage$: ObservableLike<Language>;
        readonly languages$: ObservableLike<readonly Language[]>;
        readonly currentLanguage$: ObservableLike<Language>;

        selectLanguage(language: Language): void;
    };
    readonly gameData: GameDataService;
    readonly aiChat: AiChatService;
    readonly undoRedo: UndoRedoService;
    readonly uiState: DocumentScopedUiStateService;
    readonly serverApiClient: any;
}

