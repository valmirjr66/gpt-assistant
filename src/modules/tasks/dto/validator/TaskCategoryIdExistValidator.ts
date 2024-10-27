import { Injectable } from '@nestjs/common';
import {
    ValidationArguments,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';
import BlobManagerFactory from 'src/handlers/blob/BlobManagerFactory';
import BlobManagerInterface from 'src/handlers/blob/BlobManagerInterface';

@ValidatorConstraint({ name: 'TaskCategoryExistValidator', async: true })
@Injectable()
export default class TaskCategoryIdExistValidator
    implements ValidatorConstraintInterface
{
    private readonly blobManager: BlobManagerInterface =
        BlobManagerFactory.createManager();

    async validate(categoryId: string): Promise<boolean> {
        const memoryBuffer = await this.blobManager.read('memory.json');
        const memoryStr = memoryBuffer.toString('binary');
        const memory = JSON.parse(memoryStr);

        return Object.keys(memory.tasks).includes(categoryId);
    }

    defaultMessage(validationArguments?: ValidationArguments): string {
        const field: string = validationArguments.property;
        return `${field} is invalid`;
    }
}
