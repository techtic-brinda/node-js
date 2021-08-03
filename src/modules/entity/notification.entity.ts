import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, OneToOne } from "typeorm";
import { UserNotification } from "./user_notification.entity";

@Entity('notifications')
export class Notification {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    statement: string;

    @Column()
    type: string;   

    @CreateDateColumn()
    public created_at: Date;

    @UpdateDateColumn()
    public updated_at: Date;

    @OneToOne(type => UserNotification, userNotification => userNotification.notification)
    userNotification: UserNotification;
}
