import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, JoinColumn, ManyToOne, OneToOne } from "typeorm";

@Entity('evse_log')
export class EvseLog {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    user_id: string;

    @Column()
    evse_id: string;

    @Column()
    start_time: Date;

    @Column()
    end_time: Date;

    @Column()
    total_time: number;

    @Column()
    start_meter_value: number;

    @Column()
    end_meter_value: number;

    @Column()
    total_meter: number;

    @Column()
    type: string;

    @CreateDateColumn()
    public created_at: Date;

    @UpdateDateColumn()
    public updated_at: Date;
}
