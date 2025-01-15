import BlobManagerInterface from './BlobManagerInterface';
import CloudBlobManager from './CloudBlobManager';

export default class BlobManagerFactory {
    static createManager(): BlobManagerInterface {
        return new CloudBlobManager();
    }
}
