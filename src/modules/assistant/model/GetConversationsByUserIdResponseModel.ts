import { SimplifiedConversation } from 'src/types/gpt';

export default class GetConversationsByUserIdResponseModel {
    conversations: SimplifiedConversation[];

    constructor(conversations: SimplifiedConversation[]) {
        this.conversations = conversations;
    }
}
