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
     * Records an undoable action onto the history stack.
     * @param action.redo - Function to apply the change.
     * @param action.undo - Function to reverse the change.
     * @param batcher - Optional function to coalesce the incoming action with the current top of the undo stack.
     *   Receives `prev` (the top entry) and `elapsedMs` (time since `prev` was pushed).
     *   Return `prev` by reference to replace the top entry with the merged result (e.g., to batch rapid edits into one undo step).
     *   Return any other object to push the incoming action as a new, separate undo step.
     *   Not called when the undo stack is empty.
     */
    push(action: { redo: () => void; undo: () => void }, batcher?: (prev: typeof action, elapsedMs: number) => typeof action): void;

    /** Clears all undo/redo history. */
    clear(): void;
}
