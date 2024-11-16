import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import {
    ApiInternalServerErrorResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiTags,
} from '@nestjs/swagger';
import ResponseDescriptions from 'src/constants/ResponseDescriptions';
import SendMessageRequestDto from 'src/modules/assistant/dto/SendMessageRequestDto';
import BaseController from '../../BaseController';
import AssistantService from './AssistantService';
import GetConversationResponseDto from './dto/GetConversationResponseDto';
import SendMessageResponseDto from './dto/SendMessageResponseDto';
import GetFileMetadataResponseDto from './dto/GetFileMetadataResponseDto';

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
    async sendMessage(
        @Body() dto: SendMessageRequestDto,
    ): Promise<SendMessageResponseDto> {
        const response = await this.assistantService.sendMessage(dto);
        return response;
    }

    @Get('/files/:id')
    @ApiOkResponse({ description: ResponseDescriptions.OK })
    @ApiNotFoundResponse({ description: ResponseDescriptions.NOT_FOUND })
    @ApiInternalServerErrorResponse({
        description: ResponseDescriptions.INTERNAL_SERVER_ERROR,
    })
    async getFileMetadataById(
        @Param('id') id: string,
    ): Promise<GetFileMetadataResponseDto> {
        const response = await this.assistantService.getFileMetadataById(id);
        this.validateGetResponse(response);
        return response;
    }
}
