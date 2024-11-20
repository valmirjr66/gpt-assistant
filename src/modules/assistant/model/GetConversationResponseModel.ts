import { Message, Reference } from 'src/types/gpt';

export default class GetConversationResponseModel {
    id: string;
    title: string;
    messages: Message[];
    references: Reference[];

    constructor(
        id: string,
        title: string,
        messages: Message[],
        references: Reference[],
    ) {
        this.id = id;
        this.title = title;
        this.messages = messages;
        this.references = references;
    }
}
