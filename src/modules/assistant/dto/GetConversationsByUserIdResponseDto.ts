import { SimplifiedConversation } from 'src/types/gpt';

export default class GetConversationsByUserIdResponseDto {
    constructor(public conversations: SimplifiedConversation[]) {}
}
