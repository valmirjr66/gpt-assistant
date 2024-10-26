import MessageDto from './MessageDto';

export default class ConversationDto {
  id: string;
  messages: MessageDto[];

  constructor(id: string, messages: MessageDto[]) {
    this.id = id;
    this.messages = messages;
  }
}
