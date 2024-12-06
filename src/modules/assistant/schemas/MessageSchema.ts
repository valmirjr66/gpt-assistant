import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Role } from 'src/types/gpt';
import { BaseSchema } from '../../../BaseSchema';
import { FileMetadata } from './FileMetadataSchema';

export type MessageDocument = HydratedDocument<Message>;

@Schema({ timestamps: true })
export class Message extends BaseSchema {
    @Prop({ required: true })
    content: string;

    @Prop({ required: true })
    role: Role;

    @Prop({ required: true })
    conversationId: string;

    @Prop()
    references: FileMetadata[];
}

export const MessageSchema = SchemaFactory.createForClass(Message);
