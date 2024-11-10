import { Module } from '@nestjs/common';
import ArtifactsController from './modules/artifacts/ArtifactsController';
import ArtifactsService from './modules/artifacts/ArtifactsService';

@Module({
    controllers: [ArtifactsController],
    providers: [ArtifactsService],
})
export class ArtifactsModule {}
