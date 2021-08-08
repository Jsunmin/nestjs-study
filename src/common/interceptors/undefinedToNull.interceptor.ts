import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
// rx를 써서 인터셉터를 구현함
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// 데이터를 리턴 전에 한번 더 가공하는 식
@Injectable()
export class UndefinedToNullInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> | Promise<Observable<any>> {
    // 전 부분
    // 컨트롤러에서 리턴하는 `data`를 객체로 한번 감싼 것
    // return next.handle().pipe(map((data) => ({ data })));

    // data가 undefined면 null로!
    return next
      .handle()
      .pipe(map((data) => (data === undefined ? null : data)));
  }
}
/**
 * 인터셉터
 *
 *  A -> B -> C -> D
 *  A -> C -> D
 *  A -> E -> F -> D
 *  Z -> A -> X -> D
 *
 * - 각 실행 흐름을 가진 라우터를 (세로 부분)
 *  가로 부분으로 접근해 일괄적으로 처리하게 해주는 기능
 *  (위 경우, 공통 프로세스인 A, D)
 * - 실행 전, 후를 동시에 관장 가능하다.
 * - ex)
 *  1. 리턴값을 한번 더 조작할 때에 활용 가능
 *   ~ 이 경우, 리턴을 res.send가 아닌, return으로 해야 함 ~ 그러면 인터셉터에서 data로 잡는다!
 *  2. 요청 시작과 끝을 잡아, 전체 처리 시간을 잴 수도 있음
 *
 *
 * cf)
 * AOP: 각 라우터가 갖는 프로세스를 Aspect로 볼 때,
 *  클래스별로 흩어져있는 (공통된) Aspect를 모아서 모듈화하는 기법
 *  ~ 씨실과 날실
 *  인터셉터가 Spring의 AOP 역할을 하는 것
 *  공통되는 부분을 모듈화함 ~ 미들웨어보다 좀 더 개선된
 */
