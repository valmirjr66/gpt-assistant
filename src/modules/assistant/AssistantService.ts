import { Injectable, Optional } from '@nestjs/common';
import ChatAssistant from 'src/handlers/gpt/ChatAssistant';
import GetConversationResponseModel from 'src/modules/assistant/model/GetConversationResponseModel';
import SendMessageRequestModel from 'src/modules/assistant/model/SendMessageRequestModel';
import SendMessageResponseModel from 'src/modules/assistant/model/SendMessageResponseModel';
import { Message } from 'src/types/gpt';
import BaseService from '../../BaseService';
import GetFileMetadataResponseModel from './model/GetFileMetadataResponseModel';
import SimpleAgent from 'src/handlers/gpt/SimpleAgent';

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

        const assistantIsWriting: boolean =
            (
                await this.prismaClient.conversation.findFirst({
                    where: {
                        id: id,
                    },
                })
            )?.assistantIsWriting || false;

        const conversation = new GetConversationResponseModel(
            id,
            conversationMessages,
            assistantIsWriting,
        );

        return conversation;
    }

    async sendMessage(
        model: SendMessageRequestModel,
    ): Promise<SendMessageResponseModel> {
        const conversation = await this.prismaClient.conversation.findFirst({
            where: { id: model.conversationId },
        });

        let threadId: string;
        let conversationTitle: string;

        if (conversation && !conversation.threadId)
            throw new Error('No thread found for the given conversation');

        if (!conversation) {
            threadId = await this.chatAssistant.startThread();

            conversationTitle = await new SimpleAgent(
                `Você é um agente projetado para criar títulos de conversações,
                para cada input responda sempre e somente com uma frase curta que sumarize o tema da conversa.`,
            ).createCompletion(model.content);

            await this.prismaClient.conversation.create({
                data: {
                    id: model.conversationId,
                    threadId,
                    title: conversationTitle,
                    assistantIsWriting: true,
                },
            });
        } else {
            threadId = conversation.threadId;
            conversationTitle = conversation.title;
        }

        await this.prismaClient.messages.create({
            data: {
                content: model.content,
                conversationId: model.conversationId,
                role: 'user',
            },
        });

        const initialMessage: Message = await this.prismaClient.messages.create(
            {
                data: {
                    content: '',
                    conversationId: model.conversationId,
                    role: 'assistant',
                },
            },
        );

        let updateInProgress = false;

        const { content: responseContent, annotations } =
            await this.chatAssistant.addMessageToThread(
                threadId,
                model.content,
                async (textSnapshot: string) => {
                    try {
                        if (!updateInProgress) {
                            updateInProgress = true;
                            await this.prismaClient.messages.update({
                                where: { id: initialMessage.id },
                                data: {
                                    content: textSnapshot,
                                },
                            });
                            updateInProgress = false;
                        }
                    } catch (err) {
                        console.error(
                            'Error while trying to append message delta do Prisma, probably a deadlock conflict.',
                            'Complete error stack is as follows:\n',
                            JSON.stringify(err),
                        );
                    }
                },
                async () => {
                    await this.prismaClient.conversation.update({
                        where: { id: model.conversationId },
                        data: {
                            assistantIsWriting: false,
                            title: conversationTitle,
                        },
                    });
                },
            );

        for (const annotation of annotations) {
            const fileReference =
                await this.prismaClient.fileReference.findFirst({
                    where: { fileId: annotation.file_citation.file_id },
                });

            annotation.downloadURL = fileReference?.downloadURL;
            annotation.displayName = fileReference?.displayName;
        }

        const response: Message = await this.prismaClient.messages.update({
            where: { id: initialMessage.id },
            data: {
                content: responseContent,
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
