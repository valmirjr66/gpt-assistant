export default abstract class AbstractDocumentFile {
    constructor(
        public fileName: string,
        public fileBuffer: Buffer,
    ) {}
}
