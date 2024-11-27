import { Injectable, Optional } from '@nestjs/common';
import ChatAssistant from 'src/handlers/gpt/ChatAssistant';
import SimpleAgent from 'src/handlers/gpt/SimpleAgent';
import GetConversationResponseModel from 'src/modules/assistant/model/GetConversationResponseModel';
import SendMessageRequestModel from 'src/modules/assistant/model/SendMessageRequestModel';
import SendMessageResponseModel from 'src/modules/assistant/model/SendMessageResponseModel';
import { Annotation, Message } from 'src/types/gpt';
import BaseService from '../../BaseService';
import GetConversationsByUserIdModel from './model/GetConversationsByUserIdModel';
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

    async deleteConversationById(id: string) {
        await this.prismaClient.conversation.update({
            data: { archived: true },
            where: { id },
        });
    }

    async getConversationsByUserId(
        userId?: string,
    ): Promise<GetConversationsByUserIdModel> {
        const response = await this.prismaClient.conversation.findMany({
            where: { userId, archived: false },
        });

        return new GetConversationsByUserIdModel(
            response.map((item) => ({
                id: item.id,
                title: item.title,
                createdAt: item.createdAt,
            })),
        );
    }

    async getConversationById(
        conversationId: string,
    ): Promise<GetConversationResponseModel> {
        const referenceFileIds =
            (
                await this.prismaClient.conversation.findFirst({
                    where: { id: conversationId },
                })
            )?.referenceFileIds || [];

        const relatedFiles = await this.prismaClient.fileReference.findMany({
            where: { fileId: { in: referenceFileIds } },
        });

        const conversationMessages: Message[] =
            await this.prismaClient.messages.findMany({
                where: {
                    conversationId: conversationId,
                    AND: {
                        NOT: { role: 'tool' },
                        OR: [{ NOT: { content: null } }],
                    },
                },
            });

        if (!conversationMessages) return null;

        const conversationTitle = (
            await this.prismaClient.conversation.findUnique({
                where: { id: conversationId },
            })
        )?.title;

        const response = new GetConversationResponseModel(
            conversationId,
            conversationTitle,
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
                `You are an agent designed to create conversation titles.
                For each input, always and only respond with a short sentence
                that summarizes the topic of the conversation.
                Remember to always write the title in english.`,
            ).createCompletion(model.content);

            conversationReferences = [];

            await this.prismaClient.conversation.create({
                data: {
                    userId: model.userId,
                    id: model.conversationId,
                    threadId,
                    title: conversationTitle,
                    createdAt: new Date(),
                    archived: false,
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
                createdAt: new Date(),
            },
        });

        const messageAddedToThread =
            await this.chatAssistant.addMessageToThread(
                threadId,
                model.content,
            );

        let responseContent = messageAddedToThread.content;

        const annotations = messageAddedToThread.annotations;

        for (const annotation of annotations)
            responseContent = responseContent.replaceAll(
                annotation.text,
                `[${annotation.file_citation.file_id}]`,
            );

        const distinctAnnotations = this.getDistinticAnnotations(annotations);

        for (let i = 0; i < distinctAnnotations.length; i++) {
            const fileReference =
                await this.prismaClient.fileReference.findFirst({
                    where: {
                        fileId: distinctAnnotations[i].file_citation.file_id,
                    },
                });

            distinctAnnotations[i].downloadURL = fileReference?.downloadURL;
            distinctAnnotations[i].displayName = fileReference?.displayName;

            responseContent = responseContent.replaceAll(
                `[${distinctAnnotations[i].file_citation.file_id}]`,
                `<sup>[${i + 1}]</sup>`,
            );
        }

        await this.prismaClient.conversation.update({
            where: { id: model.conversationId },
            data: {
                referenceFileIds: [
                    ...conversationReferences,
                    ...distinctAnnotations.map(
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
                annotations: JSON.stringify(distinctAnnotations),
                createdAt: new Date(),
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

    private getDistinticAnnotations(array: Annotation[]): Annotation[] {
        const seen = new Set();
        return array.filter((item) => {
            const value = item.file_citation.file_id;
            if (seen.has(value)) {
                return false;
            }
            seen.add(value);
            return true;
        });
    }
    // }
}
