import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, type: 'varchar', length: 255 })
  email: string;

  @Column({ unique: true, type: 'varchar', length: 255 })
  googleId: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  firstName: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  lastName: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  fullName: string | null;

  @Column({ type: 'varchar', length: 512, nullable: true })
  profilePicture: string | null;

  @Column({ type: 'varchar', length: 20, default: 'google' })
  authProvider: 'google';

  @Column({ type: 'boolean', default: false })
  isEmailVerified: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
