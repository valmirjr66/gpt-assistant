export default class InsertTaskResponseDto {
  categoryId: string;
  task: string;

  constructor(categoryId: string, task: string) {
    this.categoryId = categoryId
    this.task = task
  }
}