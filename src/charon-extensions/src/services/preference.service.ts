export interface ExtensionScopedUiStateService {
    load(layer: keyof typeof PreferenceLayer): Object | undefined;
    save(layer: keyof typeof PreferenceLayer, state: Object | null | undefined): void;
}

export interface DocumentScopedUiStateService {
    load(scope: 'document' | 'schema', layer: keyof typeof PreferenceLayer): Object | undefined;
    save(scope: 'document' | 'schema', layer: keyof typeof PreferenceLayer, state: Object | null | undefined): void;
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