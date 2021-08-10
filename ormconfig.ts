import * as dotenv from 'dotenv';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ChannelChats } from './src/entities/ChannelChats';
import { ChannelMembers } from './src/entities/ChannelMembers';
import { Channels } from './src/entities/Channels';
import { DMs } from './src/entities/DMs';
import { Mentions } from './src/entities/Mentions';
import { Users } from './src/entities/Users';
import { WorkspaceMembers } from './src/entities/WorkspaceMembers';
import { Workspaces } from './src/entities/Workspaces';

dotenv.config();
const config: TypeOrmModuleOptions = {
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  // entities: ['entities/**'], // autoLoadEntities: true
  entities: [
    ChannelChats,
    ChannelMembers,
    Channels,
    DMs,
    Mentions,
    Users,
    WorkspaceMembers,
    Workspaces,
  ],
  autoLoadEntities: true,
  synchronize: false, // 서버 -> 디비 싱크 (처음에만 true! ~ 데이터 날아감..)
  logging: true, // 개발시 ORM 쿼리로그를 보고 ~ 튜닝을 해야함!
  keepConnectionAlive: true, // DB 연결 끝내지 않도록!
};

export = config;
