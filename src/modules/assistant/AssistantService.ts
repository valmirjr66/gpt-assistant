import { Injectable, Optional } from '@nestjs/common';
import { ASSISTANT_DESCRIPTION } from 'src/constants/GptSetup';
import { Roles } from 'src/enum/gpt';
import ChatAgent from 'src/gpt/ChatAgent';
import GetConversationResponseModel from 'src/modules/assistant/model/GetConversationResponseModel';
import InsertMessageRequestModel from 'src/modules/assistant/model/InsertMessageRequestModel';
import InsertMessageResponseModel from 'src/modules/assistant/model/InsertMessageResponseModel';
import { Message } from 'src/types/gpt';
import BaseService from '../../BaseService';

@Injectable()
export default class AssistantService extends BaseService {
    constructor(
        @Optional()
        private readonly chatAgent: ChatAgent = new ChatAgent(
            ASSISTANT_DESCRIPTION,
        ),
    ) {
        super();
        this.chatAgent = chatAgent;
    }

    async getConversationById(
        id: string,
    ): Promise<GetConversationResponseModel> {
        const conversationMessages: Message[] =
            await this.prismaClient.message.findMany({
                where: { conversationId: id },
            });

        const conversation = new GetConversationResponseModel(
            id,
            conversationMessages,
        );

        return conversation;
    }

    async insertMessage(
        model: InsertMessageRequestModel,
    ): Promise<InsertMessageResponseModel> {
        const conversationMessages: Message[] =
            await this.prismaClient.message.findMany({
                where: { conversationId: model.conversationId },
            });

        const newMessage: Message = await this.prismaClient.message.create({
            data: {
                content: model.content,
                conversationId: model.conversationId,
                role: Roles.USER,
            },
        });

        conversationMessages.push(newMessage);

        const completion =
            await this.chatAgent.createCompletion(conversationMessages);

        const response: Message = await this.prismaClient.message.create({
            data: {
                content: completion,
                conversationId: model.conversationId,
                role: Roles.ASSISTANT,
            },
        });

        return new InsertMessageResponseModel(
            response.id,
            response.content,
            response.role,
            response.conversationId,
        );
    }
}
