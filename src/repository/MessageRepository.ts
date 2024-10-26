import { Injectable } from '@nestjs/common';
import BaseRepository from './BaseRepository';
import InsertMessageResponseModel from 'src/model/InsertMessageResponseModel';
import InsertMessageRequestModel from 'src/model/InsertMessageRequestModel';

@Injectable()
export default class MessageRepository extends BaseRepository {
  constructor() {
    super();
  }

  async getMessageById(id: string): Promise<InsertMessageResponseModel> {
    return await this.prisma.message.findUnique({ where: { id: id } });
  }

  async getMessagesByConversation(
    conversationId: string,
  ): Promise<InsertMessageResponseModel[]> {
    return await this.prisma.message.findMany({
      where: { conversationId: conversationId },
    });
  }

  async insertMessage(
    message: InsertMessageRequestModel,
  ): Promise<InsertMessageResponseModel> {
    return await this.prisma.message.create({ data: message });
  }
}
