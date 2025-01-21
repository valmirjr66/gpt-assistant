import { Role } from 'src/types/gpt';
import { FileMetadata } from '../schemas/FileMetadataSchema';

export default class SendMessageResponseDto {
    constructor(
        public id: string,
        public content: string,
        public role: Role,
        public conversationId: string,
        public conversationTitle: string,
        public references: FileMetadata[] = [],
    ) {}
}
