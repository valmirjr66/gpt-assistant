import AbstractDocumentFile from './AbstractDocumentFile';

export default class PdfDocumentFile extends AbstractDocumentFile {
    constructor(
        fileName: string,
        fileBuffer: Buffer,
        public previewImageName?: string,
        public previewImageBuffer?: Buffer,
    ) {
        super(fileName, fileBuffer);
    }
}
