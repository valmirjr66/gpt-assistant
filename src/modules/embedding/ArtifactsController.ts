import { Controller, Get, Post, Query } from '@nestjs/common';
import {
    ApiInternalServerErrorResponse,
    ApiOkResponse,
    ApiTags,
} from '@nestjs/swagger';
import ResponseDescriptions from 'src/constants/ResponseDescriptions';
import BaseController from '../../BaseController';
import ArtifactsService from './ArtifactsService';

@ApiTags('Artifacts')
@Controller('artifacts')
export default class ArtifactsController extends BaseController {
    constructor(private readonly artifactsService: ArtifactsService) {
        super();
    }

    @Post('/process-file')
    @ApiOkResponse({ description: ResponseDescriptions.OK })
    @ApiInternalServerErrorResponse({
        description: ResponseDescriptions.INTERNAL_SERVER_ERROR,
    })
    async processFile(): Promise<void> {
        await this.artifactsService.processFile();
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
