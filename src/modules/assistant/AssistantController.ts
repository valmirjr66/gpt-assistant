import {
    Body,
    Controller,
    Delete,
    Get,
    Headers,
    Param,
    Post,
} from '@nestjs/common';
import {
    ApiInternalServerErrorResponse,
    ApiNoContentResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiTags,
} from '@nestjs/swagger';
import ResponseDescriptions from 'src/constants/ResponseDescriptions';
import SendMessageRequestDto from 'src/modules/assistant/dto/SendMessageRequestDto';
import BaseController from '../../BaseController';
import AssistantService from './AssistantService';
import GetConversationResponseDto from './dto/GetConversationResponseDto';
import GetConversationsByUserIdResponseDto from './dto/GetConversationsByUserIdResponseDto';
import GetFileMetadataResponseDto from './dto/GetFileMetadataResponseDto';
import GetReferencesByConversationIdResponseDto from './dto/GetReferencesByConversationIdResponseDto';
import SendMessageResponseDto from './dto/SendMessageResponseDto';

@ApiTags('Assistant')
@Controller('assistant')
export default class AssistantController extends BaseController {
    constructor(private readonly assistantService: AssistantService) {
        super();
    }

    @Get('/conversations')
    @ApiOkResponse({ description: ResponseDescriptions.OK })
    @ApiNoContentResponse({ description: ResponseDescriptions.NO_CONTENT })
    @ApiInternalServerErrorResponse({
        description: ResponseDescriptions.INTERNAL_SERVER_ERROR,
    })
    async getConversationsByUserId(
        @Headers('userId') userId?: string,
    ): Promise<GetConversationsByUserIdResponseDto> {
        const response = await this.assistantService.getConversationsByUserId(
            userId || 'anonymous',
        );
        this.validateGetResponse(response);
        return response;
    }

    @Delete('/conversations/:id')
    @ApiOkResponse({ description: ResponseDescriptions.OK })
    @ApiNotFoundResponse({ description: ResponseDescriptions.NOT_FOUND })
    @ApiInternalServerErrorResponse({
        description: ResponseDescriptions.INTERNAL_SERVER_ERROR,
    })
    async deleteConversationById(@Param('id') id: string): Promise<void> {
        await this.assistantService.deleteConversationById(id);
    }

    @Get('/conversations/:id')
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

    @Post('/conversations/message')
    @ApiOkResponse({ description: ResponseDescriptions.CREATED })
    @ApiNotFoundResponse({ description: ResponseDescriptions.BAD_REQUEST })
    @ApiInternalServerErrorResponse({
        description: ResponseDescriptions.INTERNAL_SERVER_ERROR,
    })
    async sendMessage(
        @Body() dto: SendMessageRequestDto,
        @Headers('userId') userId?: string,
    ): Promise<SendMessageResponseDto> {
        const response = await this.assistantService.sendMessage({
            ...dto,
            userId: userId || 'anonymous',
        });

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

    @Get('/conversations/:id')
    @ApiOkResponse({ description: ResponseDescriptions.OK })
    @ApiNoContentResponse({ description: ResponseDescriptions.NO_CONTENT })
    @ApiInternalServerErrorResponse({
        description: ResponseDescriptions.INTERNAL_SERVER_ERROR,
    })
    async getReferencesByConversationId(
        @Param('id') id: string,
    ): Promise<GetReferencesByConversationIdResponseDto> {
        const response =
            await this.assistantService.getReferencesByConversationId(id);
        this.validateGetResponse(response);
        return response;
    }
}
