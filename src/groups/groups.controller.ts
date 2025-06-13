import { Controller, Get, UseGuards, Request, Body, Post, Delete, Param, Put } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { GroupDocument } from './schemas/group.schema';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import CreateGroupDto from './dto/create_group.dto';
import UpdateGroupDto from './dto/update_group.dto';
import CreateGroupTransactionDto from './dto/create_group_transaction.dto';

@Controller('groups')
export class GroupsController {
    constructor(private readonly groupsService: GroupsService) { }

    @UseGuards(AuthGuard)
    @Get()
    async getAllForUser(@Request() req): Promise<GroupDocument[]> {
        return this.groupsService.getAllForUser(req.user.sub);
    }

    @UseGuards(AuthGuard)
    @Get('all')
    async getAll(): Promise<GroupDocument[]> {
        return this.groupsService.getAll();
    }

    @UseGuards(AuthGuard)
    @Get(':id')
    async getById(@Request() req, @Param('id') id: string): Promise<GroupDocument> {
        return this.groupsService.getById(req.user.sub, id);
    }

    @UseGuards(AuthGuard)
    @Post()
    async create(@Request() req, @Body() createGroupDto: CreateGroupDto): Promise<string> {
        return this.groupsService.create(req.user.sub, createGroupDto);
    }

    @UseGuards(AuthGuard)
    @Post(':id/member')
    async addMember(@Request() req, @Param('id') id: string): Promise<void> {
        return this.groupsService.addUser(id, req.user.sub);
    }

    @UseGuards(AuthGuard)
    @Post(':id/leave')
    async leaveGroup(@Request() req, @Param('id') id: string): Promise<void> {
        return this.groupsService.removeUser(id, req.user.sub);
    }

    @UseGuards(AuthGuard)
    @Post(':id/transaction')
    async addTransaction(@Request() req, @Param('id') id: string, @Body() createGroupTransactionDto: CreateGroupTransactionDto): Promise<void> {
        return this.groupsService.addTransaction(req.user.sub, id, createGroupTransactionDto);
    }

    @UseGuards(AuthGuard)
    @Put(':id')
    async updateGroup(@Param('id') id: string, @Body() updateGroupDto: UpdateGroupDto): Promise<void> {
        return this.groupsService.update(id, updateGroupDto);
    }

    @UseGuards(AuthGuard)
    @Delete(':id')
    async delete(@Param('id') id: string): Promise<void> {
        return this.groupsService.delete(id);
    }

    @UseGuards(AuthGuard)
    @Delete()
    async deleteAll(): Promise<void> {
        return this.groupsService.deleteAll();
    }
}
