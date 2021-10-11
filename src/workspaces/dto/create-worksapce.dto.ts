import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateWrokspaceDto {
  // 벨리데이션
  @IsString()
  @IsNotEmpty()
  // 문서화
  @ApiProperty({
    example: '슬리액트',
    description: '워크스페이스명',
  })
  // 타입지정
  workspace: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'sleact',
    description: 'url 주소',
  })
  url: string;
}
