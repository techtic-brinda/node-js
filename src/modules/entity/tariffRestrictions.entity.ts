import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToMany, BeforeInsert, JoinColumn, OneToOne } from "typeorm";
import { Terrif } from "./terrif.entity";

@Entity('tariff_restrictions')
export class TariffRestrictions {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    terrif_id: number;

    @Column()
    start_time: string;

    @Column()
    end_time: string;

    @Column()
    start_date: string;

    @Column()
    end_date: string;

    @Column()
    min_kwh: string;

    @Column()
    max_kwh: string;

    @Column()
    min_current: string;

    @Column()
    max_current: string;

    @Column()
    min_power: string;

    @Column()
    max_power: string;

    @Column()
    min_duration: number;

    @Column()
    max_duration: number;    

    @Column()
    day_of_week: string;

    @Column()
    reservation: string;
    
    @OneToOne(type => Terrif, terrif => terrif.restrictions)
    @JoinColumn({ name: "terrif_id", referencedColumnName: 'id' })
    terrifRestrictions: Terrif;

}
