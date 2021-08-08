import { Controller, Get, Post, Body } from '@nestjs/common';

@Controller('api/workspaces/:url/channels')
export class ChannelsController {
  @Get()
  getChannels() {}

  @Post()
  createChannels() {}

  @Get('name')
  getSpecificChannel() {}

  @Get(':name/chats')
  getChats(@Body body) {}

  @Post(':name/chats')
  postChat(@Body body) {}

  @Get(':name/members')
  getAllmembers(@Body() body) {}

  @Post(':name/members')
  invitemembers(@Body() body) {}
}
