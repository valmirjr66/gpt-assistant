type Role = 'system' | 'user' | 'assistant' | 'tool';

type Message = {
    id: string;
    conversationId: string;
    role: Role;
    content: string;
    toolCallId?: string;
};

type Conversation = {
    id: string;
    messages: Message[];
};

export { Conversation, Message, Role };
