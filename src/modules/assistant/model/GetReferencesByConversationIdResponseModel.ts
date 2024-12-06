import { FileMetadata } from '../schemas/FileMetadataSchema';

export default class GetReferencesByConversationIdResponseModel {
    references: FileMetadata[];

    constructor(references: FileMetadata[]) {
        this.references = references;
    }
}
