export default class InsertMessageRequestDto {
    content: string;
    conversationId: string;

    constructor(content: string, conversationId: string) {
        this.content = content;
        this.conversationId = conversationId;
    }
}
