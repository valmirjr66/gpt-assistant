import { ConversationStatus } from 'src/types/gpt';

export default class ConversationHandshakeResponseDto {
    constructor(public status: ConversationStatus) {}
}
