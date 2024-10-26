import { Module } from '@nestjs/common';
import BlobManager from './blob/BlobManager';
import AssistantController from './controller/AssistantController';
import ChatAgent from './gpt/ChatAgent';
import MessageRepository from './repository/MessageRepository';
import GptService from './service/GptService';

@Module({
  imports: [],
  controllers: [AssistantController],
  providers: [
    MessageRepository,
    BlobManager,
    GptService,
    ChatAgent
  ]
})
export class AppModule {}
