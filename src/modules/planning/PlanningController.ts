import { Controller, Get } from '@nestjs/common';
import {
    ApiInternalServerErrorResponse,
    ApiNoContentResponse,
    ApiOkResponse,
    ApiTags,
} from '@nestjs/swagger';
import ResponseDescriptions from 'src/constants/ResponseDescriptions';
import GetPlanningResponseDto from 'src/modules/planning/dto/GetPlanningResponseDto';
import BaseController from '../../BaseController';
import PlanningService from './PlanningService';

@ApiTags('Planning')
@Controller('planning')
export default class PlanningController extends BaseController {
    constructor(private readonly planningService: PlanningService) {
        super();
    }

    @Get()
    @ApiOkResponse({ description: ResponseDescriptions.OK })
    @ApiNoContentResponse({ description: ResponseDescriptions.NO_CONTENT })
    @ApiInternalServerErrorResponse({
        description: ResponseDescriptions.INTERNAL_SERVER_ERROR,
    })
    async getAll(): Promise<GetPlanningResponseDto> {
        const response = await this.planningService.getAll();
        this.validateGetResponse(response);
        return response;
    }
}
