import { ConversationStatus } from 'src/types/gpt';

export default class ConversationHandshakeResponseModel {
    status: ConversationStatus;

    constructor(status: ConversationStatus) {
        this.status = status;
    }
}
