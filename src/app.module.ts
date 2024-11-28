import { Module } from '@nestjs/common';
import { AssistantModule } from './assistant.module';
import { TelegramController } from './modules/telegram/TelegramController';
import { NotionModule } from './notion.module';

@Module({
    imports: [AssistantModule, NotionModule],
    controllers: [TelegramController],
})
export class AppModule {}
