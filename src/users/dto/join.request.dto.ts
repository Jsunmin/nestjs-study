import { PickType } from '@nestjs/swagger';
import { Users } from '../../entities/Users';
// 공통 DTO

// 상속받아서 확장 ~ 기존 DTO에서 PickType으로 클래스 프로퍼티 추출!
export class JoinRequestDto extends PickType(Users, [
  'email',
  'nickname',
  'password',
] as const) {}

/**
 * Nest 에서는 interface 보다 class를 씀
 *  ts 컴파일 후에도 class는 남아있어서,
 *  js 단(런타임)에서도 validation이 가능하다!
 *
 * Nest는 export default 보다 export를 사용한다.
 */
