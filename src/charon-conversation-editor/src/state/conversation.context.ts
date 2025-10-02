import { createContext } from "react";
import { createDevValueControl } from "../dev";
import { ConversationState } from "./conversation.state";

export const ConversationContext = createContext(new ConversationState(createDevValueControl({})))