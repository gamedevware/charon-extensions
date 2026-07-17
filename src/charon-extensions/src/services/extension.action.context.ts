/**
 * Defines the context object(s) the Charon host app hands to extension code at runtime.
 *
 * Every entry in a package's `config.customActions` (declared in `package.json`, validated by
 * `package.json.schema.json`) names a `functionName` exported from the extension's bundle. When
 * that action is triggered, the host calls `functionName(context)` with one of the
 * {@link ExtensionActionContext} variants below — which variant depends on `location`, which is
 * always the same string as the `customActions` entry's own `location` field (e.g. a
 * `document-action-menu` entry always receives a {@link DocumentActionContext}). A
 * `customActions` entry may instead declare `pageId` (mutually exclusive with `functionName`), in
 * which case clicking it navigates to that page and no context/function call happens at all.
 *
 * A package's `config.customPages` entries work differently: each names a custom-element
 * `selector` the host mounts directly (not a function to call), and sets its `.context` property
 * to an {@link ExtensionPageContext} instead.
 *
 * All context variants extend {@link ExtensionActionContextBase}, whose `services` field holds
 * the full set of services/state available regardless of where the action or page was triggered
 * from — see {@link ExtensionContextServices}.
 */

import { RootDocumentControl } from "../controls";
import { Schema } from "../metadata";
import { ObservableLike } from "../reactive"
import { GameDataService } from "./game.data.service";
import { ExtensionScopedUiStateService } from "./preference.service";
import { UiDialogService } from "./ui.dialog.service";
import { UiSnackBarService } from "./ui.snack.bar.service";

/** Project settings sections a custom action or page can navigate to via {@link ExtensionNavigationService.settings}. */
export type ProjectSettingsSection =
    | 'general'
    | 'backup'
    | 'publication'
    | 'source-code'
    | 'internationalization'
    | 'branches'
    | 'members'
    | 'extensions'
    | 'features';

/** Navigation service available on every {@link ExtensionActionContextBase}, letting extensions move around the app without building URLs themselves. Every method navigates immediately. */
export interface ExtensionNavigationService {
    /** Navigates to the current project's dashboard. */
    dashboard(): void;
    /** Navigates to the current project's settings, optionally to a specific section. */
    settings(section?: ProjectSettingsSection): void;
    /** Navigates to a document collection (list) by schema name. */
    documentCollection(schemaName: string): void;
    /** Navigates to a single document's edit form. */
    documentForm(schemaName: string, id: string): void;
    /** Navigates to a custom page declared by any installed extension (not necessarily the caller's own package). `restOfRoute` becomes trailing path segments the page can read back from its own context; `params` become query string parameters. */
    customPage(packageName: string, pageId: string, restOfRoute?: readonly string[], params?: Record<string, string>): void;
    /** Navigates to the generic error page. */
    errorPage(error?: unknown, retryRoute?: string): void;
    /** Navigates back to the previous page in browser history. */
    back(): void;
}

/** The full set of services/state available on every {@link ExtensionActionContext} and on {@link ExtensionPageContext}, regardless of where the action or page was triggered. Reached via {@link ExtensionActionContextBase.services}. */
export interface ExtensionContextServices {
    /** Service providing access to the current authenticated user. */
    readonly userService: {
        readonly currentUser$: ObservableLike<User>;
    };
    /** Service providing access to the current project and branch. */
    readonly projectService: {
        readonly currentProject$: ObservableLike<Project>;
        readonly currentBranch$: ObservableLike<Branch>;
    };
    /** Service providing access to the current workspace. */
    readonly workspaceService: {
        readonly currentWorkspace$: ObservableLike<Workspace>;
    };
    /** Service for querying and modifying game data. */
    readonly gameData: GameDataService;

    /** @deprecated Use {@link ExtensionContextServices.ui}'s `state` field instead. Kept as a same-instance alias for backward compatibility — it is never a different object. */
    readonly uiState: ExtensionScopedUiStateService;

    /** UI services for state, dialogs, and notifications. */
    readonly ui: {
        /** Service for persisting extension-scoped UI state across sessions. Same instance as the deprecated top-level {@link ExtensionContextServices.uiState} — this is the field to use going forward. */
        readonly state: ExtensionScopedUiStateService;
        readonly dialog: UiDialogService;
        readonly snackBar: UiSnackBarService;
    };
    /** Low-level server API client. Intentionally untyped — API surface is not stable. */
    readonly serverApiClient: any;
    /** Service for navigating to built-in and extension-declared pages. */
    readonly navigation: ExtensionNavigationService;
}

/** Fields available on every {@link ExtensionActionContext} and on {@link ExtensionPageContext}, regardless of where the action or page was triggered. */
export interface ExtensionActionContextBase {
    /** All services/state available to extension code. Only the fields the host actually populated are present — treat every field as possibly absent. */
    readonly services: Partial<ExtensionContextServices>;
}

/** Context provided when the action was triggered from the "New Schema" menu on the project dashboard. */
export interface NewSchemaActionContext extends ExtensionActionContextBase {
    readonly location: 'new-schema-menu';
}

/** Context provided when the action was triggered from the "Actions" menu in the single-document edit form. */
export interface DocumentActionContext extends ExtensionActionContextBase {
    readonly location: 'document-action-menu';
    /** The document currently open in the form. */
    readonly documentControl: RootDocumentControl;
}

/** Context provided when the action was triggered from the "Actions" menu in the document list toolbar. */
export interface DocumentListActionContext extends ExtensionActionContextBase {
    readonly location: 'document-list-action-menu';
    /** The schema of the document collection currently listed. */
    readonly schema: Schema;
    /**
     * The document list's current row selection. This is a structural view onto the host's
     * internal selection model — only the members documented here are part of the contract;
     * the live object may carry additional internal members extensions should not rely on.
     */
    readonly selection: {
        /** Ids of the currently selected documents. Can be empty even while `isAllSelected` is true — see `isAllSelected`. */
        readonly selected: readonly string[];
        /** True when the user chose "select all" for the whole (potentially paged/filtered) collection, not just the loaded rows. When true, treat the selection as "every document in the current view", not literally the ids in `selected`. */
        readonly isAllSelected: boolean;
        /** Fires whenever the selection changes (row toggled, "select all" toggled, selection cleared, etc.), reporting only the ids added/removed by that change. */
        readonly changed: ObservableLike<{
            /** Ids newly added to the selection by this change. */
            added: string[];
            /** Ids removed from the selection by this change. */
            removed: string[];
        }>;
    };
}

/** Context provided when the action was triggered from a persistent entry in the project's left sidebar. */
export interface SideNavigationActionContext extends ExtensionActionContextBase {
    readonly location: 'side-navigation-menu';
}

/** Context object provided to custom extension action functions, giving access to project state and services. The shape of the extra fields depends on {@link location}. */
export type ExtensionActionContext = NewSchemaActionContext | DocumentActionContext | DocumentListActionContext
    | SideNavigationActionContext;

/** Represents an authenticated user. */
export interface User {
    readonly id: string;
    readonly name: string;
    /** Absent as either `null` or `undefined` — the two mean the same thing (no picture set); don't distinguish between them. */
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
    /** Absent as either `null` or `undefined` — the two mean the same thing (no picture set); don't distinguish between them. */
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
    /** Absent as either `null` or `undefined` — the two mean the same thing (no picture set); don't distinguish between them. */
    readonly pictureUrl: string | null | undefined;
    /** Ids of projects in this workspace. */
    readonly projects: readonly string[];
}
