import { Controller, Get, Param } from '@nestjs/common';
import {
    ApiInternalServerErrorResponse,
    ApiOkResponse,
    ApiTags,
} from '@nestjs/swagger';
import ResponseDescriptions from 'src/constants/ResponseDescriptions';
import GetAllResponseDto from 'src/modules/planning/dto/GetAllResponseDto';
import BaseController from '../../BaseController';
import PlanningService from './PlanningService';
import GetByYearAndMonthResponseDto from './dto/GetByYearAndMonthResponseDto';
import GetByDateResponseDto from './dto/GetByDateResponseDto';

@ApiTags('Planning')
@Controller('planning')
export default class PlanningController extends BaseController {
    constructor(private readonly planningService: PlanningService) {
        super();
    }

    @Get()
    @ApiOkResponse({ description: ResponseDescriptions.OK })
    @ApiInternalServerErrorResponse({
        description: ResponseDescriptions.INTERNAL_SERVER_ERROR,
    })
    async getAll(): Promise<GetAllResponseDto> {
        const response = await this.planningService.getAll();
        this.validateGetResponse(response);
        return response;
    }

    @Get('/:year/:month')
    @ApiOkResponse({ description: ResponseDescriptions.OK })
    @ApiInternalServerErrorResponse({
        description: ResponseDescriptions.INTERNAL_SERVER_ERROR,
    })
    async getByYearAndMonth(
        @Param('year') year: number,
        @Param('month') month: number,
    ): Promise<GetByYearAndMonthResponseDto> {
        const response = await this.planningService.getByYearAndMonth(
            year,
            month,
        );
        this.validateGetResponse(response);
        return response;
    }

    @Get('/:year/:month/:day')
    @ApiOkResponse({ description: ResponseDescriptions.OK })
    @ApiInternalServerErrorResponse({
        description: ResponseDescriptions.INTERNAL_SERVER_ERROR,
    })
    async getByDate(
        @Param('year') year: number,
        @Param('month') month: number,
        @Param('day') day: number,
    ): Promise<GetByDateResponseDto> {
        const response = await this.planningService.getByDate(year, month, day);
        this.validateGetResponse(response);
        return response;
    }
}
