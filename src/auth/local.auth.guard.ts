import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// AuthGuard: nestjs가 passport를 모듈화한 것

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const can = await super.canActivate(context);
    if (can) {
      const request = context.switchToHttp().getRequest();
      console.log('login cookie');
      await super.logIn(request);
    }
    return true;
  }
}

// passport 흐름
// 1. AuthGuard 호출 -> 2. local.strategy -> 3. validate 통과시, local.serializer 호출 (여기서 session Id 저장 & 요청올시 session 참고해 유저 데이터 제공)
