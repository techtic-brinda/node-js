import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToMany, BeforeInsert, OneToOne, JoinColumn } from "typeorm";
import { Connector } from "./connector.entity";
import { Country } from "./country.entity";
import { PriceComponents } from "./priceComponent.entity";
import { TariffRestrictions } from "./tariffRestrictions.entity";
import { TerrifPrice } from "./terrifPrice.entity";
import { Transaction } from "./transaction.entity";
import { User } from "./user.entity";

@Entity('tariffs')
export class Terrif {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    country_id: number;

    @Column()
    party_id: string;

    @Column()
    currency: string;

    @Column()
    flat_rate: string;

    @Column()
    title: string;

    @Column()
    description: string;

    @Column()
    energy_type: string;
    //energy_type: "AC"| "DC";

    @Column({
        type: "enum",
        enum: ["AD_HOC_PAYMENT","PROFILE_CHEAP","PROFILE_FAST","PROFILE_GREEN", "REGULAR"]
    })
    type: "AD_HOC_PAYMENT"| "PROFILE_CHEAP"| "PROFILE_FAST" | "PROFILE_GREEN" | "REGULAR";

    @Column()
    tariff_alt_url: string;

    @Column()
    parking_fees: string;

    @CreateDateColumn()
    public created_at: Date;

    @UpdateDateColumn()
    public last_updated: Date;


    @OneToMany(type => Connector, connector => connector.tariff_id)
    connectors: Connector[];

    @OneToOne(type => Country, country => country.terrifs)
    @JoinColumn({ name: "country_id" })
    countries: Country;

    @OneToOne(type => TariffRestrictions, tariffRestrictions => tariffRestrictions.terrifRestrictions)
    restrictions: TariffRestrictions[];

    @OneToMany(type => PriceComponents, priceComponents => priceComponents.terrifPriceComponent)
    @JoinColumn({ name: "id" })
    price_components: PriceComponents;

    @OneToOne(type => PriceComponents, priceComponents => priceComponents.terrifPriceComponent)
    @JoinColumn({ name: "id" })
    price_component: PriceComponents;

    @OneToOne(type => User, user => user.teriff)
    @JoinColumn({ name: "party_id" })
    user: User;

    @OneToMany(type => TerrifPrice, teriffPrice => teriffPrice.terrif)
    terrif_price: TerrifPrice;

    @OneToOne(type => User, user => user.tarrif)
    @JoinColumn({ name: "party_id" })
    terrifUser: User;

    @OneToOne(type => Transaction, transaction => transaction.terrif)
    @JoinColumn({ name: "id", referencedColumnName: 'terrif_id' })
    transaction: Transaction;

    @DeleteDateColumn()
    public deleted_at: Date;
}
