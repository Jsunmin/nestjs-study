import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// dotenv를 대체하는 nest 모듈 ~ 환경변수를 모듈화시켜 제공
import { ConfigModule } from '@nestjs/config';

// 모든 모듈을 연결하는 root 모듈
@Module({
  // 여러 서비스 모듈을 임포트해서 연결
  imports: [ConfigModule.forRoot()], // dotenv 활용
  // 라우터
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
