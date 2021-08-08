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
  - 글로벌 미들웨어는 NestFactory (엔트리파일)에서 app.use(middleware) 로 적용시킬 수 있다.
     ~ 이 때는 DI가 안되므로 함수형 미들웨어로!
     또는 root @Module 에서 미들웨어를 전역 적용시킬 수 있다.
  - *미들웨어는 호출될 핸들러 및 매개변수를 포함하여 실행 컨텍스트를 인식하지 못한다!*


#### *아래는 특정한 기능을 위한 담당하는 객체 ~ 미들웨어 or 인터셉터의 하위집합 느낌?!*

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
     ~ *가능한 경우, 인스턴스 대신 클래스( **@UseFilters** )를 통해 필터 주입하는게 좋다! (메모리 사용량 down)*
  - 글로벌 예외 필터는 부트스트랩에서 app.useGlobalFilters(new 예외필터클래스)로 적용 ~ DI 불가..
    또는 @Module 에서 provider로 예외필터를 제공 가능 ~ DI 가능 & 복수의 예외필터 적용 가능 ~ APP_FILTER
  - cf. 처리되지 않은 모든 예외 잡기
    ```
    @Catch()
    export class AllExceptionsFilter implements ExceptionFilter {
        catch(exception: unknown, host: ArgumentsHost) { ... }
    }
    ```

### Pipes
 : @Injectable() 데코레이터가 달린 클래스로 요청 전처리를 담당
  - 2가지 전처리 목적으로 활용됨
    1. 변환 (Parse*Pipe): 입력데이터를 변환 ~ 파싱 (문자열 → 정수)
        ~ 파라미터/쿼리 등의 데이터값이 parsing 처리로 라우트 처리전에 exception 을 던질 수 있음
        ```@Param('uuid', new ParseUUIDPipe()) uuid: string```
    2. 유효성 검사 (ValidationPipe): 입력 데이터 평가 ~ pass / exception 
        ~ pipe 또한 예외처리영역에서 수행됨 ~ catch 가능!
  - custom pipe: PipeTransform에서 implement 받아 구현
    ~ transform(value, metadata) 함수로 리턴값 정의
      value: 라우트에서 처리될 인수, metadata: 인수에 대한 메타정보
    - ex) 객체로된 DTO를 검증할 때 → joi lib으로 커스텀 벨리데이션 파이프라인 생성
      ```
      @Injectable()
      export class JoiValidationPipe implements PipeTransform {
        constructor(private schema: ObjectSchema) {}
        transform(value: any, metadata: ArgumentMetadata) { ... }
      ```
    - ```@UsePipes(new JoiValidationPipe(createCatSchema))``` 컨트롤러에 바인딩
  - cf. **class-validator**, **class-transformer** 를 활용해 클래스 벨리데이터를 만들 수 있다. ~ 공홈 참고
  - 글로벌 파이프는 부트스트랩에서 app.useGlobalPipes(new 벨리데이션 파이프)로 적용 ~ DI 불가..
     또는 @Module 에서 provider로 파이프를 제공 가능 ~ DI 가능 ~ APP_PIPE
  - default value: 변환시(1), 특정 타입이 아닌 undefined, null인 경우 예외 발생..
    이 경우 default를 제공함으로써 예외를 피할 수 있다
    new DefaultValuePipe(값)
    ```@Query('page', new DefaultValuePipe(0), ParseIntPipe) page: number ...```

*cf. 요청은 Client → Exception filters → Pipes → route handler 로 도달한다*

### Guards
 : @Injectable() 데코레이터가 달린 클래스로 런타임에 존재하는 보안적 전처리를 담당
  Client → Middleware → Guard → Guard → (Intercept|Pipe) → route handler
  ex) 권한, 역할, ACL .. ~ 부합하면 라우터 핸들러로 전달 -> **승인/인증**
  - CanActivate라는 인터페이스를 받아 구현
    ~ canActivate() 함수로 실행 컨텍스트를 받아 판단함
  - 토큰을 통해 authorization & authentication을 담당하는 가드
    ```
    @Injectable()
    export class AuthGuard implements CanActivate {
      canActivate(
        context: ExecutionContext,
      ): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest();
        ... // request 내부의 토큰을 통한 권한 처리 (인증 및 롤 통한 권한 체크)
      }
    }
    ```
  - ```@UseGuards(RolesGuard)``` 컨트롤러에 바인딩 (일부 || 전체 적용)
  - 글로벌 가드는 부트스트랩에서 app.useGlobalGuards(new 가드)로 적용 ~ DI 불가..
     또는 @Module 에서 provider로 파이프를 제공 가능 ~ DI 가능 ~ APP_GUARD
  - 특정 role만 허용하는 핸들러 가드
    ~ 실행 컨택스트를 통해, 유효한 롤 정보 받음
    - 특정 컨트롤러에 @SetMetadata() 데코레이터를 통해, 롤을 지정함 ~ 가드는 이를 ctx로 받아 보안 전처리
      ```@SetMetadata('roles', ['admin'])```
    - 더 나아가, 이를 통해, 커스텀 데코레이터를 만들어 적용시키기도 한다.
      - ```export const Roles = (...roles: string[]) => SetMetadata('roles', roles);``` ~ 커스텀 데코레이터 선언
      - ```@Roles('admin') ...``` ~ 커스텀 데코레이터 컨트롤러에 적용
    - 컨트롤러가 허용한 롤을 확인할 때에는, next/core가 제공하는 **reflector**를 활용한다.
      - Reflector를 DI를 통해 받아 온 다음
      ```constructor(private reflector: Reflector) {}```
      - 가드 내부 로직에서 실행컨택스트 -> 컨트롤러 -> 롤 정보 겟!
      ```
      const roles = this.reflector.get<string[]>('roles', context.getHandler());
      if (!roles) {
        return true;
      }
      ...
      matchRoles(roles, user.roles); // 유저의 role과 컨트롤러 role 비교
      ```

  - 가드의 예외
    - 권한/인증에 대한 예외 처리로, ```throw new UnauthorizedException();``` 로 대응
    - 가드가 던진 예외는 예외계층에 잡힌다. (예외 계층내 처리 가능)

### Interceptors
 : @Injectable() 데코레이터가 달린 클래스로 Spring의 AOP(Aspect Oriented Programming) 담당
  > 인터셉터는 전체 애플리케이션에서 발생하는 요구사항에 대한 재사용 가능한 솔루션을 만드는데 큰 가치를 둡니다.
  
  - 사용 사례)
    * 메소드 실행 전/후 추가 로직
    * 함수 리턴|예외 결과 변환
    * 기본 기능 동적 확장
    * 조건에 따른 기능 재정의 (캐싱?)

  - RxJS의 Observable을 활용해, 해당 함수로 스트림을 연산처리시킨다. (tab, map...)
  - NestInterceptor 인터페이스를 적용해 구현
    ```intercept(context: ExecutionContext, next: CallHandler)``` ~ 라는 함수로 구현
    - 1인자: 실행컨텍스트 정보 겟
    - 2인자: 특정 지점에서 라우트 핸들러 메서드를 호출( *AOP ~ pointcut* )할 수 있게 해주는 handler
      Observable을 반환하며, 이를 통해 공통 로직(Aspect) 모듈화 및 추가로직 삽입 가능
  - ex)
      1. 요청의 처음과 끝을 잡아 타이머 처리
        ```
        @Injectable()
        export class LoggingInterceptor implements NestInterceptor {
          intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
            console.log('Before...'); // 요청 실행전 로직
            const now = Date.now();
            return next // 요청 실행후 로직
              .handle()
              .pipe(
                tap(() => console.log(`After... ${Date.now() - now}ms`)),
              );
          }
        }
        ```
      2. 컨트롤러의 리턴값 일괄 처리 (obj로 감싼..)
        ```
        @Injectable()
        export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
          intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
            return next.handle().pipe(map(data => ({ data })));
            // 또는 이런식으로 활용도 가능
            // .pipe(map(value => value === null ? '' : value ));
          }
        }
        ```
      3. 예외 처리 ~ 예외 재정의 ~ 그래도 exception filter로 쓰자!
        ```
        @Injectable()
        export class ErrorsInterceptor implements NestInterceptor {
          intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
            return next
              .handle()
              .pipe(
                catchError(err => throwError(new BadGatewayException())),
              );
          }
        }
        ```
      4. 요청 스트림 덮어쓰기 ~ 특정 조건시 요청핸들러로 보내지 않고, 다른값 전달 ex) 캐싱 데이터 제공
        ```
        @Injectable()
        export class CacheInterceptor implements NestInterceptor {
          intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
            const isCached = true;
            if (isCached) {
              // RxJS of() 연산자에 의해 생성된 새 스트림을 여기에 반환 (핸들러 호출X)
              return of([]); // 핸들러 종료 시점까지 가지 않고 바로 리턴 처리!
            }
            return next.handle();
          }
        }
        ```
  - ```@UseInterceptors(LoggingInterceptor)``` ~ 로 컨트롤러에 적용 (전역|타겟)
  - 글로벌 인터셉터는 부트스트랩에서 app.useGlobalInterceptors(new 인터셉터)로 적용 ~ DI 불가..
     또는 @Module 에서 provider로 파이프를 제공 가능 ~ DI 가능 ~ APP_INTERCEPTOR
  - async 형태의 인터셉터도 적용 가능하다!

### Custom Decorator
  - Decorator: 함수로, 다음에 처리될 함수(메서드)를 인자로 받아 동작을 수정|추가해서 반환하는 함수 ~ *고차함수*
  - ex)
    1. 요청 객체의 특정 정보 겟
      ```
      export const User = createParamDecorator(
        (data: unknown, ctx: ExecutionContext) => {
          const request = ctx.switchToHttp().getRequest();
          return request.user;
        },
      );
      ...
      async findOne(@User() user: UserEntity) {
        console.log(user);
      }
      ```
    2. 특정 객체내 세부 속성 겟 ( == @Param('id') )
      ```
      export const User = createParamDecorator(
        (data: string, ctx: ExecutionContext) => {
          const request = ctx.switchToHttp().getRequest();
          const user = request.user;
          return data ? user?.[data] : user; // 데이터 key 접근
        },
      );
      ...
      async findOne(@User('firstName') firstName: string) {
        console.log(`Hello ${firstName}`);
      }
      ```
  - 이렇게 커스텀 선언한 데코레이터에도 validation Pipe 적용이 가능하다
  - 데코레이터 조합 : 복수의 데코레이터를 조합한 데코레이터 생성
    ```
    export function Auth(...roles: Role[]) {
      return applyDecorators(
        SetMetadata('roles', roles),
        UseGuards(AuthGuard, RolesGuard),
        ApiBearerAuth(),
        ApiUnauthorizedResponse({ description: 'Unauthorized' }),
      );
    }
    ...
    @Get('users')
    @Auth('admin') // 4개의 데코레이터를 조합해서 하나의 데코레이터로 처리!
    findAllUsers() {}
    ```
