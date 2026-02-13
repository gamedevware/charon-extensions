export interface UiDialogService {
    showProgress(options: ProgressDialogOptions): ProgressDialogRef;
}

export interface ProgressDialogOptions {
    readonly title: string;
    readonly progressMode: 'determinate' | 'indeterminate' | 'buffer' | 'query';
    readonly cancellable: boolean;
    readonly closedHandler: (cancelled: boolean) => void;
}

export interface ProgressDialogRef {

    update(progress: number, progressMessage?: string, color?: string): void;
    setFaulted(): void;
    close(delayTimeMs?: number): void;
}