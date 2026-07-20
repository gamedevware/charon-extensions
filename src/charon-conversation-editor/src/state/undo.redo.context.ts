import { createContext } from "react";
import { UndoRedoService } from "charon-extensions";

/** The host-provided undo/redo service for the current document, or undefined if the host didn't provide one. */
export const UndoRedoContext = createContext<UndoRedoService | undefined>(undefined);
