import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Users } from '../entities/Users';
import { AuthService } from './auth.service';

@Injectable()
export class LocalSerializer extends PassportSerializer {
  constructor(
    private readonly authService: AuthService,
    @InjectRepository(Users) private usersRepository: Repository<Users>,
  ) {
    super();
  }

  // 어스 체크된 유저의 아이디를 세션에 저장
  serializeUser(user: Users, done: CallableFunction) {
    console.log(user);
    done(null, user.id); // user.id를 세션아이디로 저장함
  }

  // 세션에 저장된 아이디 바탕으로, 유저 정보 복원해서 전달함
  async deserializeUser(userId: string, done: CallableFunction) {
    return await this.usersRepository
      .findOneOrFail(
        {
          id: +userId,
        },
        {
          select: ['id', 'email', 'nickname'],
          relations: ['Workspaces'], // 연결된 테이블 데이터를 같이 가져옴
        },
      )
      .then((user) => {
        console.log('user', user);
        done(null, user);
      })
      .catch((error) => done(error));
  }
}
