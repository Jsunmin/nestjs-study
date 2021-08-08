import { Body, Controller, Get, Post, Param, Query } from '@nestjs/common';

@Controller('api/workspaces/:url/dms')
export class DmsController {
  @Get(':id/chats')
  // 원하는 요청객체의 데이터들을 데코레이터로 가져온다
  getChat(@Query() query, @Param() param) {
    console.log(query.perPage, query.page);
    console.log(param.id, param.url);
  }

  // 데이터를 규정하는 타입을 정의할 때, nest는 Interface X -> Class O
  @Post(':id/chats')
  postChat(@Body() body) {}
}
