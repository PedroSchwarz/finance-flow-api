import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Group, GroupDocument } from './schemas/group.schema';
import { Model } from 'mongoose';
import CreateGroupDto from './dto/create_group.dto';
import UpdateGroupDto from './dto/update_group.dto';
import { InvitesService } from 'src/invites/invites.service';
import CreateGroupTransactionDto from './dto/create_group_transaction.dto';

@Injectable()
export class GroupsService {
    constructor(
        @InjectModel(Group.name) private groupModel: Model<Group>,
        private readonly invitesService: InvitesService
    ) { }

    async getAll(): Promise<GroupDocument[]> {
        return this.groupModel.find({}).exec();
    }

    async getAllForUser(userId: string): Promise<GroupDocument[]> {
        return this.groupModel.find({ members: userId }).populate(['members', 'owner']).exec();
    }

    async getById(userId: string, id: string): Promise<GroupDocument> {
        const group = await this.groupModel.findOne({ _id: id, members: userId }).populate(['members', 'owner']).exec();

        if (!group) {
            throw new NotFoundException();
        }

        return group;
    }

    async create(userId: string, createGroupDto: CreateGroupDto): Promise<string> {
        const group = {
            name: createGroupDto.name,
            description: createGroupDto.description,
            owner: userId,
            members: [userId],
        }
        const createdGroup = new this.groupModel(group);
        await createdGroup.save();
        return createdGroup.id;
    }

    async update(id: string, updateGroupDto: UpdateGroupDto) {
        const group = { ...updateGroupDto };

        await this.groupModel.findByIdAndUpdate(id, group).exec();
    }

    async addTransaction(userId: string, groupId: string, createGroupTransactionDto: CreateGroupTransactionDto): Promise<void> {
        await this.groupModel.findByIdAndUpdate(groupId, {
            $push: {
                transactions: {
                    amount: createGroupTransactionDto.amount,
                    owner: userId,
                }
            }
        }).exec();
    }

    async removeTransaction(userId: string, groupId: string, transactionId: string): Promise<void> {
        await this.groupModel.findByIdAndUpdate(groupId, {
            $pull: {
                transactions: {
                    _id: transactionId,
                    owner: userId,
                }
            }
        }).exec();
    }

    async addUser(groupId: string, userId: string): Promise<void> {
        await this.groupModel.findByIdAndUpdate(groupId, { $push: { members: userId } }).exec();
    }

    async removeUser(groupId: string, userId: string): Promise<void> {
        await this.groupModel.findByIdAndUpdate(groupId, { $pull: { members: userId } }).exec();
        // await this.tasksService.deleteAllForUserOnGroup(groupId, userId);
    }

    async delete(id: string): Promise<void> {
        await this.groupModel.findByIdAndDelete(id).exec();
        // await this.tasksService.deleteAllForGroup(id);
        await this.invitesService.deleteAllForGroup(id);
    }

    async deleteAll(): Promise<void> {
        await this.groupModel.deleteMany({}).exec();
    }
}
