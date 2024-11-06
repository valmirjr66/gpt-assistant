import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import {
    ApiInternalServerErrorResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiTags,
} from '@nestjs/swagger';
import ResponseDescriptions from 'src/constants/ResponseDescriptions';
import InsertMessageRequestDto from 'src/modules/assistant/dto/InsertMessageRequestDto';
import BaseController from '../../BaseController';
import AssistantService from './AssistantService';
import GetConversationResponseDto from './dto/GetConversationResponseDto';
import InsertMessageResponseDto from './dto/InsertMessageResponseDto';

@ApiTags('Assistant')
@Controller('assistant')
export default class AssistantController extends BaseController {
    constructor(private readonly assistantService: AssistantService) {
        super();
    }

    @Get('/conversation/:id')
    @ApiOkResponse({ description: ResponseDescriptions.OK })
    @ApiNotFoundResponse({ description: ResponseDescriptions.NOT_FOUND })
    @ApiInternalServerErrorResponse({
        description: ResponseDescriptions.INTERNAL_SERVER_ERROR,
    })
    async getConversationById(
        @Param('id') id: string,
    ): Promise<GetConversationResponseDto> {
        const response = await this.assistantService.getConversationById(id);
        this.validateGetResponse(response);
        return response;
    }

    @Post('/conversation/message')
    @ApiOkResponse({ description: ResponseDescriptions.CREATED })
    @ApiNotFoundResponse({ description: ResponseDescriptions.BAD_REQUEST })
    @ApiInternalServerErrorResponse({
        description: ResponseDescriptions.INTERNAL_SERVER_ERROR,
    })
    async insertMessage(
        @Body() dto: InsertMessageRequestDto,
    ): Promise<InsertMessageResponseDto> {
        const response = await this.assistantService.insertMessage(dto);
        return response;
    }
}
