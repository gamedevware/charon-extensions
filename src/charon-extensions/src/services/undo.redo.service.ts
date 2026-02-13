import { ObservableLike } from "../reactive";

export interface UndoRedoService {
    readonly stateChange: ObservableLike<void>

    readonly canUndo: boolean;
    readonly canRedo: boolean;

    undo(): void;
    redo(): void;

    push(action: { redo: () => void; undo: () => void; batchGroup?: string; allowBatching?: boolean }): void;
    clear(): void;
}