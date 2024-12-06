import { Prop } from '@nestjs/mongoose';

export abstract class BaseSchema {
    @Prop()
    createdAt: Date;

    @Prop()
    updatedAt: Date;
}
