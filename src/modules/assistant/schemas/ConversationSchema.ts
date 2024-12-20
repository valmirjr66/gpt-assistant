import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseSchema } from '../../../BaseSchema';
import { FileMetadata } from './FileMetadataSchema';
import { ConversationStatus } from 'src/types/gpt';

export type ConversationDocument = HydratedDocument<Conversation>;

@Schema({ timestamps: true })
export class Conversation extends BaseSchema {
    @Prop({ required: true })
    userId: string;

    @Prop({ required: true })
    threadId: string;

    @Prop({ required: true })
    title: string;

    @Prop()
    references: FileMetadata[];

    @Prop({ required: true })
    status: ConversationStatus;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
