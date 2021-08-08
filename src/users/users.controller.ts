import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { JoinRequestDto } from './dto/join.request.dto';
import { UsersService } from './users.service';
// path prefix
@Controller('api/users')
export class UsersController {
  // 필요한 객체 DI
  constructor(private usersService: UsersService) {}
  @Get()
  getUsers() {}

  @Post()
  postUsers(@Body() data: JoinRequestDto) {
    this.usersService.postUsers(data.email, data.nickname, data.password);
  }

  // sub path 세팅
  @Post('login')
  logIn() {}

  @Post('logout')
  logOut(@Req() req, @Res() res) {
    // express의 req, res를 그대로 가져와 사용 (express에 대한 강한 의존성 ~ 다른 플랫폼 도입시..)
    req.logOut();
    res.clearCookie('connect.sid', { httpOnly: true });
    res.send('ok');
  }
}
