import fs from 'fs-extra';
import BlobManagerInterface from './BlobManagerInterface';

export default class FileSystemBlobManager implements BlobManagerInterface {
    private readonly basePath: string = 'storage';

    async write(path: string, file: Buffer): Promise<void> {
        try {
            const dir = path.split('/').slice(0, -1).join('/');
            await fs.ensureDir(`${this.basePath}/${dir}`);
            await fs.writeFile(`${this.basePath}/${path}`, file);
        } catch (err) {
            throw 'Error while writing file';
        }
    }

    async read(path: string): Promise<Buffer> {
        try {
            return await fs.readFile(`${this.basePath}/${path}`);
        } catch (err) {
            throw 'Error while reading file';
        }
    }
}
