import { Prop } from '@nestjs/mongoose';

export abstract class BaseSchema {
    @Prop({ required: true })
    _id: string;

    @Prop()
    createdAt: Date;

    @Prop()
    updatedAt: Date;
}
