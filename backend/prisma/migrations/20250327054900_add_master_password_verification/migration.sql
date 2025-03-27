-- AlterTable
ALTER TABLE "UserTokens" ADD COLUMN     "failedMasterPasswordAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isMasterPasswordVerified" BOOLEAN NOT NULL DEFAULT false;
