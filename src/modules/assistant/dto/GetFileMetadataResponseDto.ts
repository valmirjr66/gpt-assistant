import { FileMetadata } from 'src/types/gpt';

export default class GetFileMetadataResponseDto {
    fileMetadata: FileMetadata;

    constructor(fileMetadata: FileMetadata) {
        this.fileMetadata = fileMetadata;
    }
}
