import { FileMetadata } from '../schemas/FileMetadataSchema';
import { Message } from '../schemas/MessageSchema';

export default class GetConversationResponseModel {
    id: string;
    title: string;
    messages: Message[];
    references: FileMetadata[];

    constructor(
        id: string,
        title: string,
        messages: Message[],
        references: FileMetadata[],
    ) {
        this.id = id;
        this.title = title;
        this.messages = messages;
        this.references = references;
    }
}
