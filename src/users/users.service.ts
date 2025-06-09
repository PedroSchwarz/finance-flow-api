import { Injectable, NotFoundException } from '@nestjs/common';
import RegisterDto from 'src/auth/dto/register.dto';
import * as bcrypt from 'bcrypt';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Model } from 'mongoose';
import UpdateBalanceDto from './dto/update_balance.dto';

@Injectable()
export class UsersService {
    constructor(@InjectModel(User.name) private userModel: Model<User>) { }

    async findAll(): Promise<UserDocument[]> {
        return this.userModel.find({}).select('-password').exec();
    }

    async findAllForUser(userId: string): Promise<UserDocument[]> {
        return (await this.userModel.find({}).select('-password').exec()).filter((user) => user.id !== userId);
    }

    async getUserBalance(userId: string): Promise<number> {
        const foundUser = await this.userModel.findById(userId);

        if (!foundUser) {
            throw new NotFoundException();
        }

        return foundUser.balance;
    }

    async updateUserBalance(userId: string, updateBalanceDto: UpdateBalanceDto): Promise<void> {
        const { amount } = updateBalanceDto;
        await this.userModel.findByIdAndUpdate(userId, { $inc: { balance: amount } });
    }

    async findOneByEmail(email: string): Promise<UserDocument | undefined | null> {
        return this.userModel.findOne({ email }).exec();
    }

    async findOneById(id: string): Promise<UserDocument> {
        const foundUser = await this.userModel.findById(id).select('-password').exec();

        if (!foundUser) {
            throw new NotFoundException();
        }

        return foundUser;
    }

    async updateDeviceToken(userId: string, token: string): Promise<void> {
        await this.userModel.findByIdAndUpdate(userId, { deviceToken: token });
        return;
    }

    async create(registerDto: RegisterDto): Promise<UserDocument> {
        const hashedPassword = await bcrypt.hash(registerDto.password, 10);

        const user = {
            firstName: registerDto.firstName,
            lastName: registerDto.lastName,
            email: registerDto.email,
            balance: registerDto.balance,
            password: hashedPassword,
        };

        const createdUser = new this.userModel(user);
        return createdUser.save();
    }

    async delete(id: string): Promise<void> {
        await this.userModel.findByIdAndDelete(id).exec();
    }

    async deleteAll(): Promise<void> {
        await this.userModel.deleteMany({}).exec();
    }
}
