import { Injectable, Optional } from '@nestjs/common';
import { ASSISTANT_DESCRIPTION } from 'src/constants/GptSetup';
import { Roles } from 'src/enum/gpt';
import ChatAgent from 'src/gpt/ChatAgent';
import GetConversationResponseModel from 'src/model/GetConversationResponseModel';
import InsertMessageRequestModel from 'src/model/InsertMessageRequestModel';
import InsertMessageResponseModel from 'src/model/InsertMessageResponseModel';
import { Message } from 'src/types/gpt';
import BaseService from './BaseService';

@Injectable()
export default class AssistantService extends BaseService {
  constructor(@Optional() private readonly chatAgent: ChatAgent = new ChatAgent(ASSISTANT_DESCRIPTION)) {
    super();
    this.chatAgent = chatAgent;
  }

  async getConversationById(id: string): Promise<GetConversationResponseModel> {
    const conversationMessages: Message[] =
      await this.prismaClient.message.findMany({ where: { conversationId: id } });

    const conversation = new GetConversationResponseModel(id, conversationMessages);

    return conversation;
  }

  async insertMessage(message: InsertMessageRequestModel): Promise<InsertMessageResponseModel> {
    const conversationMessages: Message[] =
      await this.prismaClient.message.findMany({ where: { conversationId: message.conversationId } });

    const newMessage: Message = await this.prismaClient.message.create({
      data: {
        content: message.content,
        conversationId: message.conversationId,
        role: Roles.USER
      }
    });

    conversationMessages.push(newMessage);

    const completion = await this.chatAgent.createCompletion(conversationMessages);

    const response: Message = await this.prismaClient.message.create({
      data: {
        content: completion,
        conversationId: message.conversationId,
        role: Roles.ASSISTANT
      }
    });

    return new InsertMessageResponseModel(
      response.id,
      response.content,
      response.role,
      response.conversationId
    );
  }
}
