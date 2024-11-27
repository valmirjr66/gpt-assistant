import { Conversation } from 'src/types/gpt';

export default class GetConversationsByUserIdModel {
    conversations: Omit<Conversation, 'messages'>[];

    constructor(conversations: Omit<Conversation, 'messages'>[]) {
        this.conversations = conversations;
    }
}
