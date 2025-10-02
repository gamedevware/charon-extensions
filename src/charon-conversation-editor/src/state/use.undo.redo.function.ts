import { useContext, useEffect, useState } from "react";
import { UndoRedoContext } from "./undo.redo.context";
import { ConversationTree } from "../models";
import { UndoRedoState } from "./undo.redo.state";

/**
 * Custom hook to access and react to UndoRedoState changes in React components
 * Provides the current UndoRedoState instance and forces re-renders on state changes
 * 
 * @returns {UndoRedoState<ConversationTree>} The current UndoRedoState instance for conversation trees
 * 
 * @example
 * const undoRedo = useUndoRedo();
 * 
 * // Enable/disable buttons based on undo/redo availability
 * <button disabled={!undoRedo.canUndo} onClick={undoRedo.undo}>
 *   Undo
 * </button>
 * <button disabled={!undoRedo.canRedo} onClick={undoRedo.redo}>
 *   Redo
 * </button>
 */
export function useUndoRedo(): UndoRedoState<ConversationTree> {
    const undoRedoState = useContext(UndoRedoContext);

    const [, mutateState] = useState(0);
    useEffect(() => {
        const subscription = undoRedoState.stateChange.subscribe({
            next: () => mutateState(old => old + 1) // force re-render when undoRedoState.canUndo, or undoRedoState.canRedo change, counter calue is not used, only used to trigger re-render
        });
        return subscription.unsubscribe.bind(subscription);

    }, [undoRedoState])

    return undoRedoState;
}