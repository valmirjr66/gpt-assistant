import { SimplifiedConversation } from 'src/types/gpt';

export default class GetConversationsByUserIdResponseDto {
    conversations: SimplifiedConversation[];

    constructor(conversations: SimplifiedConversation[]) {
        this.conversations = conversations;
    }
}
