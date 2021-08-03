import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToMany, BeforeInsert, JoinColumn, OneToOne } from "typeorm";
import { Terrif } from "./terrif.entity";

@Entity('terrif_price')
export class TerrifPrice {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    terrif_id: number;

    /* @Column()
    type: string; */

    @Column({
        type: "enum",
        enum: ["min_price", "max_price"]
    })
    type: "min_price" | "max_price";

    @Column()
    excl_vat: number;

    @Column()
    incl_vat: number;

    @CreateDateColumn()
    public created_at: Date;

    @UpdateDateColumn()
    public last_updated: Date;

    @OneToOne(type => Terrif, terrif => terrif.terrif_price)
    @JoinColumn({ name: "terrif_id" })
    terrif: Terrif;
}
