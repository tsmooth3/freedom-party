-- CreateTable
CREATE TABLE "RoundStation" (
    "id" SERIAL NOT NULL,
    "roundId" INTEGER NOT NULL,
    "teamId" INTEGER NOT NULL,
    "eventId" INTEGER NOT NULL,
    "stationIndex" INTEGER NOT NULL,
    "presentationName" TEXT NOT NULL,
    "stationAmmo" TEXT NOT NULL,
    "stationClays" TEXT NOT NULL,
    "stationState" TEXT NOT NULL,

    CONSTRAINT "RoundStation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RoundStation" ADD CONSTRAINT "RoundStation_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "EventRound"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
