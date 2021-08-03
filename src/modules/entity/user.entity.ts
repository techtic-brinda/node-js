import { Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Column, AfterLoad, ManyToMany, JoinTable, JoinColumn, OneToOne, OneToMany, DeleteDateColumn } from "typeorm";
import { baseUrl } from "src/shared/helpers/utill";
import { Role } from './role.entity'
import { Vehicle } from "./vehicle.entity";
import { UserDocument } from "./userDocument.entity";
import { Location } from "./location.entity";
import { Terrif } from "./terrif.entity";
import { Wallet } from "./wallet.entity";
import { DeviceTokens } from "./deviceTokens.entity";
import { Transaction } from "./transaction.entity";
import { CpoInvoice } from "./cpoInvoice.entity";
@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  is_verified: boolean;

  // @Exclude()
  // @Column({
  //   select: false,
  //   name: 'password',
  //   length: 255,
  //   transformer: new PasswordTransformer(),
  // })
  // password: string;

  @Column()
  profile_pic: string;

  @Column()
  phone_number: string;

  @Column()
  status: string;

  @Column()
  company_name: string;

  @Column()
  gst_number: string;

  @Column()
  pan_number: string;

  @Column()
  token: string;

  @Column()
  fcm_token: string;

  @Column()
  otp: Number;

  @Column()
  is_notify: boolean;

  @Column()
  notify_count: number;

  @Column()
  apple_id: string;

  @Column()
  facebook_id: string;

  @Column()
  account_name: string;

  @Column()
  account_no: string;

  @Column()
  bank_name: string;

  @Column()
  google_id: string;
  transaction: any;

  @Column()
  address1: string;

  @Column()
  address2: string;

  @Column()
  city: string;

  @Column()
  state: string;

  @Column()
  pincode: string;

  @AfterLoad()
  afterLoad() {
    this.profile_pic = this.profile_pic ? baseUrl(this.profile_pic) : '';
  }

  @CreateDateColumn()
  public created_at: Date;

  @UpdateDateColumn()
  public updated_at: Date;

  @DeleteDateColumn()
  public deleted_at: Date;

  @ManyToMany(() => Role, { eager: true })
  @JoinTable({
    name: 'user_has_role',
    joinColumns: [
      { name: 'user_id' }
    ],
    inverseJoinColumns: [
      { name: 'role_id' }
    ]
  })
  roles: Role[];

  @OneToOne(type => Vehicle, vehicle => vehicle.user)
  @JoinColumn({ name: "id" })
  vehicle: Vehicle;

  @OneToMany(type => UserDocument, userDocument => userDocument.user)
  @JoinColumn({ name: "id" })
  userdocument: UserDocument;

  @OneToOne(type => Location, location => location.user)
  @JoinColumn({ name: "id" })
  location: Location;

  @OneToOne(type => CpoInvoice, cpoInvoice => cpoInvoice.owner)
  @JoinColumn({ name: "id" })
  cpoInvoice: CpoInvoice;

  @OneToOne(type => Terrif, terrif => terrif.user)
  @JoinColumn({ name: "id" })
  teriff: Terrif;


  @Column('decimal', { precision: 10, scale: 2 })
  balance: number

  @Column('decimal', { precision: 10, scale: 2 })
  caseback_amount: number

  @OneToMany(type => Wallet, walletData => walletData.user)
  @JoinColumn({ name: "id" })
  user_wallets: Wallet[];

  @OneToMany(type => Terrif, party => party.terrifUser)
  @JoinColumn({ name: "id" })
  tarrif: Terrif[];

  @OneToOne(type => DeviceTokens, deviceTokens => deviceTokens.user)
  //@JoinColumn({ name: "id", referencedColumnName: 'user_id' })
  device_token: DeviceTokens;

  @OneToOne(type => Transaction, transaction => transaction.owner)
  @JoinColumn({ name: "id", referencedColumnName: 'party_id' })
  owner_transaction: Transaction;
}
