import { ApiProperty } from '@nestjs/swagger';
import { JoinRequestDto } from 'src/users/dto/join.request.dto';

// 공통 DTO

// 상속받아서 확장
export class UserDto extends JoinRequestDto {
  @ApiProperty({
    example: 1,
    description: '아이디',
    required: true,
  })
  public id: number;
}
