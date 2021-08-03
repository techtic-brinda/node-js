import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity('settings')
export class Setting {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    key: string;

    @Column()
    value: string;
}
