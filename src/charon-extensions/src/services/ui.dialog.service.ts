import { ObservableLike } from "../reactive";

/** Service for showing modal dialogs in the Charon UI. */
export interface UiDialogService {
    /** Opens a progress dialog and returns a reference for controlling it. */
    showProgress(options: ProgressDialogOptions): ProgressDialogRef;
    /** Opens a dialog hosting a custom element the extension itself registered via `customElements.define`, and returns a reference for controlling it. */
    showCustom<TResult = unknown>(selector: string, data?: unknown, options?: CustomDialogOptions): CustomDialogRef<TResult>;
    /** Opens a read-only code-snippet viewer dialog (with copy-to-clipboard). Resolves when the dialog closes. */
    showCodeSnippet(data: CodeSnippetOptions): Promise<boolean>;
    /** Opens the backup wizard for the current game data source. Resolves `true` if the backup completed, `false` if cancelled. */
    showBackupWizard(options?: BackupWizardOptions): Promise<boolean>;
    /** Opens the wizard for exporting localization (translation) data. Resolves `true` if the export completed, `false` if cancelled. */
    showExportLocalizationWizard(options?: ExportLocalizationWizardOptions): Promise<boolean>;
    /** Opens the wizard for exporting game data. Resolves `true` if the export completed, `false` if cancelled. */
    showExportWizard(options?: ExportWizardOptions): Promise<boolean>;
    /** Opens the wizard for importing localization (translation) data. Resolves `true` if the import completed, `false` if cancelled. */
    showImportLocalizationWizard(options?: ImportLocalizationWizardOptions): Promise<boolean>;
    /** Opens the wizard for importing game data. Resolves `true` if the import completed, `false` if cancelled. */
    showImportWizard(options?: ImportWizardOptions): Promise<boolean>;
    /** Opens the wizard for publishing a formatted publication build of the game data. Resolves `true` if publishing completed, `false` if cancelled. */
    showPublicationWizard(options?: PublicationWizardOptions): Promise<boolean>;
    /** Opens the wizard for restoring a game data source from a backup. Resolves `true` if the restore completed, `false` if cancelled. */
    showRestoreWizard(options?: RestoreWizardOptions): Promise<boolean>;
    /** Opens the wizard for generating client source code bindings for the game data. Resolves `true` if generation completed, `false` if cancelled. */
    showSourceCodeGenerationWizard(options?: SourceCodeGenerationWizardOptions): Promise<boolean>;
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

/** Options for {@link UiDialogService.showCodeSnippet}. */
export interface CodeSnippetOptions {
    /** The source code text to display. */
    sourceCode: string;
}

/** Options for {@link UiDialogService.showBackupWizard}. */
export interface BackupWizardOptions {
    /** Whether to pre-fill the wizard from the user's previously saved preferences. Defaults to `true`. */
    loadPreferences?: boolean;
    /** Whether to save the user's choices in this run as their preferences for next time. Defaults to `true`. */
    savePreferences?: boolean;
}

/** Options for {@link UiDialogService.showExportLocalizationWizard}. */
export interface ExportLocalizationWizardOptions {
    /** Name of the schema to pre-select, if any. */
    schemaName?: string;
    /** Whether to pre-fill the wizard from the user's previously saved preferences. Defaults to `true`. */
    loadPreferences?: boolean;
    /** Whether to save the user's choices in this run as their preferences for next time. Defaults to `true`. */
    savePreferences?: boolean;
}

/** Options for {@link UiDialogService.showExportWizard}. */
export interface ExportWizardOptions {
    /** Name of the schema to pre-select, if any. */
    schemaName?: string;
    /** Export file format to pre-select, if any. */
    format?: 'json' | 'xml' | 'msgpack' | 'bson' | 'xliff1' | 'xliff' | 'xliff2' | 'xlf' | 'xlsx';
    /** Whether to pre-fill the wizard from the user's previously saved preferences. Defaults to `true`. */
    loadPreferences?: boolean;
    /** Whether to save the user's choices in this run as their preferences for next time. Defaults to `true`. */
    savePreferences?: boolean;
}

/** Options for {@link UiDialogService.showImportLocalizationWizard}. */
export interface ImportLocalizationWizardOptions {
    /** Name of the schema to pre-select, if any. */
    schemaName?: string;
    /** Whether to pre-fill the wizard from the user's previously saved preferences. Defaults to `true`. */
    loadPreferences?: boolean;
    /** Whether to save the user's choices in this run as their preferences for next time. Defaults to `true`. */
    savePreferences?: boolean;
}

/** Options for {@link UiDialogService.showImportWizard}. */
export interface ImportWizardOptions {
    /** Name of the schema to pre-select, if any. */
    schemaName?: string;
    /** File to pre-load as the import source, if any. */
    inputFile?: File;
    /** Text to pre-load as the import source, if any (alternative to `inputFile`). */
    inputText?: string;
    /** Whether to pre-fill the wizard from the user's previously saved preferences. Defaults to `true`. */
    loadPreferences?: boolean;
    /** Whether to save the user's choices in this run as their preferences for next time. Defaults to `true`. */
    savePreferences?: boolean;
}

/** Options for {@link UiDialogService.showPublicationWizard}. */
export interface PublicationWizardOptions {
    /** Whether to pre-fill the wizard from the user's previously saved preferences. Defaults to `true`. */
    loadPreferences?: boolean;
    /** Whether to save the user's choices in this run as their preferences for next time. Defaults to `true`. */
    savePreferences?: boolean;
}

/** Options for {@link UiDialogService.showRestoreWizard}. */
export interface RestoreWizardOptions {
    /** Whether to pre-fill the wizard from the user's previously saved preferences. Defaults to `true`. */
    loadPreferences?: boolean;
    /** Whether to save the user's choices in this run as their preferences for next time. Defaults to `true`. */
    savePreferences?: boolean;
}

/** Options for {@link UiDialogService.showSourceCodeGenerationWizard}. */
export interface SourceCodeGenerationWizardOptions {
    /** Whether to pre-fill the wizard from the user's previously saved preferences. Defaults to `true`. */
    loadPreferences?: boolean;
    /** Whether to save the user's choices in this run as their preferences for next time. Defaults to `true`. */
    savePreferences?: boolean;
}
