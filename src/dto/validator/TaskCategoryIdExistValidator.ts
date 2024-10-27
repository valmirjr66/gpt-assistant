import { Injectable, Optional } from '@nestjs/common';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import BlobManager from 'src/blob/BlobManager';

@ValidatorConstraint({ name: 'TaskCategoryExistValidator', async: true })
@Injectable()
export default class TaskCategoryIdExistValidator
  implements ValidatorConstraintInterface {
  constructor(@Optional() private readonly blobManager: BlobManager = new BlobManager()) { }

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
