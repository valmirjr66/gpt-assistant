export type Role = 'system' | 'user' | 'assistant' | 'tool';
export type ActionType = 'positive' | 'negative';

export type ToolCall = {
    id: string;
    functionName: string;
    functionArguments: string;
};

export type Action = {
    type: ActionType;
    feedbackResponse: string;
    chosen: boolean;
};

export type Message = {
    id: string;
    conversationId: string;
    role: Role;
    content?: string;
    toolCall?: ToolCall;
    actions: Action[];
};

export type Conversation = {
    id: string;
    messages: Message[];
};

export type Annotation = {
    start_index: number;
    end_index: number;
    file_citation: { file_id: string };
    text: string;
    downloadURL?: string;
    displayName: string;
};

export type FileMetadata = {
    id: string;
    filename: string;
    // The size of the file, in bytes
    bytes: number;
    created_at: number;
    downloadURL?: string;
};
