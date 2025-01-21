import { ConversationStatus } from 'src/types/gpt';

export default class ConversationHandshakeResponseModel {
    constructor(public status: ConversationStatus) {}
}
