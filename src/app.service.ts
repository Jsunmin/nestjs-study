import { Injectable } from '@nestjs/common';

// 서비스 layer: 비즈니스 로직을 담음 ~ 요청&응답과 분리
// --> 로직의 재사용 및 도메인(모델)의 로직 조합해서 활용한다!

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}
