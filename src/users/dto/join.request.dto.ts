export class JoinRequestDto {
  public email: string;

  public nickname: string;

  public password: string;
}

/**
 * Nest 에서는 interface 보다 class를 씀
 *  ts 컴파일 후에도 class는 남아있어서,
 *  js 단(런타임)에서도 validation이 가능하다!
 *
 * Nest는 export default 보다 export를 사용한다.
 */
