import { Role } from 'src/types/gpt';
import { FileMetadata } from '../schemas/FileMetadataSchema';

export default class SendMessageResponseDto {
    id: string;
    content: string;
    role: Role;
    conversationId: string;
    conversationTitle: string;
    references: FileMetadata[];

    constructor(
        id: string,
        content: string,
        role: Role,
        conversationId: string,
        conversationTitle: string,
        references: FileMetadata[] = [],
    ) {
        this.id = id;
        this.content = content;
        this.role = role;
        this.conversationId = conversationId;
        this.conversationTitle = conversationTitle;
        this.references = references;
    }
}
