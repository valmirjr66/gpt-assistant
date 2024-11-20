import { Message, Reference } from 'src/types/gpt';

export default class GetConversationResponseDto {
    id: string;
    messages: Message[];
    references: Reference[];

    constructor(id: string, messages: Message[], references: Reference[]) {
        this.id = id;
        this.messages = messages;
        this.references = references;
    }
}
