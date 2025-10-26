/*
  Warnings:

  - You are about to drop the `Catergories` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `categories_id` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "categories_id" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."Catergories";

-- CreateTable
CREATE TABLE "Categories" (
    "categories_id" TEXT NOT NULL,
    "categories_name" TEXT NOT NULL,

    CONSTRAINT "Categories_pkey" PRIMARY KEY ("categories_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Categories_categories_name_key" ON "Categories"("categories_name");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categories_id_fkey" FOREIGN KEY ("categories_id") REFERENCES "Categories"("categories_id") ON DELETE RESTRICT ON UPDATE CASCADE;
