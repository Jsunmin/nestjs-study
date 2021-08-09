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