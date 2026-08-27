import { AppDataSource } from "../config/database";
import { Product } from "../entities/Product";
import { PaginatedResult, PaginationParams } from "./UserService";

export class ProductService {
  private get repo() {
    return AppDataSource.getRepository(Product);
  }

  /**
   * Returns a paginated list of products.
   *
   * skip = (page - 1) * limit  →  offset-based pagination
   * take = limit               →  how many records per page
   */
  async findAll({
    page,
    limit,
  }: PaginationParams): Promise<PaginatedResult<Product>> {
    const skip = (page - 1) * limit;

    const [data, total] = await this.repo.findAndCount({
      relations: ["productSituation", "productCategory"],
      skip,
      take: limit,
      order: { id: "ASC" },
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: number): Promise<Product | null> {
    return this.repo.findOne({
      where: { id },
      relations: ["productSituation", "productCategory"],
    });
  }

  async create(
    data: Pick<Product, "name" | "productSituationId" | "productCategoryId">,
  ): Promise<Product> {
    const product = this.repo.create(data);
    return this.repo.save(product);
  }

  async update(
    id: number,
    data: Partial<
      Pick<Product, "name" | "productSituationId" | "productCategoryId">
    >,
  ): Promise<Product | null> {
    const product = await this.repo.findOneBy({ id });
    if (!product) return null;
    this.repo.merge(product, data);
    return this.repo.save(product);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repo.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
