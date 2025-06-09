import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Invite, InviteDocument } from './schemas/invite.schema';
import { Model } from 'mongoose';
import CreateInviteDto from './dto/create_invite.dto';

@Injectable()
export class InvitesService {
    constructor(@InjectModel(Invite.name) private inviteModel: Model<Invite>) { }

    async getAll(): Promise<InviteDocument[]> {
        return this.inviteModel.find({}).populate(['to', 'from', 'group']).exec();
    }

    async getAllForUser(userId: string, status: string = 'all'): Promise<InviteDocument[]> {
        if (status === 'all') {
            return this.inviteModel.find({ to: userId }).populate(['from', 'group']).exec();
        }

        return (await this.inviteModel.find({ to: userId }).populate(['from', 'group']).exec()).filter(invite => invite.status === status);
    }

    async create(userId: string, createInviteDto: CreateInviteDto): Promise<void> {
        const invite = {
            from: userId,
            to: createInviteDto.to,
            group: createInviteDto.groupId,
        }
        const createdInvite = new this.inviteModel(invite);
        await createdInvite.save();
    }

    async accept(id: string): Promise<void> {
        await this.inviteModel.findByIdAndUpdate(id, { status: 'accepted' }).exec();
    }

    async reject(id: string): Promise<void> {
        await this.inviteModel.findByIdAndUpdate(id, { status: 'rejected' }).exec();
    }

    async delete(id: string): Promise<void> {
        await this.inviteModel.findByIdAndDelete(id).exec();
    }

    async deleteAllForGroup(groupId: string): Promise<void> {
        await this.inviteModel.deleteMany({ group: groupId }).exec();
    }

    async deleteAll(): Promise<void> {
        await this.inviteModel.deleteMany({}).exec();
    }
}
