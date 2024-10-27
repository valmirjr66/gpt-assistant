import { TaskCategory } from 'src/types/tasks';

export default class GetTasksResponseModel {
    tasksCategories: TaskCategory[];

    constructor(tasksCategories: TaskCategory[]) {
        this.tasksCategories = tasksCategories;
    }
}
