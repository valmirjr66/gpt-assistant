type Role = 'system' | 'user' | 'assistant' | 'tool';

type ToolCall = {
    id: string;
    functionName: string;
    functionArguments: string;
};

type Message = {
    id: string;
    conversationId: string;
    role: Role;
    content?: string;
    toolCall?: ToolCall;
};

type Conversation = {
    id: string;
    messages: Message[];
};

export { Conversation, Message, Role };
