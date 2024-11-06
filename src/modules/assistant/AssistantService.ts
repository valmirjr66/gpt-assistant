import { Injectable, Optional } from '@nestjs/common';
import { YOKO_SETUP } from 'src/constants/AssistantsSetup';
import { Roles } from 'src/enum/gpt';
import ChatAgent, { TextResponse } from 'src/handlers/gpt/ChatAgent';
import GetConversationResponseModel from 'src/modules/assistant/model/GetConversationResponseModel';
import InsertMessageRequestModel from 'src/modules/assistant/model/InsertMessageRequestModel';
import InsertMessageResponseModel from 'src/modules/assistant/model/InsertMessageResponseModel';
import { Message } from 'src/types/gpt';
import BaseService from '../../BaseService';
import methodsBoard from './MethodsBoard';

@Injectable()
export default class AssistantService extends BaseService {
    constructor(
        @Optional()
        private readonly chatAgent: ChatAgent = new ChatAgent(
            YOKO_SETUP,
            methodsBoard,
        ),
    ) {
        super();
        this.chatAgent = chatAgent;
    }

    async getConversationById(
        id: string,
    ): Promise<GetConversationResponseModel> {
        const conversationMessages: Message[] =
            await this.prismaClient.messages.findMany({
                where: {
                    conversationId: id,
                    AND: {
                        NOT: { role: 'tool' },
                        OR: [{ NOT: { content: null } }],
                    },
                },
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
        const conversationSoFar: Message[] =
            await this.prismaClient.messages.findMany({
                where: { conversationId: model.conversationId },
            });

        const incomingUserMessage: Message =
            await this.prismaClient.messages.create({
                data: {
                    content: model.content,
                    conversationId: model.conversationId,
                    role: Roles.USER,
                },
            });

        conversationSoFar.push(incomingUserMessage);

        const completion =
            await this.chatAgent.createCompletionWithTools(conversationSoFar);

        if (completion instanceof TextResponse) {
            const response: Message = await this.prismaClient.messages.create({
                data: {
                    content: completion.content,
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
        } else {
            const assistantToolCallResponse: Message =
                await this.prismaClient.messages.create({
                    data: {
                        conversationId: model.conversationId,
                        role: Roles.ASSISTANT,
                        toolCall: {
                            id: completion.toolCall.id,
                            functionName: completion.toolCall.function.name,
                            functionArguments:
                                completion.toolCall.function.arguments,
                        },
                    },
                });

            conversationSoFar.push(assistantToolCallResponse);

            const toolResponse: Message =
                await this.prismaClient.messages.create({
                    data: {
                        content: completion.response,
                        conversationId: model.conversationId,
                        role: Roles.TOOL,
                        toolCall: {
                            id: completion.toolCall.id,
                            functionName: completion.toolCall.function.name,
                            functionArguments:
                                completion.toolCall.function.arguments,
                        },
                    },
                });

            conversationSoFar.push(toolResponse);

            const followUpCompletion =
                await this.chatAgent.createCompletionWithoutTools(
                    conversationSoFar,
                );

            const assistantResponse: Message =
                await this.prismaClient.messages.create({
                    data: {
                        content: followUpCompletion.content,
                        conversationId: model.conversationId,
                        role: Roles.ASSISTANT,
                    },
                });

            return new InsertMessageResponseModel(
                assistantResponse.id,
                assistantResponse.content,
                assistantResponse.role,
                assistantResponse.conversationId,
            );
        }
    }
}
