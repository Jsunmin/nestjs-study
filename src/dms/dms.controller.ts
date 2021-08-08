import { Body, Controller, Get, Post, Param, Query } from '@nestjs/common';
import { ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('DM') // 하위 URL을 그룹핑
@Controller('api/workspaces/:url/dms')
export class DmsController {
  @ApiParam({
    name: 'id',
    required: true,
    description: '사용자 아이디',
    example: 'min',
  })
  @ApiParam({
    name: 'url',
    required: true,
    description: '워크스페이스 주소',
    example: 'Xqe131q2',
  })
  @ApiQuery({
    name: 'perPage',
    required: true,
    description: '한 번에 가져오는 개수',
    example: 20,
  })
  @ApiQuery({
    name: 'page',
    required: true,
    description: '불러올 페이지',
    example: 0,
  })
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
