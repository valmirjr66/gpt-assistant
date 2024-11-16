import { FileMetadata } from 'src/types/gpt';

export default class GetFileMetadataResponseModel {
    fileMetadata: FileMetadata;

    constructor(fileMetadata: FileMetadata) {
        this.fileMetadata = fileMetadata;
    }
}
