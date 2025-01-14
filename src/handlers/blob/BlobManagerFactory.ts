import { Injectable } from '@nestjs/common';
import BlobManagerInterface from './BlobManagerInterface';
import CloudBlobManager from './CloudBlobManager';

@Injectable()
export default class BlobManagerFactory {
    static createManager(): BlobManagerInterface {
        return new CloudBlobManager();
    }
}
