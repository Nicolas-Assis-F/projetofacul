import { AppDataSource } from "../config/database";
import { Loan } from "../entities/Loan";
import { Product } from "../entities/Product";
import { User } from "../entities/User";
import { IsNull } from "typeorm";
import { HttpError } from "../middlewares/validateParams";
import { PaginationParams } from "./UserService";

export class LoanService {
  async findAll({ page, limit }: PaginationParams) {
    const [data, total] = await AppDataSource.getRepository(Loan).findAndCount({
      relations: ["user", "product", "product.productCategory"],
      order: { createdAt: "DESC", id: "DESC" },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
  async create(data: {
    userId: number;
    productId: number;
    dueAt: string;
    notes?: string;
  }) {
    return AppDataSource.transaction(async (manager) => {
      const product = await manager.findOne(Product, {
        where: { id: data.productId },
        lock: { mode: "pessimistic_write" },
      });
      if (!product) throw new HttpError(422, "Equipamento não encontrado.");
      const user = await manager.findOne(User, {
        where: { id: data.userId },
        lock: { mode: "pessimistic_write" },
      });
      if (!user) throw new HttpError(422, "Pessoa não encontrada.");
      const person = await manager.findOneOrFail(User, {
        where: { id: user.id },
        relations: ["situation"],
      });
      const item = await manager.findOneOrFail(Product, {
        where: { id: product.id },
        relations: ["productSituation"],
      });
      if (person.situation.nameSituation !== "Active")
        throw new HttpError(
          409,
          "Somente pessoas ativas podem retirar equipamentos.",
        );
      if (item.productSituation.name !== "Available")
        throw new HttpError(
          409,
          "Este equipamento não está disponível para empréstimo.",
        );
      if (
        await manager.exists(Loan, {
          where: { productId: product.id, returnedAt: IsNull() },
        })
      )
        throw new HttpError(409, "Este equipamento já está emprestado.");
      return manager.save(
        Loan,
        manager.create(Loan, { ...data, dueAt: new Date(data.dueAt) }),
      );
    });
  }
  async returnLoan(id: number) {
    return AppDataSource.transaction(async (manager) => {
      const loan = await manager.findOne(Loan, {
        where: { id },
        lock: { mode: "pessimistic_write" },
      });
      if (!loan) throw new HttpError(404, "Empréstimo não encontrado.");
      if (loan.returnedAt)
        throw new HttpError(409, "A devolução já foi registrada.");
      loan.returnedAt = new Date();
      return manager.save(Loan, loan);
    });
  }
}
