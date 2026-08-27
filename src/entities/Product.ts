import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { ProductSituation } from "./ProductSituation";
import { ProductCategory } from "./ProductCategory";

@Entity("products")
export class Product {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 150 })
  name!: string;

  @Column({ type: "int" })
  productSituationId!: number;

  @Column({ type: "int" })
  productCategoryId!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => ProductSituation, (ps) => ps.products, { eager: false })
  @JoinColumn({ name: "productSituationId" })
  productSituation!: ProductSituation;

  @ManyToOne(() => ProductCategory, (pc) => pc.products, { eager: false })
  @JoinColumn({ name: "productCategoryId" })
  productCategory!: ProductCategory;
}
