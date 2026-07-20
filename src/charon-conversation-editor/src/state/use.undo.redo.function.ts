import { useContext, useEffect, useState } from "react";
import { UndoRedoContext } from "./undo.redo.context";

export interface UseUndoRedoResult {
    canUndo: boolean;
    canRedo: boolean;
    undo: () => void;
    redo: () => void;
    barrier: () => void;
}

/**
 * Custom hook to read and react to the host UndoRedoService's state
 * Re-renders when the service reports a state change; degrades to disabled no-ops when the
 * host didn't provide an undoRedo service at all (documentControl.services is Partial).
 *
 * @example
 * const { canUndo, undo } = useUndoRedo();
 *
 * <button disabled={!canUndo} onClick={undo}>Undo</button>
 */
export function useUndoRedo(): UseUndoRedoResult {
    const service = useContext(UndoRedoContext);

    const [, mutateState] = useState(0);
    useEffect(() => {
        if (!service) {
            return;
        }
        const subscription = service.stateChange.subscribe({
            next: () => mutateState(old => old + 1) // force re-render when canUndo/canRedo change, counter value is not used, only used to trigger re-render
        });
        return subscription.unsubscribe.bind(subscription);

    }, [service])

    return {
        canUndo: service?.canUndo ?? false,
        canRedo: service?.canRedo ?? false,
        undo: () => service?.undo(),
        redo: () => service?.redo(),
        barrier: () => service?.barrier(),
    };
}
