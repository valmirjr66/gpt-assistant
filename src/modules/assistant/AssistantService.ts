import { Injectable, Optional } from '@nestjs/common';
import ChatAssistant from 'src/handlers/gpt/ChatAssistant';
import SimpleAgent from 'src/handlers/gpt/SimpleAgent';
import GetConversationResponseModel from 'src/modules/assistant/model/GetConversationResponseModel';
import SendMessageRequestModel from 'src/modules/assistant/model/SendMessageRequestModel';
import SendMessageResponseModel from 'src/modules/assistant/model/SendMessageResponseModel';
import { Annotation, Conversation, Message, Reference } from 'src/types/gpt';
import BaseService from '../../BaseService';
import GetConversationsByUserIdResponseModel from './model/GetConversationsByUserIdResponseModel';
import GetFileMetadataResponseModel from './model/GetFileMetadataResponseModel';
import GetReferencesByConversationIdResponseModel from './model/GetReferencesByConversationIdResponseModel';

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
        userId: string,
    ): Promise<GetConversationsByUserIdResponseModel> {
        const response = await this.prismaClient.conversation.findMany({
            where: { userId, archived: false },
        });

        return new GetConversationsByUserIdResponseModel(
            response.map((item) => ({
                id: item.id,
                title: item.title,
                createdAt: item.createdAt,
            })),
        );
    }

    async getReferencesByConversationId(
        conversationId: string,
    ): Promise<GetReferencesByConversationIdResponseModel> {
        const response = await this.prismaClient.references.findMany({
            where: { id: conversationId },
        });

        const references: Reference[] = [];

        for (const item of response) {
            const relatedFileMetadata =
                await this.prismaClient.fileMetadata.findFirst({
                    where: { id: item.fileMetadataId },
                });

            references.push({
                fileId: relatedFileMetadata.fileId,
                displayName: relatedFileMetadata.displayName,
                downloadURL: relatedFileMetadata.downloadURL,
                previewImageURL: relatedFileMetadata.previewImageURL,
            });
        }

        return new GetReferencesByConversationIdResponseModel(references);
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

        const relatedFiles = await this.prismaClient.fileMetadata.findMany({
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
        streamingCallback?: (
            conversationId: string,
            textSnapshot: string,
            annotationsSnapshot: Annotation[],
            finished: boolean,
        ) => void,
        newConversationCallback?: (
            conversation: Omit<Conversation, 'messages'>,
        ) => void,
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

            const currentDate = new Date();

            await this.prismaClient.conversation.create({
                data: {
                    userId: model.userId,
                    id: model.conversationId,
                    threadId,
                    title: conversationTitle,
                    createdAt: currentDate,
                    archived: false,
                },
            });

            newConversationCallback &&
                newConversationCallback({
                    id: model.conversationId,
                    title: conversationTitle,
                    createdAt: currentDate,
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

        const messageAddedToThread = streamingCallback
            ? await this.chatAssistant.addMessageToThreadByStream(
                  threadId,
                  model.content,
                  async (
                      textSnapshot: string,
                      annotationsSnapshot: Annotation[],
                      finished: boolean,
                  ) => {
                      const { distinctAnnotations, prettifiedTextContent } =
                          await this.prettifyTextAndAnnotations(
                              textSnapshot,
                              annotationsSnapshot,
                              false,
                          );

                      streamingCallback(
                          model.conversationId,
                          prettifiedTextContent,
                          distinctAnnotations,
                          finished,
                      );
                  },
              )
            : await this.chatAssistant.addMessageToThread(
                  threadId,
                  model.content,
              );

        const { prettifiedTextContent, distinctAnnotations } =
            await this.prettifyTextAndAnnotations(
                messageAddedToThread.content,
                messageAddedToThread.annotations,
                true,
            );

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
                content: prettifiedTextContent,
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
            distinctAnnotations,
        );
    }

    async getFileMetadataById(
        id: string,
    ): Promise<GetFileMetadataResponseModel> {
        const file = await this.chatAssistant.getFileById(id);

        if (!file) return null;

        const fileMetadata = await this.prismaClient.fileMetadata.findFirst({
            where: { fileId: id },
        });

        return new GetFileMetadataResponseModel({
            id: file.id,
            bytes: file.bytes,
            created_at: file.created_at,
            filename: file.filename,
            downloadURL: fileMetadata?.downloadURL,
        });
    }

    private async prettifyTextAndAnnotations(
        textContent: string,
        annotations: Annotation[],
        decorateAnnotations: boolean,
    ): Promise<{
        prettifiedTextContent: string;
        distinctAnnotations: Annotation[];
    }> {
        let prettifiedTextContent = textContent;

        for (const annotation of annotations)
            prettifiedTextContent = prettifiedTextContent.replaceAll(
                annotation.text,
                `[${annotation.file_citation.file_id}]`,
            );

        const distinctAnnotations = this.getDistinticAnnotations(annotations);

        for (let i = 0; i < distinctAnnotations.length; i++) {
            if (decorateAnnotations) {
                const fileMetadata =
                    await this.prismaClient.fileMetadata.findFirst({
                        where: {
                            fileId: distinctAnnotations[i].file_citation
                                .file_id,
                        },
                    });

                distinctAnnotations[i].downloadURL = fileMetadata?.downloadURL;
                distinctAnnotations[i].displayName = fileMetadata?.displayName;
            }

            prettifiedTextContent = prettifiedTextContent.replaceAll(
                `[${distinctAnnotations[i].file_citation.file_id}]`,
                `<sup>[${i + 1}]</sup>`,
            );
        }

        return { prettifiedTextContent, distinctAnnotations };
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
}
