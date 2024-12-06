import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import AssistantController from './modules/assistant/AssistantController';
import { AssistantGateway } from './modules/assistant/AssistantGateway';
import AssistantService from './modules/assistant/AssistantService';
import {
    Conversation,
    ConversationSchema,
} from './modules/assistant/schemas/ConversationSchema';
import {
    FileMetadata,
    FileMetadataSchema,
} from './modules/assistant/schemas/FileMetadataSchema';
import {
    Message,
    MessageSchema,
} from './modules/assistant/schemas/MessageSchema';

@Module({
    controllers: [AssistantController],
    providers: [AssistantService, AssistantGateway],
    imports: [
        MongooseModule.forFeature([
            { name: Message.name, schema: MessageSchema },
            { name: Conversation.name, schema: ConversationSchema },
            { name: FileMetadata.name, schema: FileMetadataSchema },
        ]),
    ],
})
export class AssistantModule {}
