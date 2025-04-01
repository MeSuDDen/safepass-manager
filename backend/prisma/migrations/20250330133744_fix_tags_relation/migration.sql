-- AlterTable
ALTER TABLE "Tag" ADD COLUMN     "userCredentialsId" TEXT;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_userCredentialsId_fkey" FOREIGN KEY ("userCredentialsId") REFERENCES "UserCredentials"("id") ON DELETE SET NULL ON UPDATE CASCADE;
