import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Group, GroupDocument } from './schemas/group.schema';
import { Model } from 'mongoose';
import CreateGroupDto from './dto/create_group.dto';
import UpdateGroupDto from './dto/update_group.dto';
import { InvitesService } from 'src/invites/invites.service';
import CreateGroupTransactionDto from './dto/create_group_transaction.dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class GroupsService {
    constructor(
        @InjectModel(Group.name) private groupModel: Model<Group>,
        private readonly invitesService: InvitesService,
        private readonly usersService: UsersService,
    ) { }

    async getAll(): Promise<GroupDocument[]> {
        return this.groupModel.find({}).exec();
    }

    async getAllForUser(userId: string): Promise<GroupDocument[]> {
        return this.groupModel.find({ members: userId }).populate(
            ['members', 'owner', {
                path: 'transactions',
                populate: { path: 'owner' }
            },]
        ).exec();
    }

    async getById(userId: string, id: string): Promise<GroupDocument> {
        const group = await this.groupModel.findOne({ _id: id, members: userId }).populate(['members', 'owner', {
            path: 'transactions',
            populate: { path: 'owner' }
        }]).exec();

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
            $inc: { balance: createGroupTransactionDto.type == 'income' ? createGroupTransactionDto.amount : -createGroupTransactionDto.amount },
            $push: {
                transactions: {
                    amount: createGroupTransactionDto.amount,
                    type: createGroupTransactionDto.type,
                    owner: userId,
                }
            }
        }).exec();

        await this.usersService.updateUserBalance(userId, { amount: createGroupTransactionDto.type == 'income' ? -createGroupTransactionDto.amount : createGroupTransactionDto.amount });
    }

    async addUser(groupId: string, userId: string): Promise<void> {
        await this.groupModel.findByIdAndUpdate(groupId, { $push: { members: userId } }).exec();
    }

    async removeUser(groupId: string, userId: string): Promise<void> {
        const group = await this.groupModel.findById(groupId).exec();

        if (!group) {
            throw new NotFoundException();
        }

        const transactions = group.transactions.filter(transaction => transaction.owner.toString() === userId);

        const depositedAmount = transactions.reduce((total, transaction) => total + (transaction.type === 'income' ? transaction.amount : -transaction.amount), 0);

        await this.groupModel.findByIdAndUpdate(groupId, {
            $inc: { balance: -depositedAmount }, $push: {
                transactions: {
                    amount: depositedAmount,
                    type: 'expense',
                    owner: userId,
                }
            }, $pull: { members: userId }
        }).exec();

        await this.usersService.updateUserBalance(userId, { amount: depositedAmount });
    }

    async delete(id: string): Promise<void> {
        const group = await this.groupModel.findById(id).exec();

        if (!group) {
            throw new NotFoundException();
        }

        await Promise.all(
            group.members.map(async (member) => {
                const transactions = group.transactions.filter(
                    (transaction) => transaction.owner.id.toString() === member.id.toString()
                );

                const depositedAmount = transactions.reduce((total, transaction) => total + (transaction.type === 'income' ? transaction.amount : -transaction.amount), 0);

                if (depositedAmount !== 0) {
                    await this.usersService.updateUserBalance(member.toString(), {
                        amount: depositedAmount,
                    });
                }
            })
        );

        await this.invitesService.deleteAllForGroup(id);
        await this.groupModel.findByIdAndDelete(id).exec();
    }

    async deleteAll(): Promise<void> {
        await this.groupModel.deleteMany({}).exec();
    }
}
