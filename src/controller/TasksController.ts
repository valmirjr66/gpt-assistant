import { Body, Controller, Get, Post } from '@nestjs/common';
import {
    ApiInternalServerErrorResponse,
    ApiNoContentResponse,
    ApiOkResponse,
    ApiTags,
} from '@nestjs/swagger';
import ResponseDescriptions from 'src/constants/ResponseDescriptions';
import GetTasksResponseDto from 'src/dto/GetTasksResponseDto';
import InsertTaskRequestDto from 'src/dto/InsertTaskRequestDto';
import InsertTaskResponseDto from 'src/dto/InsertTaskResponseDto';
import TasksService from 'src/service/TasksService';
import BaseController from './BaseController';

@ApiTags('Tasks')
@Controller('tasks')
export default class TasksController extends BaseController {
    constructor(private readonly tasksService: TasksService) {
        super();
    }

    @Get()
    @ApiOkResponse({ description: ResponseDescriptions.OK })
    @ApiNoContentResponse({ description: ResponseDescriptions.NO_CONTENT })
    @ApiInternalServerErrorResponse({
        description: ResponseDescriptions.INTERNAL_SERVER_ERROR,
    })
    async getTasks(): Promise<GetTasksResponseDto> {
        const response = await this.tasksService.getTasks();
        this.validateGetResponse(response);
        return response;
    }

    @Post()
    @ApiOkResponse({ description: ResponseDescriptions.OK })
    @ApiNoContentResponse({ description: ResponseDescriptions.BAD_REQUEST })
    @ApiInternalServerErrorResponse({
        description: ResponseDescriptions.INTERNAL_SERVER_ERROR,
    })
    async insertTask(
        @Body() dto: InsertTaskRequestDto,
    ): Promise<InsertTaskResponseDto> {
        const response = await this.tasksService.insertTask(dto);
        return response;
    }
}
