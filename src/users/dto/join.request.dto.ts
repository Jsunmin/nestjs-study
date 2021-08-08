import { ApiProperty } from '@nestjs/swagger';

export class JoinRequestDto {
  @ApiProperty({
    example: 'min@gmail.com',
    description: '이메일',
    required: true,
  })
  public email: string;

  @ApiProperty({
    example: 'Jm',
    description: '닉네임',
    required: true,
  })
  public nickname: string;

  @ApiProperty({
    example: 'qwer1234',
    description: '비밀번호',
    required: true,
  })
  public password: string;
}

/**
 * Nest 에서는 interface 보다 class를 씀
 *  ts 컴파일 후에도 class는 남아있어서,
 *  js 단(런타임)에서도 validation이 가능하다!
 *
 * Nest는 export default 보다 export를 사용한다.
 */
