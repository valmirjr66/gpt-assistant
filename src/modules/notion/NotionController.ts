import { Controller, Get, Param } from '@nestjs/common';
import {
    ApiInternalServerErrorResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiTags,
} from '@nestjs/swagger';
import ResponseDescriptions from 'src/constants/ResponseDescriptions';
import BaseController from '../../BaseController';
import NotionService from './NotionService';
import GetPageChildrenResponseDto from './dto/GetPageChildrenResponseDto';

@ApiTags('Notion')
@Controller('notion')
export default class NotionController extends BaseController {
    constructor(private readonly notionService: NotionService) {
        super();
    }

    @Get('/page/:id')
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
}
