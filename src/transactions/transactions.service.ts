import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Transaction, TransactionDocument } from './schemas/transaction.schema';
import { Model } from 'mongoose';
import CreateTransactionDto from './dto/create_transaction.dto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class TransactionsService {
    constructor(
        @InjectModel(Transaction.name) private transactionModel: Model<Transaction>,
        private readonly usersService: UsersService,
    ) { }

    async getAll(): Promise<TransactionDocument[]> {
        return this.transactionModel.find({}).exec();
    }

    async getAllForUser(userId: string): Promise<TransactionDocument[]> {
        return this.transactionModel.find({ owner: userId }).populate('owner').exec();
    }

    async getById(id: string): Promise<TransactionDocument> {
        const transaction = await this.transactionModel.findOne({ _id: id }).populate('owner').exec();

        if (!transaction) {
            throw new NotFoundException();
        }

        return transaction;
    }

    async create(userId: string, createTransactionDto: CreateTransactionDto): Promise<string> {
        const transaction = {
            title: createTransactionDto.title,
            description: createTransactionDto.description,
            amount: createTransactionDto.amount,
            type: createTransactionDto.type,
            owner: userId,
        }
        const transactionGroup = new this.transactionModel(transaction);
        await transactionGroup.save();

        await this.usersService.updateUserBalance(userId, { amount: createTransactionDto.type === 'income' ? createTransactionDto.amount : -createTransactionDto.amount });

        return transactionGroup.id;
    }

    // async update(id: string, updateGroupDto: UpdateGroupDto) {
    //     const group = { ...updateGroupDto };

    //     await this.groupModel.findByIdAndUpdate(id, group).exec();
    // }

    async delete(userId: string, id: string): Promise<void> {
        const transaction = await this.transactionModel.findOne({ _id: id }).populate('owner').exec();

        if (!transaction) {
            throw new NotFoundException();
        }

        await this.usersService.updateUserBalance(userId, { amount: transaction.type === 'income' ? -transaction.amount : transaction.amount });
        await this.transactionModel.findByIdAndDelete(id).exec();
    }

    async deleteAll(): Promise<void> {
        await this.transactionModel.deleteMany({}).exec();
    }
}
