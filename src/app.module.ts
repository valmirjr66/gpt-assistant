import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AssistantModule } from './assistant.module';
import { TelegramController } from './modules/telegram/TelegramController';
import { NotionModule } from './notion.module';

@Module({
    imports: [
        AssistantModule,
        NotionModule,
        MongooseModule.forRoot(process.env.DATABASE_URL),
    ],
    controllers: [TelegramController],
})
export class AppModule {}
