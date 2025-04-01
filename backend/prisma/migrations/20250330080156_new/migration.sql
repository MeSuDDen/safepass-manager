-- DropIndex
DROP INDEX "UserCredentials_userId_key";

-- AlterTable
ALTER TABLE "UserCredentials" ADD COLUMN     "folderId" TEXT,
ADD COLUMN     "tagId" TEXT;

-- CreateTable
CREATE TABLE "_CredentialTags" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CredentialTags_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_CredentialTags_B_index" ON "_CredentialTags"("B");

-- AddForeignKey
ALTER TABLE "UserCredentials" ADD CONSTRAINT "UserCredentials_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCredentials" ADD CONSTRAINT "UserCredentials_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CredentialTags" ADD CONSTRAINT "_CredentialTags_A_fkey" FOREIGN KEY ("A") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CredentialTags" ADD CONSTRAINT "_CredentialTags_B_fkey" FOREIGN KEY ("B") REFERENCES "UserCredentials"("id") ON DELETE CASCADE ON UPDATE CASCADE;
