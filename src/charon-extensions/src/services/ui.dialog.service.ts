/** Service for showing modal dialogs in the Charon UI. */
export interface UiDialogService {
    /** Opens a progress dialog and returns a reference for controlling it. */
    showProgress(options: ProgressDialogOptions): ProgressDialogRef;
}

/** Options for creating a progress dialog. */
export interface ProgressDialogOptions {
    /** Dialog title text. */
    readonly title: string;
    /** Progress bar mode (Angular Material progress bar modes). */
    readonly progressMode: 'determinate' | 'indeterminate' | 'buffer' | 'query';
    /** Whether the user can cancel the operation. */
    readonly cancellable: boolean;
    /** Called when the dialog is closed. The `cancelled` parameter indicates if the user cancelled. */
    readonly closedHandler: (cancelled: boolean) => void;
}

/** Handle for controlling an open progress dialog. */
export interface ProgressDialogRef {
    /** Updates the progress value (0–100), optional message, and optional color. */
    update(progress: number, progressMessage?: string, color?: string): void;
    /** Marks the operation as failed, changing the dialog appearance to an error state. */
    setFaulted(): void;
    /** Closes the dialog, optionally after a delay (in milliseconds). */
    close(delayTimeMs?: number): void;
}
