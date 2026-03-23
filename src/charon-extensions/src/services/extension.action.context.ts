import { ObservableLike } from "../reactive"
import { GameDataService } from "./game.data.service";
import { ExtensionScopedUiStateService } from "./preference.service";
import { UiDialogService } from "./ui.dialog.service";
import { UiSnackBarService } from "./ui.snack.bar.service";

/** Context object provided to custom extension action functions, giving access to project state and services. */
export interface ExtensionActionContext {
    /** The UI location where this action was triggered. */
    location: 'new-schema-menu',
    /** Service providing access to the current authenticated user. */
    userService: {
        currentUser$: ObservableLike<User>;
    };
    /** Service providing access to the current project and branch. */
    projectService: {
        currentProject$: ObservableLike<Project>;
        currentBranch$: ObservableLike<Branch>;
    };
    /** Service providing access to the current workspace. */
    workspaceService: {
        currentWorkspace$: ObservableLike<Workspace>;
    };
    /** Service for querying and modifying game data. */
    readonly gameData: GameDataService;

    /** Service for persisting extension-scoped UI state across sessions. */
    readonly uiState: ExtensionScopedUiStateService;
    /** UI services for dialogs and notifications. */
    readonly ui: {
        dialog: UiDialogService;
        snackBar: UiSnackBarService;
    };
    /** Low-level server API client. Intentionally untyped — API surface is not stable. */
    readonly serverApiClient: any;
}

/** Represents an authenticated user. */
export interface User {
    readonly id: string;
    readonly name: string;
    readonly pictureUrl: string | null | undefined;
}

/** Represents a project branch (e.g., for versioning or staging). */
export interface Branch {
    readonly id: string;
    readonly name: string;
    /** Whether this is the primary (main) branch. */
    readonly isPrimary: boolean;
}

/** Represents a Charon project. */
export interface Project {
    readonly id: string;
    readonly name: string;
    readonly pictureUrl: string | null | undefined;
    /** Id of the workspace this project belongs to. */
    readonly workspaceId: string;
    /** Branches available in this project. */
    readonly branches: readonly Branch[];
}

/** Represents a Charon workspace containing one or more projects. */
export interface Workspace {
    readonly id: string;
    readonly name: string;
    readonly pictureUrl: string | null | undefined;
    /** Ids of projects in this workspace. */
    readonly projects: readonly string[];
}
