import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('CHANNEL')
@Controller('api/workspaces/:url/channels')
export class ChannelsController {
  @Get()
  getChannels() {}

  @Post()
  createChannels() {}

  @Get(':name')
  getSpecificChannel(@Param('name') name: string) {}

  @Get(':name/chats')
  getChats() {}

  @Post(':name/chats')
  postChat() {}

  @Get(':name/members')
  getAllmembers() {}

  @Post(':name/members')
  invitemembers() {}
}
