-- AlterTable
ALTER TABLE "users" ADD COLUMN     "linkCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "uniqueCountryCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "visits" (
    "id" TEXT NOT NULL,
    "linkId" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "visits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "visits_linkId_country_key" ON "visits"("linkId", "country");

-- AddForeignKey
ALTER TABLE "visits" ADD CONSTRAINT "visits_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "links"("id") ON DELETE CASCADE ON UPDATE CASCADE;
