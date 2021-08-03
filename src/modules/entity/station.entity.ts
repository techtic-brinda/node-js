import { Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Column } from "typeorm";

@Entity('station')
export class Station {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  identity: string;

  @Column()
  vendor: string;

  @Column()
  model: string;

  @Column()
  centralSystemUrl	: string;

  @Column()
  meterValue: number;

  @Column()
  chargeInProgress: number;

  @Column()
  currentTransactionId: number;

  @Column()
  currentChargingPower: number;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;
  station: any;

}
