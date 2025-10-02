import { createContext } from "react";
import { UndoRedoState } from "./undo.redo.state";
import { createDevValueControl } from "../dev";

export const UndoRedoContext = createContext(new UndoRedoState(createDevValueControl({})))