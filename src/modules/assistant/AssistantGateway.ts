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

@WebSocketGateway({ cors: true })
export class AssistantGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
    constructor(private readonly assistantService: AssistantService) {}

    @WebSocketServer() server: Server;
    private logger: Logger = new Logger('ChatGateway');

    @SubscribeMessage('message')
    handleMessage(client: Socket, payload: SendMessageRequestDto): void {
        this.logger.log(`Handling message from client: ${client.id}`);

        const messageModel = new SendMessageRequestModel(
            client.handshake.headers.userid as string,
            payload.content,
            payload.conversationId,
        );

        this.assistantService.sendMessage(
            messageModel,
            (conversationId: string, snapshot: string, finished: boolean) => {
                this.server.emit('message', {
                    conversationId,
                    snapshot,
                    finished,
                });
            },
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
