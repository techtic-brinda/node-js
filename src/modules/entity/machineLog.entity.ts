import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, JoinColumn, ManyToOne, OneToOne, AfterLoad } from "typeorm";
import { Evse } from "./evse.entity";

@Entity('machine_log')
export class MachineLog {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    evse_id: string;

    @Column()
    event_name: string;

    @Column()
    request: string;

    @Column()
    response: string;

    @CreateDateColumn()
    public created_at: Date;

    @UpdateDateColumn()
    public updated_at: Date;

    @ManyToOne(type => Evse)
    @JoinColumn({ name: 'evse_id', referencedColumnName: 'evse_id' })
    evse: Evse;
   // updated_at_date: string;

    /* @AfterLoad()
    afterLoad() {
        this.updated_at_date = this.updated_at ? new Date(this.updated_at).toISOString().replace(/T/, ' ').replace(/\..+/, '')  : '';
    } */

}
