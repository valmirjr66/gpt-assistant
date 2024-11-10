import { Injectable } from '@nestjs/common';
import DummyConnector from 'src/handlers/drive/DummyConnector';
import BaseService from '../../BaseService';
import TriggerArtifactsScanRequestModel from './model/TriggerArtifactsScanRequestModel';

abstract class GenericFileMetadata {
    protected readonly type: 'pdf' | 'doc' | 'image' | 'video';
    protected readonly path: string;

    constructor(type: 'pdf' | 'doc' | 'image' | 'video', path: string) {
        this.type = type;
        this.path = path;
    }
}

class TextDocumentFile extends GenericFileMetadata {
    readonly summary: string;

    constructor(path: string, summary: string) {
        super('pdf', path);
        this.summary = summary;
    }
}

class VideoFile extends GenericFileMetadata {
    readonly description: string;
    readonly transcription: string;

    constructor(path: string, description: string, transcription: string) {
        super('video', path);
        this.description = description;
        this.transcription = transcription;
    }
}

@Injectable()
export default class ArtifactsService extends BaseService {
    private readonly driveConnector: DummyConnector = new DummyConnector();
    private readonly filesMetadata: GenericFileMetadata[];

    constructor() {
        super();
        this.filesMetadata = [];
    }

    async triggerArtifactsScan(): Promise<TriggerArtifactsScanRequestModel> {
        const filesPaths = await this.driveConnector.list();

        for (const filePath of filesPaths) {
            const fileExtension = filePath.split('.').pop();
            const fileContent = await this.driveConnector.readFile(filePath);

            if (fileExtension === 'mp4') {
                const videoDescription =
                    await this.getVideoDescription(fileContent);
                const videoTranscription =
                    await this.getVideoTranscription(fileContent);

                this.filesMetadata.push(
                    new VideoFile(
                        filePath,
                        videoDescription,
                        videoTranscription,
                    ),
                );
            } else if (fileExtension === 'txt') {
                const documentSummary = await this.getDocumentSummary(
                    fileContent.toString('binary'),
                );

                this.filesMetadata.push(
                    new TextDocumentFile(filePath, documentSummary),
                );
            } else {
                console.log(`Extension not implemented: ${fileExtension}`);
            }
        }

        return new TriggerArtifactsScanRequestModel();
    }

    async getDocumentSummary(documentContent: string): Promise<string> {
        console.log(`Document content length is: ${documentContent.length}`);
        return Promise.resolve('Fake summary');
    }

    async getVideoDescription(videoContent: Buffer): Promise<string> {
        console.log(`Video content length is: ${videoContent.length}`);
        return Promise.resolve('Fake description');
    }

    async getVideoTranscription(videoContent: Buffer): Promise<string> {
        console.log(`Video content length is: ${videoContent.length}`);
        return Promise.resolve('Fake transcription');
    }
}
