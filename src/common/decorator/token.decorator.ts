import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// res 내부의 jwt 토큰 정보를 가져오는 데코레이더
export const Token = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getResponse();
    return request.locals.jwt;
  },
);
// @Token() token
