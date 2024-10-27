import { Module } from '@nestjs/common';
import AssistantController from './modules/assistant/AssistantController';
import AssistantService from './modules/assistant/AssistantService';

@Module({
    controllers: [AssistantController],
    providers: [AssistantService],
})
export class AssistantModule { }
