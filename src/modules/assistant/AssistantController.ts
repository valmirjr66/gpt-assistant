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
    ApiBadRequestResponse,
    ApiInternalServerErrorResponse,
    ApiNoContentResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiTags,
} from '@nestjs/swagger';
import ResponseDescriptions from 'src/constants/ResponseDescriptions';
import BaseController from '../../BaseController';
import AssistantService from './AssistantService';
import ConversationHandshakeResponseDto from './dto/ConversationHandshakeResponseDto';
import GetConversationResponseDto from './dto/GetConversationResponseDto';
import GetConversationsByUserIdResponseDto from './dto/GetConversationsByUserIdResponseDto';
import GetReferencesByConversationIdResponseDto from './dto/GetReferencesByConversationIdResponseDto';
import SendMessageRequestDto from './dto/SendMessageRequestDto';
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

    @Post('/conversations/:id/handshake')
    @ApiOkResponse({ description: ResponseDescriptions.OK })
    @ApiBadRequestResponse({ description: ResponseDescriptions.BAD_REQUEST })
    @ApiInternalServerErrorResponse({
        description: ResponseDescriptions.INTERNAL_SERVER_ERROR,
    })
    async conversationHandshake(
        @Param('id') conversationId: string,
        @Headers('userId') userId?: string,
    ): Promise<ConversationHandshakeResponseDto> {
        const response = await this.assistantService.conversationHandshake(
            userId,
            conversationId,
        );

        return response;
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

    @Post('/conversations/:id/message')
    @ApiOkResponse({ description: ResponseDescriptions.CREATED })
    @ApiBadRequestResponse({ description: ResponseDescriptions.BAD_REQUEST })
    @ApiNotFoundResponse({ description: ResponseDescriptions.NOT_FOUND })
    @ApiInternalServerErrorResponse({
        description: ResponseDescriptions.INTERNAL_SERVER_ERROR,
    })
    async sendMessage(
        @Body() dto: SendMessageRequestDto,
        @Param('id') id: string,
        @Headers('userId') userId?: string,
    ): Promise<SendMessageResponseDto> {
        const response = await this.assistantService.sendMessage({
            ...dto,
            userId: userId || 'anonymous',
            conversationId: id,
        });

        this.validateGetResponse(response);

        return response;
    }

    @Get('/conversations/:id/references')
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
