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


### Module reference
  : ModuleRef 클래스로 내부 프로바이더 목록 탐색 & 참조 ~ 토큰 통해서

    ```
    @Injectable()
    export class CatsService {
      constructor(private moduleRef: ModuleRef) {}
      
      ... // 대충 다른 프로바이더 참조해 작업하는 내용
    }
    ```
  - ex)
    1. 특정 서비스 프로바이더에서, 현재 모듈의 DI 받지 않은 프로바이더를 참조할 때
    2. 특정 서비스 프로바이더에서, 전역 레벨의 프로바이더를 참조할 때
    3. 특정 서비스 프로바이더에서, scope 제한된 모듈 || 해당 요청의 모듈(REQUEST SCOPE) 을 참조할 때

  - get(): [토큰|클래스]명을 통해 **현재 모듈**에 인스턴스로 떠있는 주입가능 객체 (프로바이더, 컨트롤러, 가드, 인터셉터...) 들을 검색
      기본은 소속한 모듈내 검색이고, 전역 컨텍스트에서의 검색은 ```this.moduleRef.get(Service, { strict: false });``` ~ strict 옵션을 통해!
  - resolve(): scope가 지정된(TRANSIENT, REQUEST) 프로바이더를 동적으로 확인할 때 사용
    - 이 때, resolve()는 호출될 때마다, 고유한 컨텍스트에서 인스턴스를 생성해 리턴 (같은 객체를 불러도, 다른 인스턴스임)
      같은 컨텍스트 내에서 resolve()로 객체를 불러오려면, ContextIdFactory로 만든 contextId를 옵션으로 줘 컨텍스트를 맞춘다.
      ~ 이렇게 Scope 프로바이더를 불러오는 경우, request로 인한 생성 (Nest 의도 injection)이 아니어서, undefined로 불러오게 됨 -> 이를 contextId로 맞춰줌
      ```
      async onModuleInit() {
        const transientServices1 = await Promise.all([
          this.moduleRef.resolve(TransientService),
          this.moduleRef.resolve(TransientService),
        ]);
        console.log(transientServices1[0] === transientServices1[1]); // false ~ 다른 컨텍스트에서 인스턴스 겟
        
        ...

        const contextId = ContextIdFactory.create();  // 컨텍스트 생성
        const transientServices2 = await Promise.all([
          this.moduleRef.resolve(TransientService, contextId),
          this.moduleRef.resolve(TransientService, contextId),
        ]);
        console.log(transientServices2[0] === transientServices2[1]); // true
      }
      ```
    - 요청 컨텍스트 내에서 프로바이더 참조
      ```
      @Injectable()
      export class CatsService {
        constructor(
          @Inject(REQUEST) private request: Record<string, unknown>, // request provider (Scope) 불러옴
        ) {}

        const contextId = ContextIdFactory.getByRequest(this.request);  // 요청을 통해 contextId 겟
        const catsRepository = await this.moduleRef.resolve(CatsRepository, contextId); // 해당 contextId의 인스턴스 (scoped?) 호출

      }
      ```
  - 이전에 등록되지 않은 클래스로 인스턴스화 & 참조
    ```
    @Injectable()
    export class CatsService implements OnModuleInit {
      private catsFactory: CatsFactory;
      constructor(private moduleRef: ModuleRef) {}

      async onModuleInit() {
        this.catsFactory = await this.moduleRef.create(CatsFactory); // 종속관계 없고 moduleRef로 참조한 클래스로 인스턴스 생성!
      }
    }
    ```


### Lazy-loading modules
  : 기본적으로 모듈은 즉시 로드. 지연로드 기능을 통해 빠른 애플리케이션 init이 가능! ~ DP) proxy pattern

  - lazyModuleLoader 클래스로 구현
    ```
    @Injectable()
    export class CatsService {
      constructor(private lazyModuleLoader: LazyModuleLoader) {}
    }
    ```
  - main.ts (부트스트랩) 초기 시작시 lazyLoading 세팅
    ```
    ...
    const lazyModuleLoader = app.get(LazyModuleLoader);

    ... // 서버 스타트..

    const { LazyModule } = await import('./lazy.module');
    const moduleRef = await this.lazyModuleLoader.load(() => LazyModule);
    ```
  - lazy module 호출
    lazyModuleLoader.load()를 통해 내부 프로바이더의 객체를 지연 참조함
    ```
    @Module({
      providers: [LazyService],
      exports: [LazyService],
    })
    export class LazyModule {}
    
    ...

    const { LazyModule } = await import('./lazy.module');
    const moduleRef = await this.lazyModuleLoader.load(() => LazyModule); // load()로 지연 겟

    const { LazyService } = await import('./lazy.service');
    const lazyService = moduleRef.get(LazyService);         // 지연 모듈의 서비스 프로바이더 가져와 실행
    ```
  - lazy loading도 지연 로딩이 완료되면, 다른 nest 모듈과 동일 (첫 로딩 후 캐싱 & 같은 모듈 그래프 공유)
  - lazy loading으로 불러오는 모듈오는 모듈에는 추가 작업 필요 X
  - lazy loaded 모듈은 전역 모듈/인터셉터,가드 등으로 작동 X
  - 컨트롤러, 리졸버, 게이트웨이는 lazyModuleLoader로 지연 로드 X
  - 보통, 하위 서비스로 불려오는 기능 (ex 브라우저 기능 쓰는)일 때 비즈니스 로직내 Lazy loading 활용


### Execution context
  : 실행 컨텍스트를 통해, 한 비즈니스로직을 처리하는 여러 독립된 객체에 같은 데이터를 공유할 수 있게된다.

  ### argumentsHost class
    - 요청 핸들러의 인수 데이터를 캡슐화해서 제공
      http: [request, response, next]
      gql: [root, args, context, info]
    - 보통 host로 받아, 프로토콜(.getType) / 핸들러 인수(.getArgs)
       / 프로토콜에 맞는 데이터(.switchToXXXX) http의 경우, request, response 등 ex) host.switchToHttp().getRequest()

  ### executionContext class
    - ArgumentsHost를 확장하여 현재 실행 프로세스에 대한 추가 세부 정보를 제공
    - ex)
      getClass(): 핸들러가 포함된 컨트롤러명(class명) 겟
      getHandler(): 핸들러가 포함된 요청 메서드 하위 함수명 겟
    - @SetMetadata()
      해당 데코레이터를 통해, 특정 라우트 핸들러에 붙은 데이터를 가져올 수 있다.
      ex) 해당 라우트의 authentication role 조건 정보
      핸들러에 맵핑된 정보를 가져와 인터셉터, 가드 등에서 활용!
      ```
      // role 관련 커스텀 테코레이터 생성 (@SetMetadata 사용)
      export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

      ...

      // Role 커스텀 데코 붙인 컨트롤러
      @Post()
      Roles('admin')
      async create(@Body() createCatDto: CreateCatDto) {
        this.catsService.create(createCatDto);
      }

      ...

      // 가드
      @Injectable()
      export class RolesGuard {
        constructor(private reflector: Reflector) {}

        // Reflector 헬퍼를 통해 커스텀 데이터 겟 ~ 이 때, 핸들러명을 executionContext에서 가져온다!
        const roles = this.reflector.get<string[]>('roles', context.getHandler());
      }
      ```

      cf) Reflector 헬퍼 추가 기능
      ```
      // 컨트롤러와 핸들러에서 복수 커스텀 데이터 겟 (role)

      // 컨트롤러
      @Roles('user')
      @Controller('cats')
      export class CatsController {
        @Post()
        @Roles('admin')
        async create(@Body() createCatDto: CreateCatDto) {
          this.catsService.create(createCatDto);
        }
      }


      // 가드1 : 이 경우 핸들러의 데이터로 덮어써서 가져온다! return ['admin']
      ...
        const roles = this.reflector.getAllAndOverride<string[]>('roles', [
          context.getHandler(),
          context.getClass(),
        ]);
      ...

      // 가드2 : 이 경우 핸들러와 컨트롤러의 데이터를 머지해서 가져온다! return ['admin', 'user']
      ...
        const roles = this.reflector.getAllAndMerge<string[]>('roles', [
          context.getHandler(),
          context.getClass(),
        ]);
      ...
      ```


### Lifecycle events
  : Nest application 시작(부트스트래핑) & 종료의 수명주기

  1. bootstrapping starts
    - Nest core시작
  2. onModuleInit ~ onModuleInit()
    - 호스트 레벨 모듈 INIT ~ 모듈 내부의 객체 (CONTROLLER, PROVIDER) init & 연결
  3. onApplicationBootstrap ~ onApplicationBootstrap()
    - 전체 모듈 Init
  4. 각 서버 listen
  5. application running

  ---

  1. onModuleDestory ~ onModuleDestroy()
    - 종료신호 수신 (app.close() -> SIGTERM)
    - 어찌됐든 이 LC를 타려면, SIGTERM이라는 시스템콜을 작동시켜야 한다!
  2. beforeApplicationShutdown ~ beforeApplicationShutdown()
    - 모든 모듈의 연결 닫음 
  3. onApplicationShutdown ~ onApplicationShutdown()
    - 모든 모듈의 종료
  4. Process exit

  - LC hook 사용하기
    - 각 LC 인터페이스를 받아, hook 메서드 구현!
      ```
      import { Injectable, OnModuleInit } from '@nestjs/common';

      @Injectable()
      export class UsersService implements OnModuleInit {
          // 모듈초기화 때 작동할 메서드
          onModuleInit() {
              console.log(`The module has been initialized.`);
          }

          // 이런식으로 promise 리턴으로 활용하면, LC가 당연히 지연된다 (비동기 마무리후 진행!)
          async onModuleInit(): Promise<void> {
              await this.fetch();
          }
      }
      ```
    - 종료관련 hook
      - onModuleDestroy(), beforeApplicationShutdown() 및 onApplicationShutdown()
      - enableShutdownHooks() 를 부트스트랩에서 호출해 리스너 on
      ```
      async function bootstrap() {
          const app = await NestFactory.create(AppModule);

          // 종료 LC 리스너 ON
          app.enableShutdownHooks();

          await app.listen(3000);
      }

      ...
      // 등록 후, 종료 신호(SIGTERM, SIGINT ..) 받으면 다음 훅을 호출함
      @Injectable()
      class UsersService implements OnApplicationShutdown {
          onApplicationShutdown(signal: string) {
              console.log(signal); // e.g. "SIGINT"
          }
      }
      ```
        
### Platform agnosticism
  - agnostic xx(SW): 어떤 OS나 기타 백그라운드인지와 관계없이 기능을 기능을 작동할 수 있는 SW
  - Nest도 플랫폼에 구애받지 않고, 어느정도 로직을 구현할 수 있다. (플랫폼에 종속받지 않도록 짜야함)
  - express, fastify / http, ws / ...


### Testing
  - unit, e2e, 통합 테스트 등을 빠르게 적용할 수 있도록 세팅.지원해줌 (Jest, Superset)
  - 이 또한, 특정 테스터에 종속적이지 않아, (agnostic) 교체할 수 있다.

  - unit test
    - 개별 모듈 및 클래스에 초점을 맞춘 테스트 (JEST)
    ```
    import { Test } from '@nestjs/testing';
    import { CatsController } from './cats.controller';
    import { CatsService } from './cats.service';

    describe('CatsController', () => {
    let catsController: CatsController;
    let catsService: CatsService;

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({  // test 클래스를 통해, 테스트용 모듈 생성
            controllers: [CatsController],
            providers: [CatsService],
        }).compile();   // compile 메서드를 통해, 해당 테스트 모듈 셋업 ~ (async job / 컴파일 후 .get()으로 참조 가능!)

        // 정적 모듈(프로바이더) 참조 (이미 정의된)
        catsService = moduleRef.get<CatsService>(CatsService);
        catsController = moduleRef.get<CatsController>(CatsController);

        // 동적 or scope 모듈 참조 (modue ref 에서 본 것처럼)
        catsService = await moduleRef.resolve(CatsService);

    });
    // 일반적인 단위 테스트
    describe('findAll', () => {
            it('should return an array of cats', async () => {
                const result = ['test'];
                jest.spyOn(catsService, 'findAll').mockImplementation(() => result);

                expect(await catsController.findAll()).toBe(result);
            });
        });
    });
    ```
  - end-to-end test
    - API 레벨 (요청단위)의 테스트 (Supertest)
    ```
    import * as request from 'supertest';
    import { Test } from '@nestjs/testing';
    import { CatsModule } from '../../src/cats/cats.module';
    import { CatsService } from '../../src/cats/cats.service';
    import { INestApplication } from '@nestjs/common';

    describe('Cats', () => {
      let app: INestApplication;
      let catsService = { findAll: () => ['test'] };

      beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({  // 테스트 모듈 셋업
          imports: [CatsModule],
        })
        .overrideProvider(CatsService)
        .useValue(catsService)      // 요청 비즈니스 로직 수행하는 service 갈아끼움
        .compile();     // 테스트 모듈 컴파일

        app = moduleRef.createNestApplication();    // 전체 Nest 런타임 환경 셋업
        await app.init();   // 테스트 앱 실행
      });

      it(`/GET cats`, () => {
        return request(app.getHttpServer()) // supertest의 request에 nest http 리스너 참조 전달
        .get('/cats')       // GET /cats 요청
        .expect(200)
        .expect({
          data: catsService.findAll(),
        });
      });

      afterAll(async () => {
        await app.close();
      });
    });
    ```
    - 대체구현
      - 위에서 구현한 overrideProvider() 처럼, overrideGuard(), overrideInterceptor(), overrideFilter(),
        overridePipe() 활용해서 원하는 객체 대체
      - 값 주입은 useClass() ~ 클래스 주입 / useValue() ~ 인스턴스 주입 / useFactory() ~ 인스턴스 반환하는 함수로 처리!
  - token 가드 등, 글로벌 객체(인터셉터)에 대한 테스트용 재정의도 가능 (over riding)
  - 요청 scope에 대한 컨텍스트 참조의 경우, 
    ```
    const contextId = ContextIdFactory.create();
    // ContextIdFactory와 Jest로 참조 얻기 가능!
    jest
      .spyOn(ContextIdFactory, 'getByRequest')
      .mockImplementation(() => contextId);
    ```