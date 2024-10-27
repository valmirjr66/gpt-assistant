import { Injectable } from '@nestjs/common';
import BlobManagerInterface from './BlobManagerInterface';
import CloudBlobManager from './CloudBlobManager';
import FileSystemBlobManager from './FileSystemBlobManager';

@Injectable()
export default class BlobManagerFactory {
    static createManager(): BlobManagerInterface {
        return process.env.BLOB_MANAGEMENT_STRATEGY === 'cloud'
            ? new CloudBlobManager()
            : new FileSystemBlobManager();
    }
}
