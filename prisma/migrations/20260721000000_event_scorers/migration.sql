-- CreateTable
CREATE TABLE "DynamicEventScorer" (
    "eventId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DynamicEventScorer_pkey" PRIMARY KEY ("eventId","userId")
);

-- CreateIndex
CREATE INDEX "DynamicEventScorer_userId_idx" ON "DynamicEventScorer"("userId");

-- AddForeignKey
ALTER TABLE "DynamicEventScorer" ADD CONSTRAINT "DynamicEventScorer_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "DynamicEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DynamicEventScorer" ADD CONSTRAINT "DynamicEventScorer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
