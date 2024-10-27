import { Message } from "src/types/gpt";

export default class GetConversationResponseModel {
  id: string;
  messages: Message[];

  constructor(id: string, messages: Message[]) {
    this.id = id;
    this.messages = messages;
  }
}
