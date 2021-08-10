import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from '../entities/Users';

@Module({
  imports: [TypeOrmModule.forFeature([Users])], // 해당 모듈에 Users 엔티티를 repository로 등록!
  providers: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
