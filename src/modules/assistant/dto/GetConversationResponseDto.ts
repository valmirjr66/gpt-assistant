import { Message } from '../schemas/MessageSchema';

export default class GetConversationResponseDto {
    id: string;
    title: string;
    messages: Message[];

    constructor(id: string, title: string, messages: Message[]) {
        this.id = id;
        this.title = title;
        this.messages = messages;
    }
}
