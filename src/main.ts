import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as passport from 'passport';
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 3000;

  // JAVA에서 자주 쓰이는 빌더 패턴
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
