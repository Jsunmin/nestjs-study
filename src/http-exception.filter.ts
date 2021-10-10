import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

// 예외필터: httpException을 잡는 기능!

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const err = exception.getResponse() as
      | string // 일반 에러포맷
      | { error: string; statusCode: 400; message: string[] }; // class-validator가 던지는 에러포맷
    // let msg = '';

    // class-validator가 던지는 에러인 경우
    if (typeof err !== 'string' && err.error === 'Bad Request') {
      return response.status(status).json({
        success: false,
        code: status,
        data: err.message,
      });
    }

    // 일반 에러인 경우
    response.status(status).json({
      success: false,
      code: status,
      data: err,
    });
  }
}
