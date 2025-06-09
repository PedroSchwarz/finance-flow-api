import { Controller, Get, UseGuards, Request, Body, Post, Delete, Param, Put } from '@nestjs/common';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { TransactionsService } from './transactions.service';
import { TransactionDocument } from './schemas/transaction.schema';
import CreateTransactionDto from './dto/create_transaction.dto';

@Controller('transactions')
export class TransactionsController {
    constructor(private readonly transactionsService: TransactionsService) { }

    @UseGuards(AuthGuard)
    @Get()
    async getAllForUser(@Request() req): Promise<TransactionDocument[]> {
        return this.transactionsService.getAllForUser(req.user.sub);
    }

    @UseGuards(AuthGuard)
    @Get('all')
    async getAll(): Promise<TransactionDocument[]> {
        return this.transactionsService.getAll();
    }

    @UseGuards(AuthGuard)
    @Get(':id')
    async getById(@Param('id') id: string): Promise<TransactionDocument> {
        return this.transactionsService.getById(id);
    }

    @UseGuards(AuthGuard)
    @Post()
    async create(@Request() req, @Body() createTransactionDto: CreateTransactionDto): Promise<string> {
        return this.transactionsService.create(req.user.sub, createTransactionDto);
    }

    // @UseGuards(AuthGuard)
    // @Put(':id')
    // async updateGroup(@Param('id') id: string, @Body() updateGroupDto: UpdateGroupDto): Promise<void> {
    //     return this.transactionsService.update(id, updateGroupDto);
    // }

    @UseGuards(AuthGuard)
    @Delete(':id')
    async delete(@Request() req, @Param('id') id: string): Promise<void> {
        return this.transactionsService.delete(req.user.sub, id);
    }

    @UseGuards(AuthGuard)
    @Delete()
    async deleteAll(): Promise<void> {
        return this.transactionsService.deleteAll();
    }
}
