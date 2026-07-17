import type { Language } from "../metadata/language";
import { ObservableLike } from "../reactive/observable.like";
import { DataDocumentValue } from "../controls/data.document";
import { FindResult, GameDataService, ListDocumentParameters, ListResult } from "./game.data.service";
import { DocumentScopedUiStateService } from "./preference.service";
import { UndoRedoService } from "./undo.redo.service";
import { UiDialogService } from "./ui.dialog.service";
import { UiSnackBarService } from "./ui.snack.bar.service";

/** Services available on a {@link RootDocumentControl}, providing validation, translation, data access, and UI state management. */
export interface RootDocumentControlServices {
    /** Provides access to document values and document queries for validation purposes. */
    readonly validationProvider: {
        /**
         * Returns a value from the document at the given path.
         * @param source - Which document state to read from:
         *   'base' — the original server state (before any editing sessions),
         *   'starting' — the state when the current editing session began (may include unsaved changes from prior sessions),
         *   'current' — the actual current value including all pending edits.
         */
        getDocumentValue(path: JsonPointer | string, source?: 'base' | 'current' | 'starting'): DataDocumentValue | undefined;
        /** Lists documents from the server. */
        listDocuments(schemaNameOrId: string, listDocumentParameters?: Partial<ListDocumentParameters>): ObservableLike<ListResult>;
        /** Lists only local (sub-document) documents within the currently edited document. */
        listLocalDocuments(schemaNameOrId: string, listDocumentParameters?: Partial<ListDocumentParameters>): ObservableLike<ListResult>;
        /** Finds a single document by a unique property value. */
        findDocument(schemaNameOrId: string, uniqueSchemaPropertyNameOrId: string, uniqueSchemaPropertyValue: string): ObservableLike<FindResult>
    };
    /** Translation language management for LocalizedText properties. */
    readonly translationLanguage: {
        /** The primary (source) language of the project. */
        readonly primaryLanguage$: ObservableLike<Language>;
        /** All configured languages in the project. */
        readonly languages$: ObservableLike<readonly Language[]>;
        /** The currently selected translation language. */
        readonly currentLanguage$: ObservableLike<Language>;

        /** Switches the active translation language. */
        selectLanguage(language: Language): void;
    };
    /** Service for querying and modifying game data. */
    readonly gameData: GameDataService;
    /** Undo/redo history management for the current document. */
    readonly undoRedo: UndoRedoService;
    /** @deprecated Use {@link RootDocumentControlServices.ui}'s `state` field instead. Kept as a same-instance alias for backward compatibility — it is never a different object. */
    readonly uiState: DocumentScopedUiStateService;
    /** UI services for state, dialogs, and notifications. */
    readonly ui: {
        /** Service for persisting document-scoped UI state across sessions. Same instance as the deprecated top-level {@link RootDocumentControlServices.uiState} — this is the field to use going forward. */
        readonly state: DocumentScopedUiStateService;
        readonly dialog: UiDialogService;
        readonly snackBar: UiSnackBarService;
    };
    /** Low-level server API client. Intentionally untyped — API surface is not stable. */
    readonly serverApiClient: any;
}
