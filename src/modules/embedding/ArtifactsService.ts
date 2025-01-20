import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import fs from 'fs';
import { Model } from 'mongoose';
import BlobManagerFactory from 'src/handlers/blob/BlobManagerFactory';
import BlobManagerInterface from 'src/handlers/blob/BlobManagerInterface';
import SimpleAgent from 'src/handlers/gpt/SimpleAgent';
import VectorDatabaseHandler from 'src/handlers/vector_database/VectorDatabaseHandler';
import { v4 as uuidv4 } from 'uuid';
import BaseService from '../../BaseService';
import { FileMetadata } from '../assistant/schemas/FileMetadataSchema';
import PdfDocumentReader from './readers/PdfDocumentReader';
import TextDocumentReader from './readers/TextDocumentReader';

@Injectable()
export default class ArtifactsService extends BaseService {
    private readonly FILES_DIRECTORY = './storage';
    private readonly PDF_FILE_EXTENSION = 'pdf';
    private readonly TXT_FILE_EXTENSION = 'txt';
    private readonly INDEX_NAME = 'main-index';

    private readonly blobManager: BlobManagerInterface;
    private readonly vectorBaseHandler: VectorDatabaseHandler;

    constructor(
        @InjectModel(FileMetadata.name)
        private readonly fileMetadataModel: Model<FileMetadata>,
    ) {
        super();
        this.blobManager = BlobManagerFactory.createManager();
        this.vectorBaseHandler = new VectorDatabaseHandler(this.INDEX_NAME);
    }

    async processFile(): Promise<void> {
        const fileNames = await fs.promises.readdir(this.FILES_DIRECTORY);

        const filteredFileNames = fileNames.filter(
            (item) =>
                item.endsWith(this.PDF_FILE_EXTENSION) ||
                item.endsWith(this.TXT_FILE_EXTENSION),
        );

        for (const fileName of filteredFileNames) {
            const fileExtension = fileName.split('.').pop();
            const filePath = `${this.FILES_DIRECTORY}/${fileName}`;
            const fileId = uuidv4();

            if (fileExtension === this.PDF_FILE_EXTENSION) {
                const docFile = await new PdfDocumentReader(
                    filePath,
                ).readFile();

                await this.blobManager.write(
                    `pdf_previews/${docFile.previewImageName}`,
                    docFile.previewImageBuffer,
                );

                await this.fileMetadataModel.create({
                    _id: fileId,
                    previewImageURL: `https://storage.googleapis.com/pdf_previews/${docFile.previewImageName}`,
                    displayName: docFile.fileName,
                    downloadURL: 'teste-pdf',
                });

                await this.vectorBaseHandler.processFile(
                    fileId,
                    docFile.fileName,
                    docFile.fileBuffer,
                );
            } else if (fileExtension === this.TXT_FILE_EXTENSION) {
                const docFile = await new TextDocumentReader(
                    filePath,
                ).readFile();

                await this.fileMetadataModel.create({
                    _id: fileId,
                    displayName: docFile.fileName,
                    downloadURL: 'teste-txt',
                });

                await this.vectorBaseHandler.processFile(
                    fileId,
                    docFile.fileName,
                    docFile.fileBuffer,
                );
            }
        }
    }

    async queryDatabase(query: string): Promise<string> {
        const queryMatches = await this.vectorBaseHandler.queryDatabase(query);

        const concatenatedQueryMatches = queryMatches
            .map((match) => match.content)
            .join('\n');

        const augmentedPrompt = `Using the following information, answer the prompt at end: ${concatenatedQueryMatches}
        \n========================\n
        ${query}`;

        const completion = await new SimpleAgent(
            `You are a helpful assistant created to answer question based on RAG retrieval.`,
        ).createCompletion(augmentedPrompt);

        return completion;
    }
}
