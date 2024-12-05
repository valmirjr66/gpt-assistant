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
import AssistantService from './AssistantService';
import SendMessageRequestDto from './dto/SendMessageRequestDto';
import SendMessageRequestModel from './model/SendMessageRequestModel';
import { Annotation, Conversation } from 'src/types/gpt';

@WebSocketGateway({ cors: true })
export class AssistantGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
    constructor(private readonly assistantService: AssistantService) {}

    @WebSocketServer() server: Server;
    private logger: Logger = new Logger('AssistantGateway');

    @SubscribeMessage('message')
    handleMessage(client: Socket, payload: SendMessageRequestDto): void {
        this.logger.log(`Handling message from client: ${client.id}`);

        const messageModel = new SendMessageRequestModel(
            client.handshake.headers.userid as string,
            payload.content,
            payload.conversationId,
        );

        const streamingCallback = (
            conversationId: string,
            textSnapshot: string,
            annotationsSnapshot: Annotation[],
            finished: boolean,
        ) => {
            this.server.emit('message', {
                conversationId,
                textSnapshot,
                annotationsSnapshot,
                finished,
            });
        };

        const newConversationCallback = (
            conversation: Omit<Conversation, 'messages'>,
        ) => this.server.emit('newConversation', conversation);

        this.assistantService.sendMessage(
            messageModel,
            streamingCallback,
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
