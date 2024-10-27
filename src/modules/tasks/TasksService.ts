import { Injectable } from '@nestjs/common';
import BlobManagerFactory from 'src/handlers/blob/BlobManagerFactory';
import BlobManagerInterface from 'src/handlers/blob/BlobManagerInterface';
import GetTasksResponseModel from 'src/modules/tasks/model/GetTasksResponseModel';
import InsertTaskRequestModel from 'src/modules/tasks/model/InsertTaskRequestModel';
import InsertTaskResponseModel from 'src/modules/tasks/model/InsertTaskResponseModel';
import { TaskCategory } from 'src/types/tasks';
import BaseService from '../../BaseService';

@Injectable()
export default class TasksService extends BaseService {
    private readonly blobManager: BlobManagerInterface =
        BlobManagerFactory.createManager();

    constructor() {
        super();
    }

    async getTasks(): Promise<GetTasksResponseModel> {
        const memoryBuffer = await this.blobManager.read('memory.json');
        const memoryStr = memoryBuffer.toString('binary');
        const memory = JSON.parse(memoryStr);

        const tasks: TaskCategory[] = [];

        for (const key in memory.tasks) {
            tasks.push({
                id: key,
                description: memory.tasks[key].description,
                items: memory.tasks[key].items,
            });
        }

        return new GetTasksResponseModel(tasks);
    }

    async insertTask(
        model: InsertTaskRequestModel,
    ): Promise<InsertTaskResponseModel> {
        const memoryBuffer = await this.blobManager.read('memory.json');
        const memoryStr = memoryBuffer.toString('binary');
        const memory = JSON.parse(memoryStr);

        memory.tasks[model.categoryId].items.push(model.task);

        await this.blobManager.write(
            'memory.json',
            Buffer.from(JSON.stringify(memory), 'binary'),
        );

        return model;
    }
}
