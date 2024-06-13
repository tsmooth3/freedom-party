/*
  Warnings:

  - You are about to drop the `EventRound` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EventRoundStation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TeamScore` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "EventRound";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "EventRoundStation";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "TeamScore";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Team" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "eventId" INTEGER NOT NULL,
    "teamName" TEXT NOT NULL,
    "teamShooter1" TEXT NOT NULL,
    "teamShooter2" TEXT NOT NULL,
    "teamState" TEXT NOT NULL,
    "teamTotal" INTEGER DEFAULT 0,
    "teamShotsFired" INTEGER DEFAULT 0,
    CONSTRAINT "Team_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "ShootEvent" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Round" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "eventId" INTEGER NOT NULL,
    "teamId" INTEGER NOT NULL,
    "roundName" TEXT NOT NULL,
    "roundIndex" INTEGER NOT NULL,
    "roundStationCount" INTEGER NOT NULL,
    "roundAmmo" TEXT NOT NULL,
    "roundClays" TEXT NOT NULL,
    "roundState" TEXT NOT NULL,
    CONSTRAINT "Round_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "ShootEvent" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Round_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Station" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "eventId" INTEGER NOT NULL,
    "teamId" INTEGER NOT NULL,
    "roundId" INTEGER NOT NULL,
    "stationIndex" INTEGER NOT NULL,
    "stationAmmo" TEXT NOT NULL,
    "stationClays" TEXT NOT NULL,
    "stationState" TEXT NOT NULL,
    CONSTRAINT "Station_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "ShootEvent" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Station_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Station_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
