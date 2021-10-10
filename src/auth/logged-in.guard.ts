import { ExecutionContext, Injectable, CanActivate } from '@nestjs/common';

// AuthGuard: nestjs가 passport를 모듈화한 것

@Injectable()
export class LoggedInGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    return request.isAuthenticated();
  }
}

// passport 흐름
// 1. AuthGuard 호출 -> 2. local.strategy -> 3. validate 통과시, local.serializer 호출 (여기서 session Id 저장 & 요청올시 session 참고해 유저 데이터 제공)
