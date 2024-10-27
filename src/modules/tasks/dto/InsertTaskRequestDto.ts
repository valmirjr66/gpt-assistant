import { IsNotEmpty, MaxLength, MinLength, Validate } from 'class-validator';
import TaskCategoryIdExistValidator from './validator/TaskCategoryIdExistValidator';

export default class InsertTaskRequestDto {
    @IsNotEmpty()
    @Validate(TaskCategoryIdExistValidator)
    categoryId: string;

    @MinLength(3)
    @MaxLength(50)
    task: string;

    constructor(categoryId: string, task: string) {
        this.categoryId = categoryId;
        this.task = task;
    }
}
