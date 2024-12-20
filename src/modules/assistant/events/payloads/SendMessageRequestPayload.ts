export default class SendMessageRequestPayload {
    conversationId: string;
    content: string;

    constructor(conversationId: string, content: string) {
        this.conversationId = conversationId;
        this.content = content;
    }
}
