-- CreateEnum
CREATE TYPE "userRole" AS ENUM ('ADMIN', 'USER');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "role" "userRole" DEFAULT 'USER';
