-- CreateTable
CREATE TABLE "ShootEvent" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "eventName" TEXT NOT NULL,
    "eventState" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "EventRound" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "eventId" INTEGER NOT NULL,
    "teamId" INTEGER NOT NULL,
    "roundName" TEXT NOT NULL,
    "roundIndex" INTEGER NOT NULL,
    "roundStations" INTEGER NOT NULL,
    "roundAmmo" TEXT NOT NULL,
    "roundClays" TEXT NOT NULL,
    "roundState" TEXT NOT NULL,
    CONSTRAINT "EventRound_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "ShootEvent" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "EventRound_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "TeamScore" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TeamScore" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "eventId" INTEGER NOT NULL,
    "teamName" TEXT NOT NULL,
    "teamShooter1" TEXT NOT NULL,
    "teamShooter2" TEXT NOT NULL,
    "teamState" TEXT NOT NULL,
    "teamTotal" INTEGER DEFAULT 0,
    "teamShotsFired" INTEGER DEFAULT 0,
    CONSTRAINT "TeamScore_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "ShootEvent" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
