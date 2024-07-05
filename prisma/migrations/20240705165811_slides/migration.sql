-- CreateTable
CREATE TABLE "Slides" (
    "id" SERIAL NOT NULL,
    "timeStamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sliderName" TEXT NOT NULL,
    "sliderFPS" INTEGER NOT NULL,
    "sliderMPH" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Slides_pkey" PRIMARY KEY ("id")
);
