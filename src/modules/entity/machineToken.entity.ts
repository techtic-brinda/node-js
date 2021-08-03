import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('machine_token')
export class MachineToken {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    location_id: number;

    @Column()
    evse_uuid: number;

    @Column()
    evse_id: string;

    @Column()
    connector_id: number;

    @Column()
    id_token: string;

    @CreateDateColumn()
    public created_at: Date;

    @UpdateDateColumn()
    public updated_at: Date;

    @DeleteDateColumn()
    public deleted_at: Date;

}
