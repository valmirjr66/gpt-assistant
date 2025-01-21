import { ApiProperty } from '@nestjs/swagger';

export default class ProcessArtifactRequestDto {
    @ApiProperty({ type: 'string', format: 'binary' })
    file: Express.Multer.File;

    @ApiProperty({ type: 'string', format: 'binary' })
    filePreviewImage?: Express.Multer.File;

    constructor(
        file: Express.Multer.File,
        filePreviewImage?: Express.Multer.File,
    ) {
        this.file = file;
        this.filePreviewImage = filePreviewImage;
    }
}
