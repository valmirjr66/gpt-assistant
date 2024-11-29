import { Injectable } from '@nestjs/common';
import NotionHandler from 'src/handlers/notion';
import BaseService from '../../BaseService';
import GetCommentsResponseModel from './model/GetCommentsResponseModel';
import GetPageChildrenResponseModel from './model/GetPageChildrenResponseModel';
import InsertCommentRequestModel from './model/InsertCommentRequestModel';
import InsertCommentResponseModel from './model/InsertCommentResponseModel';

@Injectable()
export default class NotionService extends BaseService {
    private readonly notionHandler: NotionHandler;

    constructor() {
        super();
        this.notionHandler = new NotionHandler();
    }

    async getPageChildren(id: string): Promise<GetPageChildrenResponseModel> {
        const result = await this.notionHandler.getPageChildren(id);
        if (result) return new GetPageChildrenResponseModel(result);
        else return null;
    }

    async insertComment(
        pageId: string,
        model: InsertCommentRequestModel,
    ): Promise<InsertCommentResponseModel> {
        const result = await this.notionHandler.createComment(
            pageId,
            model.content,
        );
        if (result) return new InsertCommentResponseModel(result);
        else return null;
    }

    async getCommentsByPageId(
        pageId: string,
    ): Promise<GetCommentsResponseModel> {
        const comments = await this.notionHandler.listComments(pageId);
        return new GetCommentsResponseModel(comments);
    }
}
