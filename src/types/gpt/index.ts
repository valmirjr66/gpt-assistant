import { Conversation } from 'src/modules/assistant/schemas/ConversationSchema';

export type Role = 'system' | 'user' | 'assistant' | 'tool';

export type Annotation = {
    start_index: number;
    end_index: number;
    file_citation: { file_id: string };
    text: string;
    downloadURL?: string;
    displayName?: string;
};

export type SimplifiedConversation = Omit<
    Conversation,
    'messages' | 'references' | 'threadId' | 'userId'
>;
