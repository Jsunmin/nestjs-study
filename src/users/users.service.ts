import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import bcrypt from 'bcrypt';
import { Users } from '../entities/Users';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private usersRepository: Repository<Users>,
  ) {}

  getUser() {}

  async postUsers(email: string, nickname: string, password: string) {
    // 이렇게 에러만 정의하면 예외 처리가 잘 안됨 ~ 캐치해주는 프로세스가 필요!
    if (!email) {
      throw new HttpException('이메일이 없습니다', 400);
    } else if (!nickname) {
      throw new HttpException('닉네임이 없습니다', 400);
    } else if (!password) {
      throw new HttpException('비밀번호가 없습니다', 400);
    }
    const user = await this.usersRepository.findOne({ where: { email } });
    if (user) {
      throw new Error('이미 존재하는 사용자입니다.');
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    await this.usersRepository.save({
      email,
      nickname,
      password: hashedPassword,
    });
  }
}
