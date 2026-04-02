-- CreateTable
CREATE TABLE "Instrument" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Instrument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserInstrument" (
    "userSub" TEXT NOT NULL,
    "instrumentId" TEXT NOT NULL,

    CONSTRAINT "UserInstrument_pkey" PRIMARY KEY ("userSub","instrumentId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Instrument_name_key" ON "Instrument"("name");

-- AddForeignKey
ALTER TABLE "UserInstrument" ADD CONSTRAINT "UserInstrument_userSub_fkey" FOREIGN KEY ("userSub") REFERENCES "User"("sub") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInstrument" ADD CONSTRAINT "UserInstrument_instrumentId_fkey" FOREIGN KEY ("instrumentId") REFERENCES "Instrument"("id") ON DELETE CASCADE ON UPDATE CASCADE;
