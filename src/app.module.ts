import { Module } from '@nestjs/common';
import { AssistantModule } from './assistant.module';
import { TelegramController } from './modules/telegram/TelegramController';

@Module({
    imports: [AssistantModule],
    controllers: [TelegramController]
})
export class AppModule { }
