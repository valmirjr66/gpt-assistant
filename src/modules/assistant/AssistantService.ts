import { Injectable, Optional } from '@nestjs/common';
import ChatAssistant from 'src/handlers/gpt/ChatAssistant';
import SimpleAgent from 'src/handlers/gpt/SimpleAgent';
import GetConversationResponseModel from 'src/modules/assistant/model/GetConversationResponseModel';
import SendMessageRequestModel from 'src/modules/assistant/model/SendMessageRequestModel';
import SendMessageResponseModel from 'src/modules/assistant/model/SendMessageResponseModel';
import { Annotation, Message } from 'src/types/gpt';
import BaseService from '../../BaseService';
import GetFileMetadataResponseModel from './model/GetFileMetadataResponseModel';

@Injectable()
export default class AssistantService extends BaseService {
    constructor(
        @Optional()
        private readonly chatAssistant: ChatAssistant = new ChatAssistant(
            process.env.ASSISTANT_ID,
        ),
    ) {
        super();
    }

    async getConversationById(
        id: string,
    ): Promise<GetConversationResponseModel> {
        const { referenceFileIds } =
            await this.prismaClient.conversation.findFirst({
                where: { id: id },
            });

        const relatedFiles = await this.prismaClient.fileReference.findMany({
            where: { fileId: { in: referenceFileIds } },
        });

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

        const response = new GetConversationResponseModel(
            id,
            conversationMessages,
            relatedFiles,
        );

        return response;
    }

    async sendMessage(
        model: SendMessageRequestModel,
    ): Promise<SendMessageResponseModel> {
        const conversation = await this.prismaClient.conversation.findFirst({
            where: { id: model.conversationId },
        });

        let threadId: string;
        let conversationTitle: string;
        let conversationReferences: string[];

        if (conversation && !conversation.threadId)
            throw new Error('No thread found for the given conversation');

        if (!conversation) {
            threadId = await this.chatAssistant.startThread();

            conversationTitle = await new SimpleAgent(
                `Você é um agente projetado para criar títulos de conversações,
                para cada input responda sempre e somente com uma frase curta que sumarize o tema da conversa.`,
            ).createCompletion(model.content);

            conversationReferences = [];

            await this.prismaClient.conversation.create({
                data: {
                    id: model.conversationId,
                    threadId,
                    title: conversationTitle,
                },
            });
        } else {
            threadId = conversation.threadId;
            conversationTitle = conversation.title;
            conversationReferences = conversation.referenceFileIds;
        }

        await this.prismaClient.messages.create({
            data: {
                content: model.content,
                conversationId: model.conversationId,
                role: 'user',
            },
        });

        const messageAddedToThread =
            await this.chatAssistant.addMessageToThread(
                threadId,
                model.content,
            );

        let responseContent = messageAddedToThread.content;

        const annotations = this.uniqueByProperty(
            messageAddedToThread.annotations,
            'file_citation.file_id',
        ) as Annotation[];

        for (let i = 0; i < annotations.length; i++) {
            const annotation = annotations[i];

            const fileReference =
                await this.prismaClient.fileReference.findFirst({
                    where: { fileId: annotation.file_citation.file_id },
                });

            annotation.downloadURL = fileReference?.downloadURL;
            annotation.displayName = fileReference?.displayName;

            responseContent = responseContent.replace(
                /【[^】]*】/g,
                `<sup>[${String(i + 1)}]</sup>`,
            );
        }

        await this.prismaClient.conversation.update({
            where: { id: model.conversationId },
            data: {
                referenceFileIds: [
                    ...conversationReferences,
                    ...annotations.map(
                        (anotation) => anotation.file_citation.file_id,
                    ),
                ],
            },
        });

        const response: Message = await this.prismaClient.messages.create({
            data: {
                content: responseContent,
                conversationId: model.conversationId,
                role: 'assistant',
                annotations: JSON.stringify(annotations),
            },
        });

        return new SendMessageResponseModel(
            response.id,
            response.content,
            response.role,
            response.conversationId,
            conversationTitle,
            [],
            annotations,
        );
    }

    async getFileMetadataById(
        id: string,
    ): Promise<GetFileMetadataResponseModel> {
        const file = await this.chatAssistant.getFileById(id);

        if (!file) return null;

        const fileReference = await this.prismaClient.fileReference.findFirst({
            where: { fileId: id },
        });

        return new GetFileMetadataResponseModel({
            id: file.id,
            bytes: file.bytes,
            created_at: file.created_at,
            filename: file.filename,
            downloadURL: fileReference?.downloadURL,
        });
    }

    private uniqueByProperty<T>(
        array: { [key: string]: unknown }[],
        property: string,
    ) {
        const seen = new Set();
        return array.filter((item) => {
            const value = item[property];
            if (seen.has(value)) {
                return false;
            }
            seen.add(value);
            return true;
        }) as T[];
    }

    // async oldSendMessage(
    //     model: SendMessageRequestModel,
    // ): Promise<SendMessageResponseModel> {
    //     const conversationSoFar: Message[] =
    //         await this.prismaClient.messages.findMany({
    //             where: { conversationId: model.conversationId },
    //         });

    //     const incomingUserMessage: Message =
    //         await this.prismaClient.messages.create({
    //             data: {
    //                 content: model.content,
    //                 conversationId: model.conversationId,
    //                 role: 'user',
    //             },
    //         });

    //     conversationSoFar.push(incomingUserMessage);

    //     const completion =
    //         await this.chatAgent.createCompletionWithTools(conversationSoFar);

    //     if (completion instanceof TextResponse) {
    //         const response: Message = await this.prismaClient.messages.create({
    //             data: {
    //                 content: completion.content,
    //                 conversationId: model.conversationId,
    //                 role: 'assistant',
    //             },
    //         });

    //         return new SendMessageResponseModel(
    //             response.id,
    //             response.content,
    //             response.role,
    //             response.conversationId,
    //         );
    //     } else {
    //         const assistantToolCallResponse: Message =
    //             await this.prismaClient.messages.create({
    //                 data: {
    //                     conversationId: model.conversationId,
    //                     role: 'assistant',
    //                     toolCall: {
    //                         id: completion.toolCall.id,
    //                         functionName: completion.toolCall.function.name,
    //                         functionArguments:
    //                             completion.toolCall.function.arguments,
    //                     },
    //                 },
    //             });

    //         conversationSoFar.push(assistantToolCallResponse);

    //         const toolResponse: Message =
    //             await this.prismaClient.messages.create({
    //                 data: {
    //                     content: completion.response,
    //                     conversationId: model.conversationId,
    //                     role: 'tool',
    //                     toolCall: {
    //                         id: completion.toolCall.id,
    //                         functionName: completion.toolCall.function.name,
    //                         functionArguments:
    //                             completion.toolCall.function.arguments,
    //                     },
    //                 },
    //             });

    //         conversationSoFar.push(toolResponse);

    //         const followUpCompletion =
    //             await this.chatAgent.createCompletionWithoutTools(
    //                 conversationSoFar,
    //             );

    //         const assistantResponse: Message =
    //             await this.prismaClient.messages.create({
    //                 data: {
    //                     content: followUpCompletion.content,
    //                     conversationId: model.conversationId,
    //                     role: 'assistant',
    //                     actions: completion.actions,
    //                 },
    //             });

    //         return new SendMessageResponseModel(
    //             assistantResponse.id,
    //             assistantResponse.content,
    //             assistantResponse.role,
    //             assistantResponse.conversationId,
    //             assistantResponse.actions,
    //         );
    //     }
    // }
}
