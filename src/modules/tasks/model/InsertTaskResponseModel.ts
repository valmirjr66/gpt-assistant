export default class InsertTaskResponseModel {
    categoryId: string;
    task: string;

    constructor(categoryId: string, task: string) {
        this.categoryId = categoryId;
        this.task = task;
    }
}
