import { Injectable } from '@nestjs/common';
import BlobManager from 'src/blob/BlobManager';
import GetTasksResponseModel from 'src/model/GetTasksResponseModel';
import { TaskCategory } from 'src/types/tasks';
import BaseService from './BaseService';

@Injectable()
export default class TasksService extends BaseService {
  constructor(private readonly blobManager: BlobManager) {
    super();
  }

  async getTasks(): Promise<GetTasksResponseModel> {
    const memoryBuffer = await this.blobManager.read("memory.json");
    const memoryStr = memoryBuffer.toString("binary");
    const memory = JSON.parse(memoryStr);

    const tasks: TaskCategory[] = [];

    for (const key in memory.tasks) {
      tasks.push({
        id: key,
        description: memory.tasks[key].description,
        items: memory.tasks[key].items
      });
    }

    return new GetTasksResponseModel(tasks);
  }
}
