import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
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
 *  A -> E -> F -> D -> G
 *  Z -> A -> X -> D
 *
 * - 각 실행 흐름을 가진 라우터를 (세로)
 *  가로 부분으로 접근해 일괄적으로 처리하게 해주는 기능
 *  (위 경우, 공통 프로세스인 A, D)
 * - 실행 전, 후를 동시에 관장 가능하다.
 * - ex)
 *  1. 리턴값을 한번 더 조작할 때에 활용 가능
 *  2. 요청 시작과 끝을 잡아, 전체 처리 시간을 잴 수도 있음
 */
