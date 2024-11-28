import { Module } from '@nestjs/common';
import NotionController from './modules/notion/NotionController';
import NotionService from './modules/notion/NotionService';

@Module({
    controllers: [NotionController],
    providers: [NotionService],
})
export class NotionModule {}
