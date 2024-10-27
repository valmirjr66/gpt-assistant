type Role = 'system' | 'user' | 'assistant';

type Message = {
    id: string;
    conversationId: string;
    role: Role;
    content: string;
};

type Conversation = {
    id: string;
    messages: Message[];
};

export { Conversation, Message, Role };
