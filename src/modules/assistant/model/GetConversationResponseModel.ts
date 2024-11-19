import { Message } from 'src/types/gpt';

export default class GetConversationResponseModel {
    id: string;
    messages: Message[];
    assistantIsWriting: boolean;

    constructor(id: string, messages: Message[], assistantIsWriting: boolean) {
        this.id = id;
        this.messages = messages;
        this.assistantIsWriting = assistantIsWriting;
    }
}
