import { Module } from '@nestjs/common';
import BlobManager from './blob/BlobManager';
import AssistantController from './controller/AssistantController';
import TasksController from './controller/TasksController';
import AssistantService from './service/AssistantService';
import TasksService from './service/TasksService';

@Module({
  imports: [],
  controllers: [AssistantController, TasksController],
  providers: [BlobManager, AssistantService, TasksService],
})
export class AppModule {}
