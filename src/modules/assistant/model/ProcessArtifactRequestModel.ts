export default class ProcessArtifactRequestModel {
    constructor(
        public file: Express.Multer.File,
        public filePreviewImage?: Express.Multer.File,
    ) {}
}
