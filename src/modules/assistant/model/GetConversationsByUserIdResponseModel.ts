import { SimplifiedConversation } from 'src/types/gpt';

export default class GetConversationsByUserIdResponseModel {
    constructor(public conversations: SimplifiedConversation[]) {}
}
