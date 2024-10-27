import { Module } from '@nestjs/common';
import AssistantController from './controller/AssistantController';
import TasksController from './controller/TasksController';
import TaskCategoryIdExistValidator from './dto/validator/TaskCategoryIdExistValidator';
import AssistantService from './service/AssistantService';
import TasksService from './service/TasksService';

@Module({
    imports: [],
    controllers: [AssistantController, TasksController],
    providers: [AssistantService, TasksService, TaskCategoryIdExistValidator],
})
export class AppModule {}
