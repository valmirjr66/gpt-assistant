import { Controller, Post } from '@nestjs/common';
import {
    ApiInternalServerErrorResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiTags,
} from '@nestjs/swagger';
import ResponseDescriptions from 'src/constants/ResponseDescriptions';
import BaseController from '../../BaseController';
import ArtifactsService from './ArtifactsService';
import TriggerArtifactsScanRequestDto from './dto/TriggerArtifactsScanRequestDto';

@ApiTags('Artifacts')
@Controller('artifacts')
export default class ArtifactsController extends BaseController {
    constructor(private readonly artifactsService: ArtifactsService) {
        super();
    }

    @Post('/trigger-scan')
    @ApiOkResponse({ description: ResponseDescriptions.OK })
    @ApiNotFoundResponse({ description: ResponseDescriptions.NOT_FOUND })
    @ApiInternalServerErrorResponse({
        description: ResponseDescriptions.INTERNAL_SERVER_ERROR,
    })
    async triggerArtifactsScan(): Promise<TriggerArtifactsScanRequestDto> {
        this.artifactsService.triggerArtifactsScan();
        return new TriggerArtifactsScanRequestDto();
    }
}
