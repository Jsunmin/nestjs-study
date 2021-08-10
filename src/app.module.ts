import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// dotenv를 대체하는 nest 모듈 ~ 환경변수를 모듈화시켜 제공
import { ConfigModule } from '@nestjs/config';
import * as ormConfig from '../ormconfig';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { UsersModule } from './users/users.module';
import { WorkspacesModule } from './workspaces/workspaces.module';
import { ChannelsModule } from './channels/channels.module';
import { DmsModule } from './dms/dms.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpExceptionFilter } from './http-exception.filter';
import { APP_FILTER } from '@nestjs/core';

// 모든 모듈을 연결하는 root 모듈
@Module({
  // 여러 서비스 모듈을 임포트해서 연결
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 모듈 바깥에서도 글로벌리 환경변수 접근 가능
    }), // dotenv 활용
    UsersModule,
    WorkspacesModule,
    ChannelsModule,
    DmsModule,
    // typeorm 세팅 (forRoot로 모듈의 option 넣기 || ormconfig에서 처리!)
    TypeOrmModule.forRoot(ormConfig),
  ],
  // 라우터
  controllers: [AppController],
  providers: [
    AppService,
    {
      // 글로벌 예외필터 추가
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    HttpExceptionFilter,
  ],
})
export class AppModule implements NestModule {
  // 어플리케이션 전역에 적용된다!
  configure(consumer: MiddlewareConsumer): any {
    // 모듈에 logger 미들웨어 적용
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
