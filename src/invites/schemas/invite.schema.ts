import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Group } from 'src/groups/schemas/group.schema';
import { User } from 'src/users/schemas/user.schema';

export type InviteDocument = HydratedDocument<Invite>;

@Schema({ timestamps: true })
export class Invite {
    @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
    from: User;

    @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User' })
    to: User;

    @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'Group' })
    group: Group;

    @Prop({ required: true, default: 'pending' })
    status: string;
}

export const InviteSchema = SchemaFactory.createForClass(Invite);