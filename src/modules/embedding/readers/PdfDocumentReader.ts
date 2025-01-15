import fs from 'fs';
import AbstractDocumentReader from './AbstractDocumentReader';
import PdfDocumentFile from './PdfDocumentFile';

export default class PdfDocumentReader extends AbstractDocumentReader<PdfDocumentFile> {
    constructor(filePath: string) {
        super(filePath);
    }

    async readFile() {
        const fileBuffer = await fs.promises.readFile(this.filePath);
        const pdfPreviewFilePath = `${this.fileDirectory}/${this.fileNameWithoutExtension}.preview.png`;
        const pdfHasPreview = fs.existsSync(pdfPreviewFilePath);

        if (pdfHasPreview) {
            const previewImage = await fs.promises.readFile(pdfPreviewFilePath);

            return new PdfDocumentFile(
                this.fileNameWithExtension,
                fileBuffer,
                previewImage,
            );
        } else {
            return new PdfDocumentFile(this.fileNameWithExtension, fileBuffer);
        }
    }
}
