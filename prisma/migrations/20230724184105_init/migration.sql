/*
  Warnings:

  - Added the required column `roundIndex` to the `EventRound` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EventRound" ADD COLUMN     "roundIndex" INTEGER NOT NULL;
