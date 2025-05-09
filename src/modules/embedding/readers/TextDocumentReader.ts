import fs from 'fs';
import AbstractDocumentReader from './AbstractDocumentReader';
import TxtDocumentFile from './TxtDocumentFile';

export default class TextDocumentReader extends AbstractDocumentReader<TxtDocumentFile> {
    constructor(filePath: string) {
        super(filePath);
    }

    async readFile() {
        const fileBuffer = await fs.promises.readFile(this.filePath);
        return new TxtDocumentFile(this.fileNameWithExtension, fileBuffer);
    }
}
