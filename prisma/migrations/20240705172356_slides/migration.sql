/*
  Warnings:

  - You are about to alter the column `sliderMPH` on the `Slides` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.

*/
-- AlterTable
ALTER TABLE "Slides" ALTER COLUMN "sliderMPH" SET DATA TYPE DECIMAL(65,30);
