import {
    Branch, DataType, ExtensionContextServices, ExtensionPageContext, ObservableLike,
    Project, User, Workspace
} from "charon-extensions";
import { delay, of } from "rxjs";
import { DevMetadata } from "./dev.metadata";

function buildDevMetadata(): DevMetadata {
    const metadata = new DevMetadata();

    metadata.defineSchema('Item', schema => {
        schema.defineIdSchemaProperty(DataType.Text);
        schema.defineSchemaProperty('Name', DataType.Text);
    });

    metadata.defineSchema('Guild', schema => {
        schema.defineIdSchemaProperty(DataType.Text);
        schema.defineSchemaProperty('Name', DataType.Text);
    });

    metadata.defineSchema('Player', schema => {
        schema.defineIdSchemaProperty(DataType.Text);
        schema.defineSchemaProperty('Name', DataType.Text);
        schema.defineSchemaProperty('Guild', DataType.Reference, property => {
            property.referenceType = metadata.referenceSchema('Guild');
        });
        schema.defineSchemaProperty('Inventory', DataType.ReferenceCollection, property => {
            property.referenceType = metadata.referenceSchema('Item');
        });
    });

    metadata.defineSchema('Recipe', schema => {
        schema.defineIdSchemaProperty(DataType.Text);
        schema.defineSchemaProperty('Name', DataType.Text);
        schema.defineSchemaProperty('Ingredients', DataType.ReferenceCollection, property => {
            property.referenceType = metadata.referenceSchema('Item');
        });
        schema.defineSchemaProperty('Result', DataType.Reference, property => {
            property.referenceType = metadata.referenceSchema('Item');
        });
    });

    // Isolated schema — no references in or out. Demonstrates that unconnected
    // schemas still render as nodes (nodes = every schema, not just connected ones).
    metadata.defineSchema('Achievement', schema => {
        schema.defineIdSchemaProperty(DataType.Text);
        schema.defineSchemaProperty('Name', DataType.Text);
    });

    return metadata;
}

const devUser: User = { id: 'dev-user', name: 'Dev User', pictureUrl: undefined };
const devWorkspace: Workspace = { id: 'dev-workspace', name: 'Dev Workspace', pictureUrl: undefined, projects: ['dev-project'] };
const devBranch: Branch = { id: 'dev-branch', name: 'main', isPrimary: true };
const devProject: Project = {
    id: 'dev-project', name: 'Dev Project', pictureUrl: undefined,
    workspaceId: devWorkspace.id, branches: [devBranch]
};

function createDevContextServices(): ExtensionContextServices {
    const devMetadata = buildDevMetadata();

    return {
        userService: {
            currentUser$: of(devUser) as unknown as ObservableLike<User>,
        },
        projectService: {
            currentProject$: of(devProject) as unknown as ObservableLike<Project>,
            currentBranch$: of(devBranch) as unknown as ObservableLike<Branch>,
        },
        workspaceService: {
            currentWorkspace$: of(devWorkspace) as unknown as ObservableLike<Workspace>,
        },
        gameData: {
            getId: () => of('dev-project') as unknown as ObservableLike<string>,
            // 300ms delay so the page's "Loading…" state is actually visible during manual verification.
            getMetadata: () => of(devMetadata).pipe(delay(300)) as unknown as ObservableLike<DevMetadata>,
            find: () => { throw new Error('find() not implemented in dev harness'); },
            query: () => { throw new Error('query() not implemented in dev harness'); },
            list: () => { throw new Error('list() not implemented in dev harness'); },
            bulkChange: () => { throw new Error('bulkChange() not implemented in dev harness'); },
            import: () => { throw new Error('import() not implemented in dev harness'); },
            export: () => { throw new Error('export() not implemented in dev harness'); },
            validate: () => { throw new Error('validate() not implemented in dev harness'); },
        },
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
                showProgress: () => { throw new Error('showProgress() not implemented in dev harness'); },
                showCustom: () => { throw new Error('showCustom() not implemented in dev harness'); },
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
        navigation: {
            dashboard: () => console.log('[dev] navigation.dashboard()'),
            settings: (section) => console.log('[dev] navigation.settings()', section),
            documentCollection: (schemaName) => console.log('[dev] navigation.documentCollection()', schemaName),
            documentForm: (schemaName, id) => console.log('[dev] navigation.documentForm()', schemaName, id),
            customPage: (packageName, pageId, restOfRoute, params) =>
                console.log('[dev] navigation.customPage()', packageName, pageId, restOfRoute, params),
            errorPage: (error, retryRoute) => console.log('[dev] navigation.errorPage()', error, retryRoute),
            back: () => console.log('[dev] navigation.back()'),
        },
    };
}

export function createDevPageContext(): ExtensionPageContext {
    return {
        services: createDevContextServices(),
        params: {},
        restOfRoute: [],
    };
}
