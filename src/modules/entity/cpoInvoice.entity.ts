import { Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Column, DeleteDateColumn, OneToMany, OneToOne, JoinColumn } from "typeorm";
import { User } from "./user.entity";


@Entity('cpo_invoices')
export class CpoInvoice {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    owner_id: string;

    @Column()
    invoice_number: string;

    @Column()
    month: string;

    @Column()
    year: string;

    @Column()
    path: string;

    @CreateDateColumn()
    public created_at: Date;

    @UpdateDateColumn()
    public updated_at: Date;

    @OneToOne(type => User, user => user.cpoInvoice)
    @JoinColumn({ name: "owner_id" })
    owner: User;
}
