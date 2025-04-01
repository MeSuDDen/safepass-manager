/*
  Warnings:

  - You are about to drop the column `createdAt` on the `UserCredential` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `UserCredential` table. All the data in the column will be lost.
  - You are about to drop the column `folderId` on the `UserCredential` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `UserCredential` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `UserCredential` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `UserCredential` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `UserCredential` table. All the data in the column will be lost.
  - You are about to drop the `Credential` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId]` on the table `UserCredential` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `masterPassword` to the `UserCredential` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Credential" DROP CONSTRAINT "Credential_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserCredential" DROP CONSTRAINT "UserCredential_folderId_fkey";

-- DropForeignKey
ALTER TABLE "_CredentialTags" DROP CONSTRAINT "_CredentialTags_A_fkey";

-- DropForeignKey
ALTER TABLE "_CredentialTags" DROP CONSTRAINT "_CredentialTags_B_fkey";

-- AlterTable
ALTER TABLE "UserCredential" DROP COLUMN "createdAt",
DROP COLUMN "description",
DROP COLUMN "folderId",
DROP COLUMN "title",
DROP COLUMN "updatedAt",
DROP COLUMN "url",
DROP COLUMN "username",
ADD COLUMN     "masterPassword" TEXT NOT NULL;

-- DropTable
DROP TABLE "Credential";

-- CreateTable
CREATE TABLE "Credentials" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "folderId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Credentials_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserCredential_userId_key" ON "UserCredential"("userId");

-- AddForeignKey
ALTER TABLE "Credentials" ADD CONSTRAINT "Credentials_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Credentials" ADD CONSTRAINT "Credentials_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CredentialTags" ADD CONSTRAINT "_CredentialTags_A_fkey" FOREIGN KEY ("A") REFERENCES "Credentials"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CredentialTags" ADD CONSTRAINT "_CredentialTags_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
