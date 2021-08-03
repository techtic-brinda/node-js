import { Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Column, DeleteDateColumn, OneToOne, JoinColumn, OneToMany } from "typeorm";
import { VehicleMake } from "./vehicleMake.entity";
import { VehicleModel } from "./vehicleModel.entity";
import { User } from "./user.entity";
import { VehicleChargerType } from "./vehicleChargerType.entity";

@Entity('vehicles')
export class Vehicle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  user_id: number;

  @Column()
  maker_id: number;

  @Column()
  model_id: number;

  @Column()
  charger_type_id: string;

  @Column()
  year: string;

  @Column()
  reg_no: string;

  @Column()
  status: string;

  @Column()
  verint: string;

  @CreateDateColumn()
  public created_at: Date;

  @UpdateDateColumn()
  public updated_at: Date;

  @DeleteDateColumn()
  public deleted_at: Date;

  @OneToOne(type => VehicleMake, vehicleMake => vehicleMake.make_vehicle)
  @JoinColumn({ name: "maker_id" })
  make: VehicleMake;

  @OneToOne(type => VehicleModel, vehicleModel => vehicleModel.model_vehicle)
  @JoinColumn({ name: "model_id" })
  model: VehicleModel;

  @OneToOne(type => User, user => user.vehicle)
  @JoinColumn({ name: "user_id" })
  user: User;

  @OneToMany(type => VehicleChargerType, vehicleChargerType => vehicleChargerType.vehicle)
  charger_types: VehicleChargerType[];
}