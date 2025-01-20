import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
    FileMetadata,
    FileMetadataSchema,
} from './modules/assistant/schemas/FileMetadataSchema';
import ArtifactsController from './modules/embedding/ArtifactsController';
import ArtifactsService from './modules/embedding/ArtifactsService';

@Module({
    controllers: [ArtifactsController],
    providers: [ArtifactsService],
    imports: [
        MongooseModule.forFeature([
            { name: FileMetadata.name, schema: FileMetadataSchema },
        ]),
    ],
})
export class ArtifactsModule {}
