export interface UiSnackBarService {
    loadStarted(): void;
    loadFailed(error: any): void;
    loadSucceed(): void;

    saveStarted(): void;
    saveFailed(error: any): void;
    saveSucceed(): void;

    reloadStarted(): void;
    reloadFailed(error: any): void;
    reloadSucceed(): void;

    deleteStarted(): void;
    deleteFailed(error: any): void;
    deleteSucceed(): void;
}