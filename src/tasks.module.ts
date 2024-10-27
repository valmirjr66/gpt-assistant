import { Module } from '@nestjs/common';
import TaskCategoryIdExistValidator from './modules/tasks/dto/validator/TaskCategoryIdExistValidator';
import TasksController from './modules/tasks/TasksController';
import TasksService from './modules/tasks/TasksService';
import BlobManagerFactory from './handlers/blob/BlobManagerFactory';

@Module({
    controllers: [TasksController],
    providers: [TasksService, TaskCategoryIdExistValidator, BlobManagerFactory],
})
export class TasksModule {}
