import { Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Column, OneToOne, JoinColumn, OneToMany, AfterLoad } from "typeorm";
import { ChargerType } from "./chargerType.entity";
import { Connector } from "./connector.entity";
import { EvseLog } from "./evseLog.entity";
import { Location } from "./location.entity";
import { PromoCode } from "./promoCode.entity";
import { Terrif } from "./terrif.entity";
import { User } from "./user.entity";

@Entity('transaction')
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column()
  transaction_id: number;

  @Column()
  other: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column()
  total_energy: number;

  @Column()
  user_electrict_deduction: number;

  @Column()
  status: string;

  @CreateDateColumn()
  public created_at: Date;

  @UpdateDateColumn()
  public updated_at: Date;

  @Column()
  location_id: number;

  @Column()
  party_id: number;

  @Column()
  vehicle_id: number;

  @Column()
  connector_id: number;

  @Column('decimal', { precision: 10, scale: 2 })
  total_amount: number;

  @Column('decimal', { precision: 10, scale: 2 })
  franchise_deduction: number;

  @Column('decimal', { precision: 10, scale: 2 })
  electrict_deduction: number;

  @Column('decimal', { precision: 10, scale: 2 })
  cpo_coupon_deduction: number;

  @Column('decimal', { precision: 10, scale: 2 })
  kwik_promo_avail: number;

  @Column('decimal', { precision: 10, scale: 2 })
  caseback_available: number;

  @Column()
  terrif_id: number;

  @Column('decimal', { precision: 10, scale: 2 })
  flat_rate: number;

  @Column('decimal', { precision: 10, scale: 2 })
  parking_rate: number;

  @Column()
  invoice_number: string;

  @Column()
  promocode_id: number;

  @Column()
  target_charging_minutes: number;

  @Column()
  actual_charging_minutes: number;

  @Column()
  charger_type_id: number;

  @Column('decimal', { precision: 10, scale: 2 })
  cpo_gst_deduction: number;

  @Column('decimal', { precision: 10, scale: 2 })
  cpo_kwick_cashback: number;

  @Column('decimal', { precision: 10, scale: 2 })
  cpo_kwick_cashback_gst: number;

  @Column('decimal', { precision: 10, scale: 2 })
  cpo_final_payout:number

  @AfterLoad()
  afterLoad() {
      this.parking_rate = this.parking_rate ? this.parking_rate : 0;
  }

  @OneToOne(type => User, user => user.transaction)
  @JoinColumn({ name: "user_id" })
  user: User;

  @OneToOne(type => User, user => user.owner_transaction)
  @JoinColumn({ name: "party_id" })
  owner: User;

  @OneToOne(type => Location, location => location.transactions)
  @JoinColumn({ name: "location_id" })
  location: Location;

  @OneToOne(type => Connector, connector => connector.transactions)
  @JoinColumn({ name: "connector_id", referencedColumnName: 'id' })
  connector: Connector;

  @OneToOne(type => Terrif, terrif => terrif.transaction)
  @JoinColumn({ name: "terrif_id", referencedColumnName: 'id' })
  terrif: Terrif;

  @OneToOne(type => ChargerType, chargerType => chargerType.transaction)
  @JoinColumn({ name: "charger_type_id", referencedColumnName: 'id' })
  chargerType: ChargerType;

  @OneToOne(type => PromoCode, chargerType => chargerType.transaction)
  @JoinColumn({ name: "promocode_id", referencedColumnName: 'id' })
  promoCode: PromoCode;

}
