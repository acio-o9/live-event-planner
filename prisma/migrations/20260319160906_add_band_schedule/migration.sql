-- CreateTable
CREATE TABLE "BandSchedule" (
    "id" TEXT NOT NULL,
    "bandId" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BandSchedule_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BandSchedule" ADD CONSTRAINT "BandSchedule_bandId_fkey" FOREIGN KEY ("bandId") REFERENCES "Band"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BandSchedule" ADD CONSTRAINT "BandSchedule_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("sub") ON DELETE RESTRICT ON UPDATE CASCADE;
