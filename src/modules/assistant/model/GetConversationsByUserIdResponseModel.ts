import { Conversation } from 'src/types/gpt';

export default class GetConversationsByUserIdResponseModel {
    conversations: Omit<Conversation, 'messages'>[];

    constructor(conversations: Omit<Conversation, 'messages'>[]) {
        this.conversations = conversations;
    }
}
