import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { BaseSchema } from '../../../BaseSchema';

export type FileMetadataDocument = HydratedDocument<FileMetadata>;

@Schema({ timestamps: true })
export class FileMetadata extends BaseSchema {
    @Prop({ required: true })
    fileId: string;

    @Prop({ required: true })
    downloadURL: string;

    @Prop({ required: true })
    displayName: string;

    @Prop({ required: true })
    previewImageURL: string;
}

export const FileMetadataSchema = SchemaFactory.createForClass(FileMetadata);
