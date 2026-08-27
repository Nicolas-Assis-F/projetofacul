import { AppDataSource } from "../config/database";
import { User } from "../entities/User";

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class UserService {
  private get repo() {
    return AppDataSource.getRepository(User);
  }

  /**
   * Returns a paginated list of users.
   *
   * skip = (page - 1) * limit  →  offset-based pagination
   * take = limit               →  how many records per page
   */
  async findAll({
    page,
    limit,
  }: PaginationParams): Promise<PaginatedResult<User>> {
    const skip = (page - 1) * limit;

    const [data, total] = await this.repo.findAndCount({
      relations: ["situation"],
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

  async findById(id: number): Promise<User | null> {
    return this.repo.findOne({ where: { id }, relations: ["situation"] });
  }

  async create(
    data: Pick<User, "name" | "email" | "situationId">,
  ): Promise<User> {
    const user = this.repo.create(data);
    return this.repo.save(user);
  }

  async update(
    id: number,
    data: Partial<Pick<User, "name" | "email" | "situationId">>,
  ): Promise<User | null> {
    const user = await this.repo.findOneBy({ id });
    if (!user) return null;
    this.repo.merge(user, data);
    return this.repo.save(user);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repo.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
