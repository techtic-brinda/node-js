import { toSlug } from "src/common/utils";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BeforeInsert, OneToMany, JoinColumn } from "typeorm";
import { Permission } from "./permission.entity";

@Entity('role_has_permission')
export class RoleHasPermission {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    role_id: number;

    @Column()
    permission_id: number;

    @OneToMany(type => Permission, permission => permission.roleHasPermission)
    @JoinColumn({ name: "permission_id" })
    permissions: Permission[];
    
}
