import AbstractDocumentFile from './AbstractDocumentFile';

export default class TxtDocumentFile extends AbstractDocumentFile {
    constructor(fileName: string, fileBuffer: Buffer) {
        super(fileName, fileBuffer);
    }
}
