import { ObservableLike } from "../reactive";

export interface AiChatService {
    startThread(systemPrompt: string): ObservableLike<AiChatThread>;
}

export interface AiChatThread {
    readonly messages$: ObservableLike<readonly AiChatMessage[]>;

    sendMessage(userPrompt: string): ObservableLike<this>;
    regenerateAnswer(): ObservableLike<this>;
    delete(timeoutMs: number): ObservableLike<this>;
}

export interface AiChatMessage {
    readonly role: AiChatMessageRole;
    readonly content: string;
    readonly name: string | null | undefined;
}

export enum AiChatMessageRole {
    user = 0,
    assistant = 1,
    system = 2,
}
