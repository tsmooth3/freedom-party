-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'SPECTATOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DynamicEvent" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "eventName" TEXT NOT NULL,
    "eventState" TEXT NOT NULL,
    "currentTeamIndex" INTEGER NOT NULL DEFAULT 0,
    "currentStationIndex" INTEGER NOT NULL DEFAULT 0,
    "currentPresentationIndex" INTEGER NOT NULL DEFAULT 0,
    "creatorId" INTEGER,

    CONSTRAINT "DynamicEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DynamicTeam" (
    "id" SERIAL NOT NULL,
    "eventId" INTEGER NOT NULL,
    "teamName" TEXT NOT NULL,
    "shooter1" TEXT NOT NULL,
    "shooter2" TEXT NOT NULL,

    CONSTRAINT "DynamicTeam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DynamicRound" (
    "id" SERIAL NOT NULL,
    "eventId" INTEGER NOT NULL,
    "roundName" TEXT NOT NULL,
    "roundIndex" INTEGER NOT NULL,
    "roundState" TEXT NOT NULL,

    CONSTRAINT "DynamicRound_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StationLayout" (
    "id" SERIAL NOT NULL,
    "roundId" INTEGER NOT NULL,
    "stationIndex" INTEGER NOT NULL,
    "launchType" TEXT NOT NULL,
    "sequence" TEXT NOT NULL,
    "totalClays" INTEGER NOT NULL,
    "trapSequence" TEXT NOT NULL,

    CONSTRAINT "StationLayout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamStationScore" (
    "id" SERIAL NOT NULL,
    "teamId" INTEGER NOT NULL,
    "stationLayoutId" INTEGER NOT NULL,
    "presentationIndex" INTEGER NOT NULL DEFAULT 1,
    "claysHit" INTEGER NOT NULL DEFAULT 0,
    "shotsFired" INTEGER NOT NULL DEFAULT 4,
    "isComplete" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "TeamStationScore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "TeamStationScore_teamId_stationLayoutId_presentationIndex_key" ON "TeamStationScore"("teamId", "stationLayoutId", "presentationIndex");

-- AddForeignKey
ALTER TABLE "DynamicEvent" ADD CONSTRAINT "DynamicEvent_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DynamicTeam" ADD CONSTRAINT "DynamicTeam_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "DynamicEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DynamicRound" ADD CONSTRAINT "DynamicRound_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "DynamicEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StationLayout" ADD CONSTRAINT "StationLayout_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "DynamicRound"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamStationScore" ADD CONSTRAINT "TeamStationScore_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "DynamicTeam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamStationScore" ADD CONSTRAINT "TeamStationScore_stationLayoutId_fkey" FOREIGN KEY ("stationLayoutId") REFERENCES "StationLayout"("id") ON DELETE CASCADE ON UPDATE CASCADE;
