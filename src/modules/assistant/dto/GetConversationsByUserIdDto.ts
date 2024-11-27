import { Conversation } from 'src/types/gpt';

export default class GetConversationsByUserIdDto {
    conversations: Omit<Conversation, 'messages'>[];

    constructor(conversations: Omit<Conversation, 'messages'>[]) {
        this.conversations = conversations;
    }
}
