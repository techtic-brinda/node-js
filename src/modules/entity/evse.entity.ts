import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, JoinColumn, ManyToOne, OneToMany, OneToOne, BaseEntity } from "typeorm";
import { Connector } from "./connector.entity";
import { EvseCapability } from "./evseCapability.entity";
import { Location } from "./location.entity";

/* export enum EvseStatus{
  AVAILABLE = "AVAILABLE",//not using
  BLOCKED = "BLOCKED",
  CHARGING = "CHARGING",
  INOPERATIVE = "INOPERATIVE",
  OUTOFORDER = "OUTOFORDER",
  PLANNED = "PLANNED",
  REMOVED = "REMOVED",
  RESERVED = "RESERVED",
  UNKNOWN = "UNKNOWN",
} */

@Entity('evse')
export class Evse extends BaseEntity {
//export class Evse {
    @PrimaryGeneratedColumn()
    uid: number;

    @Column()
    location_id: number;

    @Column()
    evse_id: string;

    @Column()
    centralSystemUrl: string

    @Column()
    meterValue: number = 0;

    @Column()
    currentChargingPower: number = 11000;

   /*  @Column({
        type: "enum",
        enum: ["AVAILABLE","BLOCKED","CHARGING","INOPERATIVE","OUTOFORDER","PLANNED","REMOVED","RESERVED","UNKNOWN"]
    })
    status: "AVAILABLE" | "BLOCKED" | "CHARGING" | "INOPERATIVE" | "OUTOFORDER" | "PLANNED" | "REMOVED" | "RESERVED" | "UNKNOWN"; */

    @Column()
    status: string;

    @Column()
    floor_level: string;

    @Column()
    physical_reference: string;

    @Column()
    latitude: string;

    @Column()
    longitude: string;

    @Column()
    parking_restrictions: string

    // @Column()
    // vendor: string = process.env.DEFAULT_VENDOR;

   // @Column()
   // model: string = process.env.DEFAULT_MODEL;

    @Column()
    chargeInProgress: Boolean;

    @Column()
    currentTransactionId: number;

    @CreateDateColumn()
    public created_at: Date;

    @UpdateDateColumn()
    public last_updated: Date;

    @DeleteDateColumn()
    public deleted_at: Date;

    @OneToOne(type => Location, location => location.evses)
    @JoinColumn({ name: "location_id" })
    location: Location;

    @OneToMany(type => Connector, connector => connector.eves)
    connectors: Connector[];

    @OneToMany(type => EvseCapability, evseCapability => evseCapability.eves)
    capabilities: EvseCapability[];

    connector_id: number;
    id_token: string;
    reservationId: number;
    transactionId: number;
    total_energy: number;
}
