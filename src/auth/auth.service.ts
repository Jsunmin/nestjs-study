import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { Users } from '../entities/Users';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Users) private usersPrepository: Repository<Users>,
  ) {}

  // 이메일로 유저 찾고, passrow 체크
  async validateUser(email: string, password: string) {
    const user = await this.usersPrepository.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'nickname'],
    });
    console.log(email, password, user);

    if (!user) {
      return null;
    }
    const result = await bcrypt.compare(password, user.password);
    if (result) {
      // 구조분해 할당 & rest를 통해, password 걷어낸 객체 리턴!! ~ delete xxx 보다 낫지?!
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
  }
}
