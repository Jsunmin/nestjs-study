import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JoinRequestDto } from './dto/join.request.dto';
import { UsersService } from './users.service';
import { ApiTags } from '@nestjs/swagger';
import { UserDto } from 'src/common/dto/user.dto';
import { User } from 'src/common/decorator/user.decorator';
import { UndefinedToNullInterceptor } from 'src/common/interceptors/undefinedToNull.interceptor';

// 리턴값을 잡아 undefined -> null화 해주는 인터셉터를 /users 컨트롤러에 전체 적용함! 물론 개별 라우터 적용도 가능
@UseInterceptors(UndefinedToNullInterceptor)
@ApiTags('USER')
// path prefix
@Controller('api/users')
export class UsersController {
  // 필요한 객체 DI
  constructor(private usersService: UsersService) {}

  @ApiResponse({
    type: UserDto,
  })
  @ApiOperation({ summary: '내 정보 조회' }) // 스웨거 정보 기입
  @Get()
  getUsers(@User() user) {
    // req.user를 가져오는 커스텀 데코레이터로 요청객체의 특정 정보 가져온다
    return user;
  }

  @ApiOperation({ summary: '회원가입' })
  // @UseInterceptors ~ 적용 가능
  @Post()
  postUsers(@Body() data: JoinRequestDto) {
    this.usersService.postUsers(data.email, data.nickname, data.password);
  }

  // 스웨거 응답 타입 및 케이스 정의
  @ApiResponse({
    type: UserDto,
    status: 200,
    description: '성공',
  })
  @ApiResponse({
    status: 500,
    description: '서버 에러',
  })
  @ApiOperation({ summary: '로그인' })
  @Post('login') // sub path 세팅
  logIn(@User() user) {
    return user;
  }

  @ApiOperation({ summary: '로그아웃' })
  @Post('logout')
  logOut(@Req() req, @Res() res) {
    // express의 req, res를 그대로 가져와 사용 (express에 대한 강한 의존성 ~ 다른 플랫폼 도입시..)
    req.logOut();
    res.clearCookie('connect.sid', { httpOnly: true });
    res.send('ok');
  }
}
