import { Injectable, UnauthorizedException } from '@nestjs/common';
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
    // entity 검증은 직접 할 수 있으나, class-validator pipe로도 쉽게 할 수 있다!
    // if (!email) {
    //   throw new BadRequestException('이메일이 없습니다');
    // } else if (!nickname) {
    //   throw new BadRequestException('닉네임이 없습니다');
    // } else if (!password) {
    //   throw new BadRequestException('비밀번호가 없습니다');
    // }
    const user = await this.usersRepository.findOne({ where: { email } });
    if (user) {
      // 이렇게 에러만 정의하면 예외 처리가 잘 안됨 ~ 캐치해주는 프로세스가 필요!
      throw new UnauthorizedException('이미 존재하는 사용자입니다.');
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    await this.usersRepository.save({
      email,
      nickname,
      password: hashedPassword,
    });
  }
}
