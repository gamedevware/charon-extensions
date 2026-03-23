/** Service for showing transient notification snack bars in the Charon UI. Each method pair (started/succeed/failed) corresponds to a common CRUD operation. */
export interface UiSnackBarService {
    /** Shows a "loading..." notification. */
    loadStarted(): void;
    /** Shows a load failure notification with the error. */
    loadFailed(error: any): void;
    /** Dismisses the loading notification on success. */
    loadSucceed(): void;

    /** Shows a "saving..." notification. */
    saveStarted(): void;
    /** Shows a save failure notification with the error. */
    saveFailed(error: any): void;
    /** Shows a save success notification. */
    saveSucceed(): void;

    /** Shows a "reloading..." notification. */
    reloadStarted(): void;
    /** Shows a reload failure notification with the error. */
    reloadFailed(error: any): void;
    /** Dismisses the reloading notification on success. */
    reloadSucceed(): void;

    /** Shows a "deleting..." notification. */
    deleteStarted(): void;
    /** Shows a delete failure notification with the error. */
    deleteFailed(error: any): void;
    /** Shows a delete success notification. */
    deleteSucceed(): void;
}
