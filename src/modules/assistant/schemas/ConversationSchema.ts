import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseSchema } from '../../../BaseSchema';
import { FileMetadata } from './FileMetadataSchema';

export type ConversationDocument = HydratedDocument<Conversation>;

@Schema({ timestamps: true })
export class Conversation extends BaseSchema {
    @Prop({ required: true })
    userId: string;

    @Prop()
    threadId: string;

    @Prop({ required: true })
    title: string;

    @Prop({ default: false })
    archived: boolean;

    @Prop()
    references: FileMetadata[];
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
