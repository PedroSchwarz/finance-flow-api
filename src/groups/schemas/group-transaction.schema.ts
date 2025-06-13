import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { UserDocument } from 'src/users/schemas/user.schema';

export type GroupTransactionDocument = HydratedDocument<GroupTransaction>;

@Schema({ timestamps: true })
export class GroupTransaction {
    @Prop({ required: true })
    amount: number;

    @Prop({ required: true })
    type: string;

    @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
    owner: UserDocument;

    createdAt?: Date;

    updatedAt?: Date;
}

export const GroupTransactionSchema = SchemaFactory.createForClass(GroupTransaction);