import { MigrationInterface, QueryRunner } from "typeorm";
export class CreateLoans1792670400000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE loans (
      id SERIAL PRIMARY KEY,
      "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
      "productId" INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
      "dueAt" TIMESTAMPTZ NOT NULL,
      "returnedAt" TIMESTAMPTZ,
      notes VARCHAR(500) NOT NULL DEFAULT '',
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`);
    await queryRunner.query(
      'CREATE UNIQUE INDEX one_active_loan_per_product ON loans ("productId") WHERE "returnedAt" IS NULL',
    );
  }
  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("DROP TABLE loans");
  }
}
