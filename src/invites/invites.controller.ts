import { Controller, Param, Post, UseGuards, Request, Body, Get, Delete, Put, Query } from '@nestjs/common';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import CreateInviteDto from './dto/create_invite.dto';
import { InvitesService } from './invites.service';
import { InviteDocument } from './schemas/invite.schema';

@Controller('invites')
export class InvitesController {
    constructor(private readonly invitesService: InvitesService) { }

    @UseGuards(AuthGuard)
    @Get()
    async getAllForUser(@Request() req, @Query('status') status?: string): Promise<InviteDocument[]> {
        return this.invitesService.getAllForUser(req.user.sub, status);
    }

    @UseGuards(AuthGuard)
    @Get('all')
    async getAll(): Promise<InviteDocument[]> {
        return this.invitesService.getAll();
    }

    @UseGuards(AuthGuard)
    @Post()
    async createInvite(@Request() req, @Body() createInviteDto: CreateInviteDto): Promise<void> {
        return this.invitesService.create(req.user.sub, createInviteDto);
    }

    @UseGuards(AuthGuard)
    @Put(':id/accept')
    async acceptInvite(@Param('id') id: string): Promise<void> {
        return this.invitesService.accept(id);
    }

    @UseGuards(AuthGuard)
    @Put(':id/reject')
    async rejectInvite(@Param('id') id: string): Promise<void> {
        return this.invitesService.reject(id);
    }

    @UseGuards(AuthGuard)
    @Delete(':id')
    async delete(@Param('id') id: string): Promise<void> {
        return this.invitesService.delete(id);
    }

    @UseGuards(AuthGuard)
    @Delete()
    async deleteAll(): Promise<void> {
        return this.invitesService.deleteAll();
    }
}
