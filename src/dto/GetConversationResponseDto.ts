import { Message } from "src/types/gpt";

export default class GetConversationResponseDto {
  id: string;
  messages: Message[];

  constructor(id: string, messages: Message[]) {
    this.id = id;
    this.messages = messages;
  }
}
