import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from 'src/entities/Users';
import { ChannelMembers } from 'src/entities/ChannelMembers';
import { Channels } from 'src/entities/Channels';
import { WorkspaceMembers } from 'src/entities/WorkspaceMembers';
import { Workspaces } from 'src/entities/Workspaces';
import { Repository, getConnection } from 'typeorm';

@Injectable()
export class WorkspacesService {
  constructor(
    // 내부 DI를
    @InjectRepository(Workspaces)
    private workspacesRepository: Repository<Workspaces>,
    @InjectRepository(Channels)
    private channelsRepository: Repository<Channels>,
    @InjectRepository(WorkspaceMembers)
    private workspaceMembersRepository: Repository<WorkspaceMembers>,
    @InjectRepository(ChannelMembers)
    private channelMembersRepository: Repository<ChannelMembers>,
    @InjectRepository(Users)
    private usersRepository: Repository<Users>,
  ) {}

  // 내부 DI를 이렇게 바깥 프로퍼티로 뺼 수 있는데, 이는 extends를 통한 강력한 결합의 상태값 전달을 위해 쓰인다! ~ 권장은 constructor 내부!
  // @InjectRepository(Workspaces)
  // private workspacesRepository: Repository<Workspaces>,
  // @InjectRepository(Channels)
  // private channelsRepository: Repository<Channels>,

  async findById(id: number) {
    return this.workspacesRepository.findByIds([id]);
  }

  async findMyWorkspaces(myId: number) {
    return this.workspacesRepository.find({
      where: {
        WorkspaceMembers: [{ UserId: myId }], // where 내부에서 관계 테이블을 통해 데이터 가져옴 (include 필요 X)
      },
    });
  }

  async createWorkspace(name: string, url: string, myId: number) {
    // 데이터 엔티티 생성
    const workspace = this.workspacesRepository.create({
      name,
      url,
      OwnerId: myId,
    });

    // 트랜잭션 세팅
    const connection = getConnection();
    const queryRunner = connection.createQueryRunner();
    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const returned = await queryRunner.manager
        .getRepository(Workspaces)
        .save(workspace);

      // 클래스 통한 생성
      const workspaceMember = new WorkspaceMembers();
      workspaceMember.UserId = myId;
      workspaceMember.WorkspaceId = returned.id;
      const channel = new Channels();
      channel.name = '일반';
      channel.WorkspaceId = returned.id;

      // 동시처리부분
      const [, channelReturned] = await Promise.all([
        queryRunner.manager
          .getRepository(WorkspaceMembers)
          .save(workspaceMember),
        queryRunner.manager.getRepository(Channels).save(channel),
      ]);
      const channelMember = new ChannelMembers();
      channelMember.UserId = myId;
      channelMember.ChannelId = channelReturned.id;
      await queryRunner.manager
        .getRepository(ChannelMembers)
        .save(channelMember);

      await queryRunner.commitTransaction();
      return true;
    } catch (err) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  async getWorkspacemembers(url: string) {
    // sql처럼 유연하게 사용할 수 있게 쿼리를 만들어주는 툴
    return (
      this.usersRepository
        .createQueryBuilder('u')
        .innerJoin('u.WorkspaceMembers', 'wm')
        // 다대다 테이블에서 한번 더 추적
        // 데이터 조건절 정의 (:=) & 해당 value 추가
        .innerJoin('wm.Workspace', 'w', 'w.url = :url', { url })
        // raw 들어가면 DB result에 가깝게 리턴, get은 class로 감싼 형식으로 리턴
        .getMany()
    );
  }

  async createWorkspaceMembers(url, email) {
    // 레파지토리 표현
    const workspace = await this.workspacesRepository.findOne({
      where: { url },
      // relations: ['Channels'],
      join: {
        alias: 'workspace',
        innerJoinAndSelect: {
          channels: 'workspace.Channels',
        },
      },
    });
    // 쿼리빌더 표현
    // == this.workspacesRepository.createQueryBuilder('w').innerJoinAndSelect('w.Channels', 'c').getOne()

    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) {
      return null;
    }
    const workspaceMember = new WorkspaceMembers();
    workspaceMember.WorkspaceId = workspace.id;
    workspaceMember.UserId = user.id;
    await this.workspaceMembersRepository.save(workspaceMember);
    const channelMember = new ChannelMembers();
    channelMember.ChannelId = workspace.Channels.find(
      (v) => v.name === '일반',
    ).id;
    channelMember.UserId = user.id;
    await this.channelMembersRepository.save(channelMember);
  }

  // knex와 비슷하게 디테일한 쿼리빌더 지원!
  async getWorkspaceMember(url: string, id: number) {
    return (
      this.usersRepository
        .createQueryBuilder('user')
        .where('user.id = :id', { id })
        // 복수의 조건은 다음과 같은 쿼리빌더 기능을 붙일 수 있다!
        //orWhere andWhere('user.name = :name', { name }))
        .innerJoinAndSelect(
          'user.Workspaces',
          'workspaces',
          'workspaces.url = :url',
          {
            url,
          },
        )
        .getOne()
    );
  }
}
