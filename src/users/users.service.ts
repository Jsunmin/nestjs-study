import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import bcrypt from 'bcrypt';
import { Users } from '../entities/Users';
import { WorkspaceMembers } from 'src/entities/WorkspaceMembers';
import { ChannelMembers } from 'src/entities/ChannelMembers';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private usersRepository: Repository<Users>,
    @InjectRepository(WorkspaceMembers)
    private workspaceMembersRepository: Repository<WorkspaceMembers>,
    @InjectRepository(ChannelMembers)
    private channelMembersRepository: Repository<ChannelMembers>,
    // typeorm 트랜잭션을 위한 객체 주입 ~DI를 고수하자! 바로 module import ㄴㄴ
    private dbConnection: Connection,
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

    const queryRunner = this.dbConnection.createQueryRunner(); // 쿼리 빌더와 별개!
    try {
      await queryRunner.connect(); // 트랜잭션을 위한 별도의 연결 생성
      await queryRunner.startTransaction();

      // 트랜잭션을 위한 커넥션에서 요청을 해야, 트랜잭션 아이디를 공유한다!
      // const user = await this.usersRepository.findOne({ where: { email } });
      const user = await queryRunner.manager
        .getRepository(Users)
        .findOne({ where: { email } });
      if (user) {
        // 이렇게 에러만 정의하면 예외 처리가 잘 안됨 ~ 캐치해주는 프로세스가 필요!
        throw new UnauthorizedException('이미 존재하는 사용자입니다.');
      }
      const hashedPassword = await bcrypt.hash(password, 12);
      // const reutrned = await this.usersRepository.save({
      const reutrned = await queryRunner.manager.getRepository(Users).save({
        email,
        nickname,
        password: hashedPassword,
      });

      // ActiveRecord
      // const workspaceMember = new WorkspaceMembers();
      // workspaceMember.UserId = reutrned.id;
      // DataMapper
      // const workspaceMember = this.workspaceMembersRepository.create({ UserId: reutrned.id });

      // await this.workspaceMembersRepository.save({
      await queryRunner.manager.getRepository(WorkspaceMembers).save({
        UserId: reutrned.id,
        WorkspaceId: 1,
      });
      // await this.channelMembersRepository.save({
      await queryRunner.manager.getRepository(ChannelMembers).save({
        UserId: reutrned.id,
        ChannelId: 1,
      });

      // 이런 디비 write 작업이 복수개면 트랜잭션 필요!!
      // typeorm 에서는 몇가지 방법들이 존재함.. connection, decorator, querybuilder..
      // 공식문서에서는 queryRunner만 쓰라고 함 (데코레이터쓰면 DI 애매..)

      await queryRunner.commitTransaction();
      return true;
    } catch (err) {
      console.error(err);
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release(); // 연결 끊어줌 ~ 디비 연결풀 관리!
    }
  }
}
