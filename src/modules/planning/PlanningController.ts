import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import {
    ApiInternalServerErrorResponse,
    ApiOkResponse,
    ApiTags,
} from '@nestjs/swagger';
import ResponseDescriptions from 'src/constants/ResponseDescriptions';
import GetAllResponseDto from 'src/modules/planning/dto/GetAllResponseDto';
import BaseController from '../../BaseController';
import PlanningService from './PlanningService';
import GetByDateResponseDto from './dto/GetByDateResponseDto';
import GetByYearAndMonthResponseDto from './dto/GetByYearAndMonthResponseDto';
import InsertEntryResponseDto from './dto/InsertEntryResponseDto';
import InsertEntryRequestDto from './dto/InsertEntryRequestDto';

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
    async getAllEntries(): Promise<GetAllResponseDto> {
        const response = await this.planningService.getAllEntries();
        this.validateGetResponse(response);
        return response;
    }

    @Get('/:year/:month')
    @ApiOkResponse({ description: ResponseDescriptions.OK })
    @ApiInternalServerErrorResponse({
        description: ResponseDescriptions.INTERNAL_SERVER_ERROR,
    })
    async getEntriesByYearAndMonth(
        @Param('year') year: number,
        @Param('month') month: number,
    ): Promise<GetByYearAndMonthResponseDto> {
        const response = await this.planningService.getEntriesByYearAndMonth(
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
    async getEntriesByDate(
        @Param('year') year: number,
        @Param('month') month: number,
        @Param('day') day: number,
    ): Promise<GetByDateResponseDto> {
        const response = await this.planningService.getEntriesByDate(year, month, day);
        this.validateGetResponse(response);
        return response;
    }

    @Post('/:year/:month/:day')
    @ApiOkResponse({ description: ResponseDescriptions.OK })
    @ApiInternalServerErrorResponse({
        description: ResponseDescriptions.INTERNAL_SERVER_ERROR,
    })
    async saveEntry(
        @Param('year') year: number,
        @Param('month') month: number,
        @Param('day') day: number,
        @Body() dto: InsertEntryRequestDto
    ): Promise<InsertEntryResponseDto> {
        const response = await this.planningService.saveEntry(year, month, day, dto.entries);
        return response;
    }
}
