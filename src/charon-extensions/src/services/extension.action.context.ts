import { ObservableLike } from "../reactive"
import { AiChatService } from "./ai.chat.service";
import { GameDataService } from "./game.data.service";
import { ExtensionScopedUiStateService } from "./preference.service";
import { UiDialogService } from "./ui.dialog.service";
import { UiSnackBarService } from "./ui.snack.bar.service";

export interface ExtensionActionContext {
    location: 'new-schema-menu',
    userService: {
        currentUser$: ObservableLike<User>;
    };
    projectService: {
        currentProject$: ObservableLike<Project>;
        currentBranch$: ObservableLike<Branch>;
    };
    workspaceService: {
        currentWorkspace$: ObservableLike<Workspace>;
    };
    readonly gameData: GameDataService;
    readonly aiChat: AiChatService;

    readonly uiState: ExtensionScopedUiStateService;
    readonly ui: {
        dialog: UiDialogService;
        snackBar: UiSnackBarService;
    };
    readonly serverApiClient: any;
}

export interface User {
    readonly id: string;
    readonly name: string;
    readonly pictureUrl: string | null | undefined;
}

export interface Branch {
    readonly id: string;
    readonly name: string;
    readonly isPrimary: boolean;
}

export interface Project {
    readonly id: string;
    readonly name: string;
    readonly pictureUrl: string | null | undefined;
    readonly workspaceId: string;
    readonly branches: readonly Branch[];
}

export interface Workspace {
    readonly id: string;
    readonly name: string;
    readonly pictureUrl: string | null | undefined;
    readonly projects: readonly string[];
}  