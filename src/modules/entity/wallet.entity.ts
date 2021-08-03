import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from "typeorm";
import { Transaction } from "./transaction.entity";
import { User } from "./user.entity";
@Entity('wallets')
export class Wallet {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    user_id: number;

    @Column()
    balance: string;

    @Column()
    description: string;

    @Column()
    type: string;

    @Column()
    details: string;

    @Column()
    method: string;

    @Column()
    payment_id: string;

    @Column()
    transaction_id: number;

    @Column({default: 'balance'})
    wallet_type: string;

    @CreateDateColumn()
    public created_at: Date;

    @UpdateDateColumn()
    public updated_at: Date;

    @OneToMany(type => User, user => user.user_wallets)
    user: User;

    @ManyToOne(type => Transaction)
    @JoinColumn({ name: 'transaction_id', referencedColumnName: 'id' })
    transaction: Transaction;
}
