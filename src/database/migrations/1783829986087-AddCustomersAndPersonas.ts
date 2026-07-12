import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCustomersAndPersonas1783829986087 implements MigrationInterface {
  name = 'AddCustomersAndPersonas1783829986087';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."customers_status_enum" AS ENUM('prospect', 'active', 'churned')`,
    );
    await queryRunner.query(
      `CREATE TABLE "customers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "domain" character varying, "industry" character varying, "employee_count" integer, "status" "public"."customers_status_enum" NOT NULL DEFAULT 'prospect', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_133ec679a801fab5e070f73d3ea" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "personas" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "customer_id" uuid NOT NULL, "name" character varying NOT NULL, "email" character varying, "title" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_714aa5d028f8f3e6645e971cecd" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "personas" ADD CONSTRAINT "FK_cbca9b9cb43d1516670203add78" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "personas" DROP CONSTRAINT "FK_cbca9b9cb43d1516670203add78"`,
    );
    await queryRunner.query(`DROP TABLE "personas"`);
    await queryRunner.query(`DROP TABLE "customers"`);
    await queryRunner.query(`DROP TYPE "public"."customers_status_enum"`);
  }
}
