import { TaskCategory } from 'src/types/tasks';

export default class GetTasksResponseDto {
  tasksCategories: TaskCategory[];

  constructor(tasksCategories: TaskCategory[]) {
    this.tasksCategories = tasksCategories;
  }
}
