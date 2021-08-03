import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, JoinColumn, ManyToOne, OneToMany, OneToOne } from "typeorm";
import { Evse } from "./evse.entity";
import { Terrif } from "./terrif.entity";
import { Transaction } from "./transaction.entity";


@Entity('connector')
export class Connector {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    evse_id: string;

    @Column()
    standard: string;

    @Column()
    uid: string;

    /*  @Column()
     format: string; */

    /*  @Column()
     power_type: string; */

    @Column({
        type: "enum",
        enum: ["SOCKET", "CABLE"]
    })
    format: "SOCKET" | "CABLE";

    @Column({
        type: "enum",
        enum: ["AC_1_PHASE", "AC_3_PHASE", "DC"]
    })
    power_type: "AC_1_PHASE" | "AC_3_PHASE" | "DC";


    @Column()
    max_voltage: string;

    @Column()
    max_amperage: string;

    @Column()
    max_electric_power: string;

    @Column()
    terms_and_conditions: string;

    @Column()
    tariff_ids: string;

    @CreateDateColumn()
    public created_at: Date;

    @UpdateDateColumn()
    public last_updated: Date;

    @DeleteDateColumn()
    public deleted_at: Date;

    @OneToOne(type => Evse, evse => evse.connectors)
    @JoinColumn({ name: "evse_id" })
    eves: Evse;

    @OneToOne(type => Terrif, terrif => terrif.connectors)
    @JoinColumn({ name: "tariff_ids" })
    tariff_id: Terrif[];

    @OneToOne(type => Transaction, transaction => transaction.connector)
    @JoinColumn({ name: "id", referencedColumnName: 'connector_id' })
    transactions: Transaction;

}
