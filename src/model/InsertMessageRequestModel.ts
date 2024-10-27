export default class InsertMessageRequestModel {
  content: string;
  conversationId: string;

  constructor(content: string, conversationId: string) {
    this.content = content;
    this.conversationId = conversationId;
  }
}
