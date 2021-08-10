import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Channels } from './Channels';
import { DMs } from './DMs';
import { Mentions } from './Mentions';
import { WorkspaceMembers } from './WorkspaceMembers';
import { Users } from './Users';

// 인덱스 정의
@Index('name', ['name'], { unique: true })
@Index('url', ['url'], { unique: true })
@Index('OwnerId', ['OwnerId'], {})
// sleact DB(schema) 안에 workspaces 컬럼
@Entity({ schema: 'sleact', name: 'workspaces' })
export class Workspaces {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('varchar', { name: 'name', unique: true, length: 30 }) // 디비내 컬럼
  name: string; // 서버 어플리케이션 내부에서 쓰는 컬럼명 (ORM)

  @Column('varchar', { name: 'url', unique: true, length: 30 })
  url: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;

  @Column('int', { name: 'OwnerId', nullable: true })
  OwnerId: number | null;

  // 타테이블과의 관계 정의 (여기서 타 테이블, 타테이블에서 현재 테이블 , 옵션 cascading..)
  @OneToMany(() => Channels, (channels) => channels.Workspace)
  Channels: Channels[];

  @OneToMany(() => DMs, (dms) => dms.Workspace)
  DMs: DMs[];

  @OneToMany(() => Mentions, (mentions) => mentions.Workspace)
  Mentions: Mentions[];

  @OneToMany(
    () => WorkspaceMembers,
    (workspacemembers) => workspacemembers.Workspace,
    { cascade: ['insert'] },
  )
  WorkspaceMembers: WorkspaceMembers[];

  @ManyToOne(() => Users, (users) => users.Workspaces, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  @JoinColumn([{ name: 'OwnerId', referencedColumnName: 'id' }])
  Owner: Users;

  @ManyToMany(() => Users, (users) => users.Workspaces)
  Members: Users[];
}
