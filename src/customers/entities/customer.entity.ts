import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Persona } from './persona.entity';

export enum CustomerStatus {
  PROSPECT = 'prospect',
  ACTIVE = 'active',
  CHURNED = 'churned',
}

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'varchar', nullable: true })
  domain: string | null;

  @Column({ type: 'varchar', nullable: true })
  industry: string | null;

  @Column({ name: 'employee_count', type: 'int', nullable: true })
  employeeCount: number | null;

  @Column({
    type: 'enum',
    enum: CustomerStatus,
    default: CustomerStatus.PROSPECT,
  })
  status: CustomerStatus;

  @OneToMany(() => Persona, (persona) => persona.customer)
  personas: Persona[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
