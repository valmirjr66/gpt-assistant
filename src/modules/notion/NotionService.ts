import { Injectable } from '@nestjs/common';
import NotionHandler from 'src/handlers/notion';
import BaseService from '../../BaseService';
import GetPageChildrenResponseModel from './model/GetPageChildrenResponseModel';

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
}
