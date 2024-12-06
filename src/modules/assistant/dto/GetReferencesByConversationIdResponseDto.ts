import { FileMetadata } from '../schemas/FileMetadataSchema';

export default class GetReferencesByConversationIdResponseDto {
    references: FileMetadata[];

    constructor(references: FileMetadata[]) {
        this.references = references;
    }
}
