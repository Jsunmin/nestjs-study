### Custom provider
 : DI의 폭넓은 활용
  - 용어 체크
    - 제어 역전(Inversion of Control, IoC) : 전통적인 프로그래밍에서는 개발자가 작성한 프로그램이 외부 라이브러리의 코드를 호출해서 이용했다.
    제어 역전은 이와 반대로 외부 라이브러리 코드가 개발자의 코드를 호출하게 된다. 즉, 제어권이 프레임워크에게 있어 필요에 따라 스프링 프레임워크가 사용자의 코드를 호출한다. from wiki
    - 서버 어플리케이션이랑 독립된 컨테이너( **이 경우, NestJS 런타임 시스템** )에서 인스턴스의 생명주기를 관리한다. (객체의 생성, 주입..)
  
  - 서비스 내 객체가 선언되고 (ex controller ), 내부에서 DI를 처리하고 있으면, (controller ~ service 생성자 DI)
      IoC 컨테이너가 바텀업 방식으로 종속되는 객체를 찾아서 맵핑함 ( module에 등록한 컨트롤러, 프로바이더 확인 )
  
  #### stadnard provier
    - @Module 에서는 프로바이더를 등록할 때, 사실 문자열토큰(식별자)와 타겟 클래스를 등록 & 모듈 내 다른 객체에서 이를 참조해 DI

  #### custom provier
    - 보통 클래스를 DI해서 인스턴스를 생성하는게 아니라, 사용자가 직접 만든 인스턴스를 주입하고 싶을 때
    - 기존 클래스를 재사용할 때
    - 테스트 등을 목적으로 mock 클래스를 재정의할 때
      ```
      const mockCatsService = {
        //mock implementation
      };
      @Module({
        imports: [CatsModule],
        providers: [
          {
            provide: CatsService, // 식별 토큰은 그대로
            useValue: mockCatsService, // 실제 맵핑은 mock class
          },
        ],
      })
      ```

  #### non-class-based provier token
    : 클래스의 이름(식별자)를 토큰으로 정의함 (provider 키의 value값)
      이 때 useValue는 클래스가 아닌 어떤 값을 사용할 수 있는데,
      이 경우 프로바이더를 주입받는 객체는 **@Inject()**를 사용한다.
      ```
      @Module({
        providers: [
          {
            provide: 'CONNECTION',
            useValue: connection, // 클래스가 아닌 값
          },
        ],
      })

      ...

      @Injectable()
      export class CatsRepository {
        constructor(@Inject('CONNECTION') connection: Connection) {} // 모듈에서 정의한 CONNECTION 토큰을 주입 (no class)
      }
      ```

  #### class provier
    : useClass
    - injectable한 클래스가 아닌 일반 클래스로 동적인 provider 내려줌
      ```
      const configServiceProvider = {
          provide: ConfigService,
          useClass:
            process.env.NODE_ENV === 'development' // 스테이지에 따라 DI 클래스 변경
              ? DevelopmentConfigService
              : ProductionConfigService,
        };

        @Module({
          providers: [configServiceProvider],
        })
      ```

  #### factory provier
    : useFactory
    - 동적인 프로바이더 생성 (외부 변수 or 인수를 통해)
      ```
      const connectionFactory = {
        provide: 'CONNECTION',
        useFactory: (optionsProvider: OptionsProvider) => { // 프로바이더도 인수로 받을 수 있다!
          const options = optionsProvider.get();
          return new DatabaseConnection(options);
        },
        inject: [OptionsProvider],
      };

      @Module({
        providers: [connectionFactory],
      })
      ```

  #### alias provier
    : useExisting
    - 기존에 존재하는 프로바이더의 새로운 연결점을 만듦
    - 보통 싱글톤 패턴으로 인스턴스를 제공하기에, 동일한 객체를 참조할 것이다!
      ```
      @Injectable()
      class LoggerService {   // 로그 목적의 기존 프로바이더
        /* implementation details */
      }

      const loggerAliasProvider = {   // 위 로거 프로바이더의 alias 프로바이더
        provide: 'AliasedLoggerService',
        useExisting: LoggerService,
      };

      @Module({
        providers: [LoggerService, loggerAliasProvider],
      })
      ```

  #### non-service based providers
    - 일반적으로 프로바이더는 서비스를 제공하는데 활용되지만,
      이 외에 어떤 값이라도 제공할 수 있다!
    - ex) AWS prameterstore 환경별 var 제공?!
      ```
      const configFactory = {
        provide: 'CONFIG',
        useFactory: () => {
          return process.env.NODE_ENV === 'development' ? devConfig : prodConfig;
        },
      };

      @Module({
        providers: [configFactory],
      })
      export class AppModule {}
      ```

  - custom provider 또한 일반 provider 처러 exports[] 를 활용해, 모듈 스코프 바깥에서 쓰일 수 있다!
    ```
    const connectionFactory = {
      provide: 'CONNECTION',
      ...
    };
    @Module({
      providers: [connectionFactory],
      exports: [connectionFactory], // 또는 토큰을 활용해, exports: ['CONNECTION']
    })
    export class AppModule {}
    ```

  #### async providers
    - 비동기 작업의 완료처리 후 DI를 할 수 있도록 하는 프로바이더
    - 보통 useFactory로 구현한다!
    - ex) DB 연결
      ```
      {
        provide: 'ASYNC_CONNECTION',
        useFactory: async () => { // 프로미스 객체를 리턴해, 
          const connection = await createConnection(options);
          return connection;
        },
      }
      ```


### Dynamic modules
  - 정적 모듈 바인딩:
    - 모듈내에서 프로바이더, 컨트롤러와 같은 구성요소를 정의해 실행 컨텍스트(범위)를 제공
      이런 모듈(A)은 다른 모듈(B)에 import되어 사용되기도 한다. **(A.service는 B.service 내부에서 사용 가능!)**
    - 모듈내에 필요한(소비되는) 모든 객체정보는 이렇게 미리 선언되어 있음
  - 다이나믹 모듈 기능을 통해, 모듈을 동적으로 만들어 주입할 수 있게 된다!
  - 가져오는 모듈에 인자를 전달해, 동작을 변경할 수 있도록 함
    보통, 클래스의 static 메서드를 활용하며. 관용상 forRoots() | register()로 네이밍
    static 메서드는 동적 모듈을 리턴한다
    ```
    @Module({
      imports: [ConfigModule.register({ folder: './config' })], // ~ 정적 모듈 바인딩과 유사함
      controllers: [AppController],
      providers: [AppService],
    })

    // config.module.ts (동적 모듈을 생성하는 곳)
    @Module({})
    export class ConfigModule {
      // register static함수에서 모듈(과 같은 형태)을 리턴한다
      static register(options): DynamicModule {
        return {
          module: ConfigModule,
          providers: [
            {
              provide: 'CONFIG_OPTIONS',  // 옵션을 동적으로 받아, 프로바이더에 넘겨준다!
              useValue: options, // 프로바이더 값은 클래스가 아닌 어느 타입도 가능!
            },
            ConfigService,
          ],
          exports: [ConfigService],
        };
      }
    }
    
    // config.service.ts (동적 모듈의 서비스 부분)
    @Injectable()
    export class ConfigService {
      private readonly envConfig: EnvConfig;

      // 모듈에서 동적인자로 받는 프로바이더 (no class!)를 주입받는다! (non-class-based provier token)
      constructor(@Inject('CONFIG_OPTIONS') private options) {
        const filePath = `${process.env.NODE_ENV || 'development'}.env`;
        const envFile = path.resolve(__dirname, '../../', options.folder, filePath); // 동적인자를 활용해 동적으로 변경되는 기능!
        this.envConfig = dotenv.parse(fs.readFileSync(envFile));
      }

      get(key: string): string {
        return this.envConfig[key];
      }
    }
    ```


### Injection scopes
  - provider의 스코프
    1. DEFAULT: global 적용 / 인스턴스의 수명 = 어플리케이션 수명주기 / 어플리케이션 부투스트랩시, 모든 싱글톤 프로바이더 인스턴스화
    2. REQUEST: 들어오는 요청에 인스턴스 생성 / 요청 완료시 GC처리
    3. TRANASIENT: 임시 프로바이더로, 프로바이더 컨슈머들은 이를 공유하지 않고 각각 따로 생성받아 사용 (싱글톤 X?)
    ~ 요청범위 프로바이더는 성능에 부정적 영향.. 필요한 경우가 아니면 DEFAULT 범위를 사용하는게 낫다!
  
  #### usage
    ```
    // 주입되는 객체의 Injectable 데코레이터에 scope 지정
    @Injectable({ scope: Scope.REQUEST }) // 속성 enum은 @nestjs/common에!
    export class CatsService {}

    // 프로바이더 설정시에 scope 속성 설정
    {
      provide: 'CACHE_MANAGER',
      useClass: CacheManager,
      scope: Scope.TRANSIENT,
    }
    ```
  
  #### controller scope
    - 각 인바운드 요청에 대해 새 인스턴스가 생성되고, 요청 처리시 GC처리
    ```
    @Controller({
      path: 'cats',
      scope: Scope.REQUEST,
    })
    ```

  #### scope hierarchy
    - Controller > Service > Repository.. 의 객체 관계에서 스코프 지정은, 해당 객체를 DI받은 상위 객체에 영향을 줌
    - service REQUEST scope -> controller도 REQUEST scope / repository 그대로 DEFAULT scope

  #### request provider
    - 각 인바운드 요청에 대해 새 인스턴스가 생성되고, 요청 처리시 GC처리
    - 보통 service는 controller와 더커플링되어, req res를 모르지만, REQUEST scope으로 request 참조함
    - gql의 경우에는 context로 
      ```
      import { Injectable, Scope, Inject } from '@nestjs/common';
      import { REQUEST } from '@nestjs/core';
      import { Request } from 'express';

      // 요청객체를 가져오는 서비스 객체 (일반)
      @Injectable({ scope: Scope.REQUEST })
      export class CatsService {
        constructor(@Inject(REQUEST) private request: Request) {}
      }

      (GQL)
      import { CONTEXT } from '@nestjs/graphql';
      @Injectable({ scope: Scope.REQUEST })
      export class CatsService {
        constructor(@Inject(CONTEXT) private context) {}
      }
      ```


### Circular dependency
  - 순환 종속성: 두 클래스가 서로 의존할 때 발생..
    Nestjs는 2 방법으로 프로바이더간 순환 종속성을 해결한다.
  
  #### forward reference
    - 포워드 참조를 통해, 정의되지 않은 클래스를 참조할 수 있음
    - 참조하는 두 서비스 모두 fordref()로 DI ~ 이렇지 않으면 인스턴스화X
      ```
      // A 서비스
      @Injectable()
      export class CatsService {
        constructor(
          @Inject(forwardRef(() => CommonService)) // forward ref (B서비스 참조)
          private commonService: CommonService,
        ) {}
      }

      // B 서비스
      @Injectable()
      export class CommonService {
        constructor(
          @Inject(forwardRef(() => CatsService))  // forward ref (B서비스 참조)
          private catsService: CatsService,
        ) {}
      }
    - 모듈간의 순환 종속성도 마찬가지로 양쪽에 forwardRef() 활용
      ```
      @Module({
        imports: [forwardRef(() => CatsModule)],
      })
      ```

  #### moduleRef class
    - 참조받는 한쪽 클래스에서 ModuleRef 클래스를 사용하여, 순환 관계의 다른 프로바이더를 검색 (아래)

