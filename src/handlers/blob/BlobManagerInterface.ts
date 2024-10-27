export default interface BlobManagerInterface {
    write(path: string, file: Buffer): Promise<void>;
    read(path: string): Promise<Buffer>;
}
