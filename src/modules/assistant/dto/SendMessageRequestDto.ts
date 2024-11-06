export default class SendMessageRequestDto {
    content: string;
    conversationId: string;

    constructor(content: string, conversationId: string) {
        this.content = content;
        this.conversationId = conversationId;
    }
}
