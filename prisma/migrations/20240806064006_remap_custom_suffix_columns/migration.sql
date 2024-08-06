-- Rename columns instead of dropping them
ALTER TABLE "links" RENAME COLUMN "customSuffix" TO "custom_suffix";
ALTER TABLE "users" RENAME COLUMN "linkCount" TO "total_clicks";
ALTER TABLE "users" RENAME COLUMN "uniqueCountryCount" TO "unique_country_count";
ALTER TABLE "visits" RENAME COLUMN "linkId" TO "link_id";

-- Ensure the new columns have default values if necessary
ALTER TABLE "users" ALTER COLUMN "total_clicks" SET DEFAULT 0;
ALTER TABLE "users" ALTER COLUMN "unique_country_count" SET DEFAULT 0;

-- Handle the primary key constraint change
ALTER TABLE "visits" DROP CONSTRAINT "visits_pkey";
ALTER TABLE "visits" ADD CONSTRAINT "visits_pkey" PRIMARY KEY ("link_id", "country");

-- Drop the existing foreign key constraint
ALTER TABLE "visits" DROP CONSTRAINT "visits_linkId_fkey";

-- Add the new foreign key constraint
ALTER TABLE "visits" ADD CONSTRAINT "visits_link_id_fkey" FOREIGN KEY ("link_id") REFERENCES "links"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Check for duplicates before creating the unique index
DO $$
BEGIN
    IF EXISTS (SELECT custom_suffix, COUNT(*) FROM links GROUP BY custom_suffix HAVING COUNT(*) > 1) THEN
        RAISE EXCEPTION 'Duplicate values found in custom_suffix column';
    END IF;
END $$;

-- Create the unique index
CREATE UNIQUE INDEX "links_custom_suffix_key" ON "links"("custom_suffix");
