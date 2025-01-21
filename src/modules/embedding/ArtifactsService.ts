import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import BlobManagerFactory from 'src/handlers/blob/BlobManagerFactory';
import BlobManagerInterface from 'src/handlers/blob/BlobManagerInterface';
import SimpleAgent from 'src/handlers/gpt/SimpleAgent';
import VectorDatabaseHandler from 'src/handlers/vector_database/VectorDatabaseHandler';
import { v4 as uuidv4 } from 'uuid';
import BaseService from '../../BaseService';
import ProcessArtifactRequestModel from '../assistant/model/ProcessArtifactRequestModel';
import { FileMetadata } from '../assistant/schemas/FileMetadataSchema';

@Injectable()
export default class ArtifactsService extends BaseService {
    private readonly INDEX_NAME = process.env.INDEX_NAME;

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

    async processArtifact(model: ProcessArtifactRequestModel): Promise<void> {
        const fileName = model.file.originalname;
        const fileId = uuidv4();

        if (model.filePreviewImage) {
            const filePreviewImageName = `${fileName}.preview.png`;

            await this.blobManager.write(
                `pdf_previews/${filePreviewImageName}`,
                model.filePreviewImage.buffer,
            );

            await this.fileMetadataModel.create({
                _id: fileId,
                previewImageURL: `https://storage.googleapis.com/pdf_previews/${filePreviewImageName}`,
                displayName: fileName,
                downloadURL: 'http://fake-url.com',
            });
        } else {
            await this.fileMetadataModel.create({
                _id: fileId,
                displayName: fileName,
                downloadURL: 'http://fake-url.com',
            });
        }

        await this.vectorBaseHandler.processFile(
            fileId,
            fileName,
            model.file.buffer,
        );
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
