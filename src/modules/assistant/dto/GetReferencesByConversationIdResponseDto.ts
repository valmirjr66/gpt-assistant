import { FileMetadata } from '../schemas/FileMetadataSchema';

export default class GetReferencesByConversationIdResponseDto {
    constructor(public references: FileMetadata[]) {}
}
