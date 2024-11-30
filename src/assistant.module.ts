import { Module } from '@nestjs/common';
import AssistantController from './modules/assistant/AssistantController';
import AssistantService from './modules/assistant/AssistantService';
import { AssistantGateway } from './modules/assistant/AssistantGateway';

@Module({
    controllers: [AssistantController],
    providers: [AssistantService, AssistantGateway],
})
export class AssistantModule {}
