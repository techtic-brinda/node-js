import { from } from "rxjs";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, JoinColumn, ManyToOne, OneToMany, OneToOne, JoinTable, ManyToMany } from "typeorm";
import { Connector } from "./connector.entity";
import { Country } from "./country.entity";
import { Evse } from "./evse.entity";
import { LocationFacility } from "./locationFacility.entity";
import { LocationHour } from "./locationHour.entity";
import { PromoCode } from "./promoCode.entity";
import { Transaction } from "./transaction.entity";
import { User } from "./user.entity";
import { MachineLog } from "./machineLog.entity";

@Entity('locations')
export class Location {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    party_id: string;

    // @Column()
    // country_code: number;

    @Column()
    country: number;

    @Column()
    publish: boolean;

    @Column()
    name: string;

    // @Column()
    // country_id: number;

    @Column()
    address: string;

    @Column()
    city: string;

    @Column()
    postal_code: string;

    // @Column()
    // country: number;

    @Column()
    latitude: string;

    @Column()
    longitude: string;

    @Column()
    related_locations: string;

    @Column()
    charging_when_closed: boolean;

    @Column()
    images: string;

    @Column()
    parking_type: string;

    @Column()
    energy_mix: string;

    @Column()
    time_zone: string;

    @Column()
    uid: string;

    @CreateDateColumn()
    public created_at: Date;

    @UpdateDateColumn()
    public last_updated: Date;

    @DeleteDateColumn()
    public deleted_at: Date;

    @OneToMany(type => Evse, evse => evse.location)
    evses: Evse[];

    @OneToMany(type => LocationFacility, locationFacility => locationFacility.location)
    locationFacility: LocationFacility[];

    @OneToOne(type => Country, country => country.locations)
    @JoinColumn({ name: "country" })
    countries: Country;

    @OneToOne(type => User, user => user.location)
    @JoinColumn({ name: "party_id" })
    user: User;

    @OneToOne(type => LocationHour, locationHour => locationHour.location)
    @JoinColumn({ name: "id", referencedColumnName: 'location_id' })
    opening_times: LocationHour;

    @OneToMany(type => PromoCode, promoCode => promoCode.location)
    @JoinColumn({ name: "id" })
    promocode: PromoCode[];

    @OneToMany(type => Connector, con => con.eves)
    connectors: Connector[];

    @OneToMany(type => Transaction, transaction => transaction.location)
    transactions: Transaction[];


    @OneToMany(type => Evse, evse => evse.location)
    @JoinColumn({ name: "location_id" })
    pivotEvs: Evse[];



}

