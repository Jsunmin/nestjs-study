# Introduction
- TS로 빌드되고, 내부적으로 Express or Fastify HTTP 서버 프레임워크를 기반으로 하는 서버 프레임 워크
- 기반 프레임워크위에 nest의 추상화 기능들을 제공하지만, 기반 프레임워크의 API도 제공도 함

# Overview

### 파일구조
 - **app.controller.ts**: 하나의 라우트가 있는 기본 컨트롤러
 - **app.controller.spec.ts**: 컨트롤러를 위한 유닛 테스트
 - **app.module.ts**: 애플리케이션의 루트 모듈
 - **app.service.ts**: 단일 메서드를 사용하는 기본 서비스
 - **main.ts**: NestFactory를 사용해 Nest 애플리케이션 인스턴스를 생성하는, 엔트리 파일
   - 앱을 부트스랩하는 비동기 함수가 포함되어 있음
   - NestFactory: 애플리케이션 인스턴스를 생성하는 핵심 클래스로, 여러 기반 메서드 제공 & HTTP 플랫폼 지정도 여기서

### Controllers
 : 특정 요청 request를 처리하고 응답 response를 클라이언트에 반환하는 책임을 갖는 부분
  - 클래스와 데코레이터로 이뤄짐 → 컨트롤러의 내용을 구성하는 클래스 & 데코레이터가 필수 메타데이터를 클래스에 주입하는 방식
  - 클래스: method에 따른 함수(비즈니스로직)을 정의 & 해당 함수에 데코레이터 적용해 컨트롤러 세부 세팅
  - 데코레이터: prefix path(@Controller), 하위 path & method(@Get(abc) ), 상태코드(@HttpCode(..)), 응답객체(@Res), 요청객체(@Req) ..
     - 요청객체 관련: @Session, @Param, @Body, @Query, @headers .. 요청객체의 세부정보를 데코레이터로 추출 가능
     - 리소스(method) 관련: @Get, @Post, @Patch, @Options @All (모든 메서드 요청 처리) …
     - payload: @Body 데코레이터로 활용 가능하며, DTO라는 클래스로 형태를 정의해서 사용한다
     - 이 외, 패턴 기반 라우트(와일드카드), 응답 상태, 응답 헤더(@Header), 리다이렉션(@Redirect)
 - 이렇게 정의한 컨트롤러는 @Module 데코레이터에 controllers 배열로 등록한다.
 - cf. 특정 HTTP 기반 프레임워크로 Res를 제공할 때에는, @Res 에 해당 프레임워크 response 타입을 붙여 활용
    ~ Nesjs가 데코레이터로 추상화한 기능을 못 쓰고, 특정 플랫폼의 패턴에 종속당한다.. (필요한 곳에만!)

### Providers
 : Nestjs 에서는 여러 서버프레임워크의 기능이 객체로 구현되는데 (서비스, 레포지토리..) 다른 클래스에 주입되는 객체를 일컫음
 - DI ~ 느슨한 결합을 통해, 각 클래스간 유기적 작용이 가능함.
   * ex) service layer와 controller layer의 결합
     서비스 클래스를 생성하고, 컨트롤러 클래스의 생성자에 사용하는 서비스 클래스를 파라미터로 주입한다. : 생성자 기반 주입
   * ex) 특정 경우에 쓰이는 여러 프로바이더가 필요한 경우
     서비스 클래스에서 종종 쓰이는 클래스를 @Inject() 데코레이터로 주입해 사용 : 속성 기반 주입
 - 마찬가지로 @Module 데코레이터에 providers 배열로 등록한다. (주로 서비스 layer + a ?!)
 - cf. 런타임 중 동적인 프로바이더 제어를 하려면 ModuleRef를 활용할 수 있다.

 ### Modules
 : Nest가 어플리케이션 구조를 구성하는데 사용되는 클래스
  - 특정 기능(ex 컨트롤러) 클래스와 파생되는 클래스(프로바이더)들을 root 모듈로써 묶어준다.
    ex) catsController + CatsService => CatsModule
  - cf. nestjs에서 모듈은 기본적으로 싱글톤 ~ 동일한 인스턴스 공유 용이!
    다른 모듈에 자신(모듈)의 기능을 제공하고 싶으면, exports[]로 해당 기능을 노출.
    반대로, imports[] 를 통해 다른 모듈의 기능을 가져옴.
  - 모듈 자체는 프로바이더로 삽입될 수 없다! ~ *순환 종속성*
  - 글로벌 모듈: @Global() 데코레이터를 통해 정의 가능. 정의되면 어디서나 사용할 수 있는 전역 모듈이 됨
    - 보통 전역 모듈은 한번만 등록
    - utils 같이 중복작성되는 로직에!
    - import[] 를 통해 가져올 필요가 없다!
  - 동적 모듈: 프로바이더를 동적으로 등록하고 구성 ~ 커스텀 모듈을 만들 수 있다.
    ex) 디비 커넥터 모듈 ~ 파라미터로 특정 디비 주입받아 활용
    글로벌 동적 모듈로 활용하고 싶으면 return { …, global: true } 을 추가한다.

### Middleware
 : 라우트 핸들러 이전에 호출되는 함수
   ~ next() 를 통해 파이프라인을 넘어가며, 공통 처리 작업함 ( == express middleware)
  - 함수 또는 @Injectable() 데코레이터가 붙은 클래스에, 미들웨어를 구현
  - DI를 통해, 생성자에 미들웨어 주입
     도메인 module 클래스를 선언할 때, configure 메서드로 미들웨어 적용 (컨슈머에 미들웨어 등록)
     - NestModule 인터페이스를 받아서 구현한다
     - 미들웨어 컨슈머: 미들웨어 관리 헬퍼 클래스 (configure 메서드 파라미터)
       ~ apply, forRoutes, exclude 같은 메서드 지원
        - forRoutes ~ 특정 path, method를 설정해 제한적인 미들웨어 적용도 가능
        - wildcard로 패턴 적용도 가능
        - excludes ~ 특정 메서드는 미들웨어 적용 배제
        - regex로 path 필터 가능
  - cf. 간단한 기능은 클래스보단 함수형 미들웨어로 정의 & apply 하자
  - 복수의 미들웨어는 apply(aM, bM, cM)으로 순차적으로 연결시킨다
  - cf. 글로벌 미들웨어는 NestFactory (엔트리파일)에서 app.use(middleware) 로 적용시킬 수 있다.
     ~ 이 때는 DI가 안되므로 함수형 미들웨어로!
     또는 root @Module 에서 미들웨어를 전역 적용시킬 수 있다.
  - *미들웨어는 호출될 핸들러 및 매개변수를 포함하여 실행 컨텍스트를 인식하지 못한다!*

### Exception filters
 : 예외처리를 한 곳에서 담당하는 exception layer
  - 기본적으로 HttpException 유형의 에러를 처리하는 전역 예외 필터에서 수행됨
   ~ 이 외의 에러는 500 Internal Server Error
  - 자주 쓰이는 에러 패턴은 HttpStatus.xx 로 이넘 형태의 코드를 가져와 사용
   ```throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);```
  - HttpException:
    - 첫번째 인자는 string | object (nest 자체 직렬화), 두번째 인자는 statusCode
    - custom exception: HttpException 클래스로부터 상속받아, 커스텀 예외 클래스를 만듦
  - Exception filters: 예외 레이어를 통한 제어
    ~ 특정 예외를 캐치하고 커스텀한 응답을 던져줄 수 있음
    ```catch(exception: HttpException<T>, host: ArgumentsHost) { … }```
        ~ 정의한 형태의 에러<T>만 캐치
        host: req, res가 엮여있는 컨텍스트 데이터
  - 이렇게 정의한 예외필터는 컨트롤러(전체 or 단일)에 데코레이터로 붙임
    ```@UseFilters(new CustomExceptionFilter())``` → DI
    or ```throw new ForbiddenException();``` ~ 내부에서 예외 인스턴스 throw.. 
     ~ *가능한 경우, 인스턴스 대신 클래스(**@UseFilters**)를 통해 필터 주입하는게 좋다! (메모리 사용량 down)*
  - cf. 글로벌 예외 필터는 부트스트랩에서 app.useGlobalFilters(new 예외필터클래스)로 적용시킨다! ~ DI 불가..
    또는 @Module 에서 provider로 예외필터를 제공 가능 ~ DI 가능 & 복수의 예외필터 적용 가능 ~ APP_FILTER
  - cf. 처리되지 않은 모든 예외 잡기
    ```
    @Catch()
    export class AllExceptionsFilter implements ExceptionFilter {
        catch(exception: unknown, host: ArgumentsHost) { ... }
    }
    ```