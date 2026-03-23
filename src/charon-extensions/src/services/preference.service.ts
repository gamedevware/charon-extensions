/** Service for persisting extension-scoped UI state. State is scoped to the extension package. */
export interface ExtensionScopedUiStateService {
    /** Loads previously saved state from the specified preference layer, or undefined if none exists. */
    load(layer: keyof typeof PreferenceLayer): Object | undefined;
    /** Saves state to the specified preference layer. Pass null/undefined to clear. */
    save(layer: keyof typeof PreferenceLayer, state: Object | null | undefined): void;
}

/** Service for persisting document-scoped UI state. State is scoped to either the specific document or its schema. */
export interface DocumentScopedUiStateService {
    /** Loads previously saved state for the given scope and preference layer, or undefined if none exists. */
    load(scope: 'document' | 'schema', layer: keyof typeof PreferenceLayer): Object | undefined;
    /** Saves state for the given scope and preference layer. Pass null/undefined to clear. */
    save(scope: 'document' | 'schema', layer: keyof typeof PreferenceLayer, state: Object | null | undefined): void;
}

/**
 * Defines the storage layer for persisted UI state, ordered by lookup priority.
 * When loading, if a value is not found on the requested layer, lower-priority layers are checked in order.
 */
export enum PreferenceLayer {
    /** Browser session storage (cleared when browser tab closes). Highest priority. */
    browserSession = 0,
    /** Browser local storage, scoped to the current user. */
    browserPersonal = 1,
    /** Browser local storage, shared across users on the same browser. */
    browserShared = 2,
    /** Server-side storage, scoped to the current user within the project. */
    projectPersonal = 3,
    /** Server-side storage, shared across all users in the project. */
    projectTeam = 4,
    /** Server-side storage, scoped to the current user within the workspace. */
    workspacePersonal = 5,
    /** Server-side storage, shared across all users in the workspace. */
    workspaceTeam = 6,
    /** Default/fallback layer. Lowest priority. */
    default = 7
};
