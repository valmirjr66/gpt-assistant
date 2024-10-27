import { HttpException, HttpStatus } from '@nestjs/common';

export default class BaseController {
    protected validateGetResponse<T>(response: T | Array<T>): void {
        if (response instanceof Array && response.length === 0) {
            throw new HttpException('No content', HttpStatus.NO_CONTENT);
        } else if (!response) {
            throw new HttpException('Not found', HttpStatus.NOT_FOUND);
        }
    }
}
