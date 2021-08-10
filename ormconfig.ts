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
  // 마이그레이션 관련 세팅
  migrations: [__dirname + '/src/migrations/*.ts'],
  cli: { migrationsDir: 'src/migrations' },
  autoLoadEntities: true,
  synchronize: false, // 서버 -> 디비 싱크 (데이터 날아가는 이슈.. prd X)
  logging: true, // 개발시 ORM 쿼리로그를 보고 ~ 튜닝을 해야함!
  keepConnectionAlive: true, // DB 연결 끝내지 않도록!
};

export = config;

/**
 * TypeOrm
 * 웬만해서는 synchronize false로 맞추고,
 *  package.json에 typeorm/cli.js로 만든 명령어
 *  schema:drop, schema:sync를 사용해 디비 스키마를 붙이거나 날리자!
 *
 * typeorm-seeding을 통해, 디바에 mock data를 넣어서 작업할 수 있다!
 *  개발 초반 or 테스트 때 굿!
 *  Factory.ts & faker lib 을 조합해 어느정도 정의한 mock-data를 넣을 수 있다!
 *  seeding/cli의 seed 명령을 통해 데이터 집어넣기!
 *
 * migration: typeorm migration을 통해 수행
 *  명령어 typeorm migration:create -- -n / typeorm migration:generate -- -n 을 통해 -> 마이그레이션 작성할 템플릿 생성
 *  명령어 typeorm migration:run / typeorm migration:revert 을 통해 -> 마이그레이션 내용 적용
 */
