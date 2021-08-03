import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('machine_transation_log')
export class MachineTransationLog {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    location_id: number;

    @Column()
    evse_uuid: number;

    @Column()
    transaction_id: number;

    @Column()
    evse_id: string;

    @Column()
    meter_stop: number;

    @Column()
    meter_start: number;

    @Column()
    total_meter: number;

    @Column()
    start_timestamp: Date;

    @Column()
    stop_timestamp: Date;

    @Column()
    total_time: number;

    @Column()
    leave_timestamp: Date;

    @Column()
    total_parking_time: number;

    @Column()
    status: string;

    @CreateDateColumn()
    public created_at: Date;

    @UpdateDateColumn()
    public updated_at: Date;

    @DeleteDateColumn()
    public deleted_at: Date;

}
