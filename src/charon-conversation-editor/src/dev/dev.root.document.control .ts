import {
    DataDocument, Language, ObservableLike, RootDocumentControl,
    RootDocumentControlServices, Schema, SchemaProperty
} from "charon-extensions";
import { NEVER } from "rxjs";
import { DevValueControl } from "./dev.value.control";
import { DevDocumentControl } from "./dev.document.control";
import { DevUndoRedoService } from "./dev.undo.redo.service";

function notImplemented(methodName: string): () => never {
    return () => { throw new Error(`${methodName}() not implemented in dev harness`); };
}

export class DevRootDocumentControl<T extends DataDocument = DataDocument> extends DevDocumentControl<T> implements RootDocumentControl<T> {
    public declare type: 'document';
    public declare schemaProperty: SchemaProperty & undefined;
    public controls: RootDocumentControl<T>['controls'];

    public readonly services: Partial<RootDocumentControlServices>;

    constructor(
        public baseValue: T,
        public readonly schema: Schema,
    ) {
        super(baseValue, schema.getIdProperty());

        this.controls = Object.fromEntries(schema
            .properties
            .map(schemaProperty => [
                schemaProperty.name,
                DevValueControl.create(this, schemaProperty, baseValue instanceof Object ? baseValue[schemaProperty.name] : null)
            ])
        ) as any;

        this.services = {
            validationProvider: {
                getDocumentValue: notImplemented('getDocumentValue'),
                listDocuments: notImplemented('listDocuments'),
                listLocalDocuments: notImplemented('listLocalDocuments'),
                findDocument: notImplemented('findDocument'),
            },
            translationLanguage: {
                primaryLanguage$: NEVER as unknown as ObservableLike<Language>,
                languages$: NEVER as unknown as ObservableLike<readonly Language[]>,
                currentLanguage$: NEVER as unknown as ObservableLike<Language>,
                selectLanguage: notImplemented('selectLanguage'),
            },
            gameData: {
                getId: notImplemented('getId'),
                getMetadata: notImplemented('getMetadata'),
                find: notImplemented('find'),
                query: notImplemented('query'),
                list: notImplemented('list'),
                bulkChange: notImplemented('bulkChange'),
                import: notImplemented('import'),
                export: notImplemented('export'),
                validate: notImplemented('validate'),
            },
            undoRedo: new DevUndoRedoService<T>(this),
            uiState: {
                load: () => undefined,
                save: () => { },
            },
            ui: {
                state: {
                    load: () => undefined,
                    save: () => { },
                },
                dialog: {
                    showProgress: notImplemented('showProgress'),
                    showCustom: notImplemented('showCustom'),
                    showCodeSnippet: notImplemented('showCodeSnippet'),
                    showBackupWizard: notImplemented('showBackupWizard'),
                    showExportLocalizationWizard: notImplemented('showExportLocalizationWizard'),
                    showExportWizard: notImplemented('showExportWizard'),
                    showImportLocalizationWizard: notImplemented('showImportLocalizationWizard'),
                    showImportWizard: notImplemented('showImportWizard'),
                    showPublicationWizard: notImplemented('showPublicationWizard'),
                    showRestoreWizard: notImplemented('showRestoreWizard'),
                    showSourceCodeGenerationWizard: notImplemented('showSourceCodeGenerationWizard'),
                },
                snackBar: {
                    loadStarted: () => console.log('[dev] snackBar.loadStarted()'),
                    loadFailed: (error: any) => console.log('[dev] snackBar.loadFailed()', error),
                    loadSucceed: () => console.log('[dev] snackBar.loadSucceed()'),
                    saveStarted: () => console.log('[dev] snackBar.saveStarted()'),
                    saveFailed: (error: any) => console.log('[dev] snackBar.saveFailed()', error),
                    saveSucceed: () => console.log('[dev] snackBar.saveSucceed()'),
                    reloadStarted: () => console.log('[dev] snackBar.reloadStarted()'),
                    reloadFailed: (error: any) => console.log('[dev] snackBar.reloadFailed()', error),
                    reloadSucceed: () => console.log('[dev] snackBar.reloadSucceed()'),
                    deleteStarted: () => console.log('[dev] snackBar.deleteStarted()'),
                    deleteFailed: (error: any) => console.log('[dev] snackBar.deleteFailed()', error),
                    deleteSucceed: () => console.log('[dev] snackBar.deleteSucceed()'),
                },
            },
            serverApiClient: undefined,
        };
    }
}
