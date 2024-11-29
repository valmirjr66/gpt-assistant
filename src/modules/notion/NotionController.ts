import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import {
    ApiCreatedResponse,
    ApiInternalServerErrorResponse,
    ApiNoContentResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiTags,
} from '@nestjs/swagger';
import ResponseDescriptions from 'src/constants/ResponseDescriptions';
import BaseController from '../../BaseController';
import NotionService from './NotionService';
import GetCommentsResponseDto from './dto/GetCommentsResponseDto';
import GetPageChildrenResponseDto from './dto/GetPageChildrenResponseDto';
import InsertCommentRequestDto from './dto/InsertCommentRequestDto';
import InsertCommentResponseDto from './dto/InsertCommentResponseDto';

@ApiTags('Notion')
@Controller('notion')
export default class NotionController extends BaseController {
    constructor(private readonly notionService: NotionService) {
        super();
    }

    @Get('/pages/:id')
    @ApiOkResponse({ description: ResponseDescriptions.OK })
    @ApiNotFoundResponse({ description: ResponseDescriptions.NOT_FOUND })
    @ApiInternalServerErrorResponse({
        description: ResponseDescriptions.INTERNAL_SERVER_ERROR,
    })
    async getPageChildren(
        @Param('id') id: string,
    ): Promise<GetPageChildrenResponseDto> {
        const response = await this.notionService.getPageChildren(id);
        this.validateGetResponse(response);
        return response;
    }

    @Post('/pages/:id/comments')
    @ApiCreatedResponse({ description: ResponseDescriptions.CREATED })
    @ApiInternalServerErrorResponse({
        description: ResponseDescriptions.INTERNAL_SERVER_ERROR,
    })
    async insertComment(
        @Param('id') id: string,
        @Body() dto: InsertCommentRequestDto,
    ): Promise<InsertCommentResponseDto> {
        return await this.notionService.insertComment(id, dto);
    }

    @Get('/pages/:id/comments')
    @ApiOkResponse({ description: ResponseDescriptions.OK })
    @ApiNoContentResponse({ description: ResponseDescriptions.NO_CONTENT })
    @ApiInternalServerErrorResponse({
        description: ResponseDescriptions.INTERNAL_SERVER_ERROR,
    })
    async getCommentsByPageId(
        @Param('id') id: string,
    ): Promise<GetCommentsResponseDto> {
        const response = await this.notionService.getCommentsByPageId(id);
        this.validateGetResponse(response);
        return response;
    }
}
