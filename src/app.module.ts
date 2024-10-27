import { Module } from '@nestjs/common';
import BlobManager from './blob/BlobManager';
import AssistantController from './controller/AssistantController';
import AssistantService from './service/AssistantService';

@Module({
  imports: [],
  controllers: [AssistantController],
  providers: [
    BlobManager,
    AssistantService,
  ]
})
export class AppModule {}
