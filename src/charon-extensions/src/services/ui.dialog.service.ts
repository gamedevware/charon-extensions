import { ObservableLike } from "../reactive";

/** Service for showing modal dialogs in the Charon UI. */
export interface UiDialogService {
    /** Opens a progress dialog and returns a reference for controlling it. */
    showProgress(options: ProgressDialogOptions): ProgressDialogRef;
    /** Opens a dialog hosting a custom element the extension itself registered via `customElements.define`, and returns a reference for controlling it. */
    showCustom<TResult = unknown>(selector: string, data?: unknown, options?: CustomDialogOptions): CustomDialogRef<TResult>;
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

/** Options for creating a custom dialog. */
export interface CustomDialogOptions {
    /** Dialog title text, shown in the host chrome above the custom element. */
    readonly title?: string;
    /** Dialog width (CSS value, e.g. `'600px'`). */
    readonly width?: string;
    /** Dialog height (CSS value, e.g. `'400px'`). */
    readonly height?: string;
    /** Whether the dialog can be dismissed by clicking the backdrop or pressing Escape. Defaults to `false`. */
    readonly disableClose?: boolean;
}

/** Handle for controlling an open custom dialog. */
export interface CustomDialogRef<TResult = unknown> {
    /** Observable that emits the result once the dialog closes. */
    afterClosed(): ObservableLike<TResult | undefined>;
    /** Closes the dialog, optionally with a result. */
    close(result?: TResult): void;
}
