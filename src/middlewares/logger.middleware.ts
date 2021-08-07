import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  // nest logger ~ context를 파라미터로 제공해서 네임스페이스처럼 활용
  private logger = new Logger('HTTP');

  // express 프레임워크의 기능 그대로 활용
  use(request: Request, response: Response, next: NextFunction): void {
    // 라우터 시작전 세팅
    const { ip, method, originalUrl } = request;
    const userAgent = request.get('user-agent') || '';

    // 라우터 종료 이벤트시 로깅
    response.on('finish', () => {
      const { statusCode } = response;
      const contentLength = response.get('content-length');
      // nest 자체 logger == console.log
      this.logger.log(
        `${method} ${originalUrl} ${statusCode} ${contentLength} - ${userAgent} ${ip}`,
      );
    });

    next();
  }
}

/**
 * implement: 인터페이스를 적용
 *  interface에 맞춰 구현해야 컴파일 통과한다
 *   ~ 올바른 선언 강제 & 추론 가능
 *
 * @Injectable: DI를 통해 의존성 주입을 가능케 하는 데코레이터
 *  주입받는 클래스는 constructor에서 해당 객체를 주입받아 사용한다.
 *  느슨한 결합을 통해, 상황에 따른 재사용이 쉬움
 *   특히 nest에서는 테스트에 용이! (서비스용X 테스트용 객체 주입)
 */
