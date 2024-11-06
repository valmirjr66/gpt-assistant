export default class SendMessageRequestModel {
    content: string;
    conversationId: string;

    constructor(content: string, conversationId: string) {
        this.content = content;
        this.conversationId = conversationId;
    }
}
