/*
  Warnings:

  - You are about to drop the column `roundStations` on the `EventRound` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "EventRoundStation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "eventId" INTEGER NOT NULL,
    "teamId" INTEGER NOT NULL,
    "roundId" INTEGER NOT NULL,
    "stationIndex" INTEGER NOT NULL,
    "stationAmmo" TEXT NOT NULL,
    "stationClays" TEXT NOT NULL,
    "stationState" TEXT NOT NULL,
    CONSTRAINT "EventRoundStation_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "ShootEvent" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "EventRoundStation_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "TeamScore" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "EventRoundStation_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "EventRound" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_EventRound" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "eventId" INTEGER NOT NULL,
    "teamId" INTEGER NOT NULL,
    "roundName" TEXT NOT NULL,
    "roundIndex" INTEGER NOT NULL,
    "roundAmmo" TEXT NOT NULL,
    "roundClays" TEXT NOT NULL,
    "roundState" TEXT NOT NULL,
    CONSTRAINT "EventRound_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "ShootEvent" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "EventRound_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "TeamScore" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_EventRound" ("eventId", "id", "roundAmmo", "roundClays", "roundIndex", "roundName", "roundState", "teamId") SELECT "eventId", "id", "roundAmmo", "roundClays", "roundIndex", "roundName", "roundState", "teamId" FROM "EventRound";
DROP TABLE "EventRound";
ALTER TABLE "new_EventRound" RENAME TO "EventRound";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
