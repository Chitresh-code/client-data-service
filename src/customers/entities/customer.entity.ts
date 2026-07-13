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

  // identity-service user id of the rep this account is assigned to. Not a
  // foreign key -- identity-service owns that table, not this one. A member
  // (see JwtPayload.role) only sees customers where this matches their own
  // sub; a lead sees everything regardless.
  @Column({ name: 'assigned_rep', type: 'uuid', nullable: true })
  assignedRep: string | null;

  @OneToMany(() => Persona, (persona) => persona.customer)
  personas: Persona[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
