import { ObservableLike } from "../reactive";

/** Service for managing undo/redo history of the current document editor. */
export interface UndoRedoService {
    /** Emits when the undo/redo state changes (e.g., after push, undo, redo, or clear). */
    readonly stateChange: ObservableLike<void>

    /** Whether there are actions available to undo. */
    readonly canUndo: boolean;
    /** Whether there are actions available to redo. */
    readonly canRedo: boolean;

    /** Undoes the most recent action (or batch of actions). */
    undo(): void;
    /** Redoes the most recently undone action (or batch of actions). */
    redo(): void;

    /**
     * Pushes an undoable action onto the history stack.
     * @param action.redo - Function to apply the change.
     * @param action.undo - Function to reverse the change.
     * @param action.batchGroup - Optional group name for combining similar actions (e.g., "typing"). Actions with the same group name pushed in quick succession are combined into a single undo/redo unit.
     * @param action.allowBatching - Whether this action can be batched with adjacent actions in the same group. Defaults to true when batchGroup is set.
     */
    push(action: { redo: () => void; undo: () => void; batchGroup?: string; allowBatching?: boolean }): void;
    /** Clears all undo/redo history. */
    clear(): void;
}
