export default class ConversationHandshakeRequestPayload {
    conversationId: string;

    constructor(conversationId: string) {
        this.conversationId = conversationId;
    }
}
