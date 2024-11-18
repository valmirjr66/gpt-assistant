import { Message } from 'src/types/gpt';

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
