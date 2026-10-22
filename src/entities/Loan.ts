import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { User } from "./User";
import { Product } from "./Product";

@Entity("loans")
@Index("one_active_loan_per_product", ["productId"], {
  unique: true,
  where: '"returnedAt" IS NULL',
})
export class Loan {
  @PrimaryGeneratedColumn() id!: number;
  @Column({ type: "int" }) userId!: number;
  @Column({ type: "int" }) productId!: number;
  @Column({ type: "timestamptz" }) dueAt!: Date;
  @Column({ type: "timestamptz", nullable: true }) returnedAt!: Date | null;
  @Column({ type: "varchar", length: 500, default: "" }) notes!: string;
  @CreateDateColumn({ type: "timestamptz" }) createdAt!: Date;
  @ManyToOne(() => User, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "userId" })
  user!: User;
  @ManyToOne(() => Product, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "productId" })
  product!: Product;
}
