import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { UserDocument } from 'src/users/schemas/user.schema';
import { GroupTransaction } from './group-transaction.schema';

export type GroupDocument = HydratedDocument<Group>;

@Schema({ timestamps: true })
export class Group {
    @Prop({ required: true })
    name: string;

    @Prop()
    description: string;

    @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], default: [] })
    members: UserDocument[];

    @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
    owner: UserDocument;

    @Prop({ default: 0 })
    balance: number;

    @Prop({ type: [GroupTransaction], default: [] })
    transactions: GroupTransaction[];
}

export const GroupSchema = SchemaFactory.createForClass(Group);