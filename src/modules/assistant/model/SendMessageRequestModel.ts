export default class SendMessageRequestModel {
    userId: string;
    content: string;
    conversationId: string;

    constructor(userId: string, content: string, conversationId: string) {
        this.userId = userId;
        this.content = content;
        this.conversationId = conversationId;
    }
}
