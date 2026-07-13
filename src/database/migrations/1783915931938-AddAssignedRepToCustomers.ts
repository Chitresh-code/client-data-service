import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAssignedRepToCustomers1783915931938 implements MigrationInterface {
    name = 'AddAssignedRepToCustomers1783915931938'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "customers" ADD "assigned_rep" uuid`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "customers" DROP COLUMN "assigned_rep"`);
    }

}
