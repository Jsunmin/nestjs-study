import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  ParseIntPipe,
  ParseArrayPipe,
  Body,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { User } from 'src/common/decorator/user.decorator';
import { Users } from 'src/entities/Users';
import { CreateWrokspaceDto } from './dto/create-worksapce.dto';
import { WorkspacesService } from './workspaces.service';

@ApiTags('WORKSPACE')
@Controller('api/workspaces')
export class WorkspacesController {
  constructor(private workspacesService: WorkspacesService) {}

  @Get()
  getMyWorkspaces(
    // req에서 user 정보를 가져오는 커스텀 데코레이터를 사용! ~ 커스텀 데코레이터에서 플랫폼에 따른 request 객체 조절!
    @User() user: Users,
  ) {
    return this.workspacesService.findMyWorkspaces(user.id);
  }

  @Post('/:myId')
  createMyWorkspace(
    // myId는 타입은 number지만, runtime시에는 string...
    // 원하는 타입에 맞춘 형변환을 위해서 pipe를 사용하자! (또는 글로벌 app에 파이프 붙일때 transform 조건 true! )
    // @Param('myId', ParseIntPipe) myId: number,

    // 커스텀 데코레이터로 유저 아이디 겟
    @User() user: Users,
    @Body() body: CreateWrokspaceDto,

    // cf. 기본값 그대로 쓰면, Class 그대로 내려주고, 옵션 커스터마이징하면 옵셔을 내려준 인스턴스 객체로 쓰자!
    // @Param('keys', new ParseArrayPipe({ items: Number, separator: ',' }))
    // keys: number[],
  ) {
    // [1,2,3]
    return this.workspacesService.findMyWorkspaces(user.id);
  }

  @Get(':url/members')
  getAllMembersFromWorkspace() {}

  @Post(':url/members')
  inviteMembersToWorkspace() {}

  @Delete(':url/members/:id')
  kickMembersFromWorkspace() {}

  @Get(':url/members/:id')
  getMemberInfoInWorkspace() {}

  @Get(':url/uesrs/:id')
  DEPRECATED_getMemberInfoInWorkspace() {
    this.getMemberInfoInWorkspace();
  }
}
