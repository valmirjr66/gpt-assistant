import AbstractDocumentFile from './AbstractDocumentFile';

export default abstract class AbstractDocumentReader<
    T extends AbstractDocumentFile,
> {
    protected readonly fileDirectory: string;
    protected readonly fileNameWithExtension: string;
    protected readonly fileNameWithoutExtension: string;
    protected readonly fileExtension: string;

    constructor(protected filePath: string) {
        const splittedFilePath = filePath.split('/');

        this.fileDirectory = splittedFilePath.slice(0, -1).join('/');
        this.fileNameWithExtension = splittedFilePath.at(-1);

        const splittedFileName = this.fileNameWithExtension.split('.');

        this.fileNameWithoutExtension = splittedFileName.slice(0, -1).join('.');
        this.fileExtension = splittedFileName.at(-1);
    }

    abstract readFile(): Promise<T>;
}
