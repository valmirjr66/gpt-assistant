import { IsUUID, MaxLength, MinLength } from 'class-validator';

export default class InsertTaskRequestDto {
    @IsUUID()
    categoryId: string;

    @MinLength(3)
    @MaxLength(50)
    task: string;

    constructor(categoryId: string, task: string) {
        this.categoryId = categoryId;
        this.task = task;
    }
}
