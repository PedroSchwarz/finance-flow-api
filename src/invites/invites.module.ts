import { Module } from '@nestjs/common';
import { InvitesService } from './invites.service';
import { InvitesController } from './invites.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Invite, InviteSchema } from './schemas/invite.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Invite.name, schema: InviteSchema }])],
  providers: [InvitesService],
  exports: [InvitesService],
  controllers: [InvitesController],
})
export class InvitesModule { }
