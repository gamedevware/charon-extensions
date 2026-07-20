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

    /**
     * Marks a hard boundary in the undo/redo history: the next auto-tracked or pushed change
     * will always start a new undo step, even if it would otherwise be merged into the current
     * top-of-stack entry by the service's default time-based auto-batching (e.g. several rapid
     * edits within the same short window normally coalesce into one step). Has no effect on
     * changes already recorded — it only affects the next one. Safe to call at any time,
     * including when the history is empty.
     */
    barrier(): void;

    /** Clears all undo/redo history. */
    clear(): void;
}
