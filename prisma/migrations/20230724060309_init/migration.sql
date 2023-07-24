-- CreateTable
CREATE TABLE "ShootEvent" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "eventName" TEXT NOT NULL,
    "eventState" TEXT NOT NULL,

    CONSTRAINT "ShootEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventRound" (
    "id" SERIAL NOT NULL,
    "eventId" INTEGER NOT NULL,
    "teamId" INTEGER NOT NULL,
    "roundName" TEXT NOT NULL,
    "roundStations" INTEGER NOT NULL,
    "roundAmmo" TEXT NOT NULL,
    "roundClays" TEXT NOT NULL,
    "roundState" TEXT NOT NULL,

    CONSTRAINT "EventRound_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamScore" (
    "id" SERIAL NOT NULL,
    "eventId" INTEGER NOT NULL,
    "teamName" TEXT NOT NULL,
    "teamShooter1" TEXT NOT NULL,
    "teamShooter2" TEXT NOT NULL,
    "teamState" TEXT NOT NULL,
    "teamTotal" INTEGER,

    CONSTRAINT "TeamScore_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EventRound" ADD CONSTRAINT "EventRound_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "ShootEvent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventRound" ADD CONSTRAINT "EventRound_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "TeamScore"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamScore" ADD CONSTRAINT "TeamScore_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "ShootEvent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
