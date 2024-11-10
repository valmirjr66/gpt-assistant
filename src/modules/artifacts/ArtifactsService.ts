import { Injectable } from '@nestjs/common';
import DummyConnector from 'src/handlers/drive/DummyConnector';
import BaseService from '../../BaseService';
import TriggerArtifactsScanRequestModel from './model/TriggerArtifactsScanRequestModel';

@Injectable()
export default class ArtifactsService extends BaseService {
    private readonly driveConnector: DummyConnector = new DummyConnector();

    constructor() {
        super();
    }

    async triggerArtifactsScan(): Promise<TriggerArtifactsScanRequestModel> {
        const files = this.driveConnector.list();

        for (const file of files) {
            const fileContent = this.driveConnector.readFile(file);
            console.log(fileContent);
        }

        return new TriggerArtifactsScanRequestModel();
    }
}
