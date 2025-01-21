import {
    Controller,
    Get,
    Post,
    Query,
    UploadedFiles,
    UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
    ApiBadRequestResponse,
    ApiBody,
    ApiConsumes,
    ApiCreatedResponse,
    ApiInternalServerErrorResponse,
    ApiOkResponse,
    ApiTags,
} from '@nestjs/swagger';
import ResponseDescriptions from 'src/constants/ResponseDescriptions';
import BaseController from '../../BaseController';
import ProcessArtifactRequestDto from '../assistant/dto/ProcessArtifactRequestDto';
import ProcessArtifactRequestModel from '../assistant/model/ProcessArtifactRequestModel';
import ArtifactsService from './ArtifactsService';

@ApiTags('Artifacts')
@Controller('artifacts')
export default class ArtifactsController extends BaseController {
    constructor(private readonly artifactsService: ArtifactsService) {
        super();
    }

    @Post('/process-artifact')
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(
        FileFieldsInterceptor([
            { name: 'file', maxCount: 1 },
            { name: 'filePreviewImage', maxCount: 1 },
        ]),
    )
    @ApiBody({
        type: ProcessArtifactRequestDto,
    })
    @ApiCreatedResponse({ description: ResponseDescriptions.CREATED })
    @ApiBadRequestResponse({ description: ResponseDescriptions.BAD_REQUEST })
    @ApiInternalServerErrorResponse({
        description: ResponseDescriptions.INTERNAL_SERVER_ERROR,
    })
    async processArtifact(
        @UploadedFiles()
        files: {
            file: Express.Multer.File[];
            filePreviewImage?: Express.Multer.File[];
        },
    ): Promise<void> {
        const { file, filePreviewImage } = files;

        await this.artifactsService.processArtifact(
            new ProcessArtifactRequestModel(file[0], filePreviewImage?.[0]),
        );
    }

    @Get('/query')
    @ApiOkResponse({ description: ResponseDescriptions.OK })
    @ApiInternalServerErrorResponse({
        description: ResponseDescriptions.INTERNAL_SERVER_ERROR,
    })
    async query(@Query('query') query: string): Promise<string> {
        return await this.artifactsService.queryDatabase(query);
    }
}
