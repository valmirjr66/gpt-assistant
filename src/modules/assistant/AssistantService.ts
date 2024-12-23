import { Injectable, Logger, Optional } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import ChatAssistant from 'src/handlers/gpt/ChatAssistant';
import SimpleAgent from 'src/handlers/gpt/SimpleAgent';
import GetConversationResponseModel from 'src/modules/assistant/model/GetConversationResponseModel';
import {
    Annotation,
    ConversationStatus,
    SimplifiedConversation,
} from 'src/types/gpt';
import { v4 as uuidv4 } from 'uuid';
import BaseService from '../../BaseService';
import ConversationHandshakeResponseModel from './model/ConversationHandshakeResponseModel';
import GetConversationsByUserIdResponseModel from './model/GetConversationsByUserIdResponseModel';
import GetReferencesByConversationIdResponseModel from './model/GetReferencesByConversationIdResponseModel';
import SendMessageRequestModel from './model/SendMessageRequestModel';
import SendMessageResponseModel from './model/SendMessageResponseModel';
import { Conversation } from './schemas/ConversationSchema';
import { FileMetadata } from './schemas/FileMetadataSchema';
import { Message } from './schemas/MessageSchema';

@Injectable()
export default class AssistantService extends BaseService {
    private logger: Logger = new Logger('AssistantService');

    constructor(
        @Optional()
        private readonly chatAssistant: ChatAssistant = new ChatAssistant(
            process.env.ASSISTANT_ID,
        ),
        @InjectModel(Message.name)
        private readonly messageModel: Model<Message>,
        @InjectModel(Conversation.name)
        private readonly conversationModel: Model<Conversation>,
        @InjectModel(FileMetadata.name)
        private readonly fileMetadataModel: Model<FileMetadata>,
    ) {
        super();
    }

    async conversationHandshake(
        userId: string,
        conversationId: string,
        newConversationCallback?: (
            conversation: SimplifiedConversation,
        ) => void,
    ): Promise<ConversationHandshakeResponseModel> {
        const conversation =
            await this.conversationModel.findById(conversationId);

        let threadId: string;
        let conversationTitle: string;
        let conversationStatus: ConversationStatus;

        if (!conversation) {
            threadId = await this.chatAssistant.startThread();
            conversationTitle = 'New chat';
            conversationStatus = 'created';

            const currentDate = new Date();

            try {
                await this.conversationModel.create({
                    _id: conversationId,
                    userId: userId,
                    title: conversationTitle,
                    threadId: threadId,
                    createdAt: currentDate,
                    updatedAt: currentDate,
                    status: conversationStatus,
                });

                newConversationCallback &&
                    newConversationCallback({
                        _id: conversationId,
                        title: conversationTitle,
                        createdAt: currentDate,
                        updatedAt: currentDate,
                        status: conversationStatus,
                    });
            } catch {
                // TODO: there should be a proper strategy to treat this
                this.logger.error(
                    'Error while trying to create the conversation',
                );
            }
        } else {
            threadId = conversation.threadId;
            conversationTitle = conversation.title;
            conversationStatus = conversation.status;
        }

        return new ConversationHandshakeResponseModel(conversationStatus);
    }

    async deleteConversationById(id: string) {
        await this.conversationModel.updateOne(
            { _id: id },
            { status: 'archived' },
        );
    }

    async getConversationsByUserId(
        userId: string,
    ): Promise<GetConversationsByUserIdResponseModel> {
        const response = await this.conversationModel.find({
            userId,
            status: { $nin: ['archived'] },
        });

        return new GetConversationsByUserIdResponseModel(
            response.map((item) => ({
                _id: item.id,
                status: item.status,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
                title: item.title,
            })),
        );
    }

    async getReferencesByConversationId(
        conversationId: string,
    ): Promise<GetReferencesByConversationIdResponseModel> {
        const response = await this.conversationModel.findById(conversationId);

        const references = response?.references;

        if (!references) return null;

        const normalizedReferences = references.filter((item) => item);

        if (normalizedReferences.length < references.length) {
            const diff = normalizedReferences.length - references.length;

            this.logger.warn(
                `${diff} nullish values were removed, but they shouldn't be here, right? 🤔`,
            );
        }

        return new GetReferencesByConversationIdResponseModel(
            normalizedReferences || [],
        );
    }

    async getConversationById(
        conversationId: string,
    ): Promise<GetConversationResponseModel> {
        const conversation =
            await this.conversationModel.findById(conversationId);

        const conversationMessages = await this.messageModel.find({
            conversationId,
        });

        if (conversationMessages.length === 0) return null;

        const response = new GetConversationResponseModel(
            conversationId,
            conversation.title,
            conversationMessages,
        );

        return response;
    }

    async sendMessage(
        model: SendMessageRequestModel,
        streamingCallback?: (
            conversationId: string,
            textSnapshot: string,
            finished: boolean,
        ) => void,
        conversationMetadataUpdateCallback?: (
            conversation: SimplifiedConversation,
        ) => void,
        referenceSnapshotCallback?: (
            conversationId: string,
            references: FileMetadata[],
        ) => void,
    ): Promise<SendMessageResponseModel> {
        const conversation = await this.conversationModel.findById(
            model.conversationId,
        );

        if (!conversation) {
            return null;
        }

        const threadId = conversation.threadId;
        const conversationReferences = conversation.references;

        let conversationTitle: string;

        if (conversation.status === 'created') {
            conversationTitle = await new SimpleAgent(
                `You are an agent designed to create conversation titles.
                For each input, always and only respond with a short sentence
                that summarizes the topic of the conversation.
                Remember to always write the title in english.`,
            ).createCompletion(model.content);

            await this.conversationModel.updateOne(
                { _id: model.conversationId },
                {
                    title: conversationTitle,
                    updatedAt: new Date(),
                    status: 'active',
                },
            );

            conversationMetadataUpdateCallback &&
                conversationMetadataUpdateCallback({
                    _id: model.conversationId,
                    title: conversationTitle,
                    createdAt: conversation.createdAt,
                    updatedAt: conversation.updatedAt,
                    status: 'active',
                });
        } else {
            conversationTitle = conversation.title;
        }

        await this.messageModel.create({
            _id: uuidv4(),
            content: model.content,
            conversationId: model.conversationId,
            role: 'user',
        });

        const messageAddedToThread = streamingCallback
            ? await this.chatAssistant.addMessageToThreadByStream(
                  threadId,
                  model.content,
                  (
                      textSnapshot: string,
                      annotationsSnapshot: Annotation[],
                      finished: boolean,
                  ) => {
                      const prettifiedTextContent = this.prettifyText(
                          textSnapshot,
                          annotationsSnapshot,
                      );

                      streamingCallback(
                          model.conversationId,
                          prettifiedTextContent,
                          finished,
                      );
                  },
                  async (annotationsSnapshot: Annotation[]) => {
                      const decoratedAnnotations =
                          await this.decorateAnnotations(annotationsSnapshot);

                      referenceSnapshotCallback &&
                          referenceSnapshotCallback(
                              model.conversationId,
                              decoratedAnnotations,
                          );
                  },
              )
            : await this.chatAssistant.addMessageToThread(
                  threadId,
                  model.content,
              );

        const prettifiedTextContent = this.prettifyText(
            messageAddedToThread.content,
            messageAddedToThread.annotations,
        );

        const decoratedAnnotations = await this.decorateAnnotations(
            messageAddedToThread.annotations,
        );

        const updatedConversationReferences = [
            ...conversationReferences,
            ...decoratedAnnotations,
        ];

        streamingCallback &&
            streamingCallback(
                model.conversationId,
                prettifiedTextContent,
                true,
            );

        await this.conversationModel.updateOne(
            { _id: model.conversationId },
            {
                references: updatedConversationReferences,
            },
        );

        const response = await this.messageModel.create({
            _id: uuidv4(),
            content: prettifiedTextContent,
            conversationId: model.conversationId,
            role: 'assistant',
            references: decoratedAnnotations,
        });

        return new SendMessageResponseModel(
            response.id,
            response.content,
            response.role,
            response.conversationId,
            conversationTitle,
            updatedConversationReferences,
        );
    }

    private prettifyText(
        textContent: string,
        annotations: Annotation[],
    ): string {
        let prettifiedTextContent = textContent;

        for (const annotation of annotations)
            prettifiedTextContent = prettifiedTextContent.replaceAll(
                annotation.text,
                `[${annotation.file_citation.file_id}]`,
            );

        const distinctFileIds = this.getDistinticFileIds(annotations);

        distinctFileIds.forEach((fileId, index) => {
            prettifiedTextContent = prettifiedTextContent.replaceAll(
                `[${fileId}]`,
                `<sup>[${index + 1}]</sup>`,
            );
        });

        return prettifiedTextContent;
    }

    private async decorateAnnotations(
        annotations: Annotation[],
    ): Promise<FileMetadata[]> {
        const distinctFileIds = this.getDistinticFileIds(annotations);

        const decoratedAnnotations: FileMetadata[] = [];

        for (const fileId of distinctFileIds) {
            const fileMetadata = await this.fileMetadataModel.findOne({
                fileId,
            });

            decoratedAnnotations.push(fileMetadata);
        }

        return decoratedAnnotations;
    }

    private getDistinticFileIds(array: Annotation[]): string[] {
        const seen = new Set();
        return array
            .filter((item) => {
                const value = item.file_citation.file_id;
                if (seen.has(value)) {
                    return false;
                }
                seen.add(value);
                return true;
            })
            .map((item) => item.file_citation.file_id);
    }
}
