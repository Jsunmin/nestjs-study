import { Connection } from 'typeorm';
import { Factory, Seeder } from 'typeorm-seeding';
import { Channels } from '../../entities/Channels';
import { Workspaces } from '../../entities/Workspaces';

// typeorm-seeding 으로 초기 데이터 만든다!
export class CreateInitalData implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    // 초기에 쓸 워크 스페이스
    await connection
      .createQueryBuilder()
      .insert()
      .into(Workspaces)
      .values({ id: 1, name: 'Sleact', url: 'sleact' })
      .execute();
    // 초기에 쓸 워크 채널
    await connection
      .createQueryBuilder()
      .insert()
      .into(Channels)
      .values({ id: 1, name: '일반', WorkspaceId: 1, private: false })
      .execute();
  }
}
