import { Logger } from '@nestjs/common';
import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SimplifiedConversation } from 'src/types/gpt';
import AssistantService from './AssistantService';
import ConversationHandshakeRequestPayload from './events/payloads/ConversationHandshakeRequestPayload';
import SendMessageRequestPayload from './events/payloads/SendMessageRequestPayload';
import SendMessageRequestModel from './model/SendMessageRequestModel';
import { FileMetadata } from './schemas/FileMetadataSchema';

@WebSocketGateway({ cors: true })
export class AssistantGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
    constructor(private readonly assistantService: AssistantService) {}

    @WebSocketServer() server: Server;
    private logger: Logger = new Logger('AssistantGateway');

    @SubscribeMessage('message')
    handleMessage(client: Socket, payload: SendMessageRequestPayload): void {
        this.logger.log(`Handling message from client: ${client.id}`);

        const messageModel = new SendMessageRequestModel(
            client.handshake.headers.userid as string,
            payload.content,
            payload.conversationId,
        );

        const streamingCallback = (
            conversationId: string,
            textSnapshot: string,
            finished: boolean,
        ) => {
            this.server.emit('message', {
                conversationId,
                textSnapshot,
                finished,
            });
        };

        const conversationMetadataUpdateCallback = (
            conversation: SimplifiedConversation,
        ) => this.server.emit('conversationMetadataUpdate', conversation);

        const referenceSnapshotCallback = (
            conversationId: string,
            references: FileMetadata[],
        ) =>
            this.server.emit('referencesSnapshot', {
                conversationId,
                references,
            });

        this.assistantService.sendMessage(
            messageModel,
            streamingCallback,
            conversationMetadataUpdateCallback,
            referenceSnapshotCallback,
        );
    }

    @SubscribeMessage('conversationHandshake')
    handleHandshake(
        client: Socket,
        payload: ConversationHandshakeRequestPayload,
    ): void {
        this.logger.log(
            `Handling conversation handshake from client: ${client.id}`,
        );

        const newConversationCallback = (
            conversation: SimplifiedConversation,
        ) => this.server.emit('newConversation', conversation);

        this.assistantService.conversationHandshake(
            client.handshake.headers.userid as string,
            payload.conversationId,
            newConversationCallback,
        );
    }

    afterInit() {
        this.logger.log('Init');
    }

    handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }
}
