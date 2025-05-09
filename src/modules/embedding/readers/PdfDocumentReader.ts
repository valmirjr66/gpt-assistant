import fs from 'fs';
import AbstractDocumentReader from './AbstractDocumentReader';
import PdfDocumentFile from './PdfDocumentFile';

export default class PdfDocumentReader extends AbstractDocumentReader<PdfDocumentFile> {
    constructor(filePath: string) {
        super(filePath);
    }

    async readFile() {
        const fileBuffer = await fs.promises.readFile(this.filePath);
        const pdfPreviewFileName = `${this.fileNameWithoutExtension}.preview.png`;
        const pdfPreviewFilePath = `${this.fileDirectory}/${pdfPreviewFileName}`;
        const pdfHasPreview = fs.existsSync(pdfPreviewFilePath);

        if (pdfHasPreview) {
            const previewImage = await fs.promises.readFile(pdfPreviewFilePath);

            return new PdfDocumentFile(
                this.fileNameWithExtension,
                fileBuffer,
                `${this.fileNameWithoutExtension}.preview.png`,
                previewImage,
            );
        } else {
            return new PdfDocumentFile(this.fileNameWithExtension, fileBuffer);
        }
    }
}
