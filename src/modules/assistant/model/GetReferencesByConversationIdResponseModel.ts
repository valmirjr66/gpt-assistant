import { FileMetadata } from '../schemas/FileMetadataSchema';

export default class GetReferencesByConversationIdResponseModel {
    constructor(public references: FileMetadata[]) {}
}
