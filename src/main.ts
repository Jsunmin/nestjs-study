import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as passport from 'passport';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 3000;

  // 글로벌 인터셉터 기능 붙이기 (예외필터, 가드, 파이프..)
  app.useGlobalPipes(new ValidationPipe());
  // app.useGlobalFilters(new HttpExceptionFilter()); ~ 얘는 app.module에서 객체로 주입!

  // Swagger: JAVA에서 자주 쓰이는 빌더 패턴
  const config = new DocumentBuilder()
    .setTitle('Sleact API')
    .setDescription('Sleact 개발을 위한 API 문서입니다.')
    .setVersion('1.0')
    .addTag('connect.sid')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  // {host}/api에 swagger 문서 생성
  SwaggerModule.setup('api', app, document);

  // DI 형식으로 다른 곳에서 쓰지 않는다면, nest 어플리케이션 init 할 때, use로 붙이자!
  app.use(cookieParser());
  app.use(
    session({
      resave: false,
      saveUninitialized: false,
      secret: process.env.COOKIE_SECRET,
      cookie: {
        httpOnly: true,
      },
    }),
  );

  // 세션 사용하기 위한 세팅!
  app.use(passport.initialize());
  app.use(passport.session());

  await app.listen(port);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
  console.log(`listening on port ${port}`);
}
bootstrap();

// mysql 도커
// docker exec -it sleact-mysql /bin/sh

/**
 * cf. request LC
 *  요청 -> 글로벌 미들웨어 -> 모듈별 미들웨어
 *  -> 그로벌 가드 -> 컨트롤러 가드 -> 라우트 가드
 *  -> 글로벌 인터셉터 -> " 인터셉터 -> " 인터셉터 (pre req)
 *  -> 글로벌 파이프 -> " 파이프 -> " 파이프
 *  -> 컨트롤러 -> 서비스
 *  -> 글로벌 인터셉터 -> " 인터셉터 -> " 인터셉터 (post req)
 *  -> 라우트 예외필터  -> 컨트롤러 예외필터 -> 글로벌 예외필터
 *  -> 응답
 */
