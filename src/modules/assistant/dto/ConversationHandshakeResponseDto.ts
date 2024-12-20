import { ConversationStatus } from 'src/types/gpt';

export default class ConversationHandshakeResponseDto {
    status: ConversationStatus;

    constructor(status: ConversationStatus) {
        this.status = status;
    }
}
