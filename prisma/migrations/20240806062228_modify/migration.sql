/*
  Warnings:

  - The primary key for the `visits` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `created_at` on the `visits` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `visits` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `visits` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "visits_linkId_country_key";

-- AlterTable
ALTER TABLE "visits" DROP CONSTRAINT "visits_pkey",
DROP COLUMN "created_at",
DROP COLUMN "id",
DROP COLUMN "updated_at",
ADD CONSTRAINT "visits_pkey" PRIMARY KEY ("linkId", "country");
