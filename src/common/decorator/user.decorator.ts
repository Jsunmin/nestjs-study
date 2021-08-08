import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * 공통 커스텀 데코레이터
 *  : 코드를 일괄적으로 관리해서 관리를 용이하게 한다! (중복 제거)
 */

// req 내부의 user 정보를 가져오는 데코레이더
export const User = createParamDecorator(
  // ExecutionContext: 요청과 관련한 전체 문맥 데이터 가져오는 파라미터 ~ Http, Rpc, Ws 전부 접근 가능!
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
