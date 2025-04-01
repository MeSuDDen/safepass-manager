/*
  Warnings:

  - You are about to drop the `_CredentialTags` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_CredentialTags" DROP CONSTRAINT "_CredentialTags_A_fkey";

-- DropForeignKey
ALTER TABLE "_CredentialTags" DROP CONSTRAINT "_CredentialTags_B_fkey";

-- DropTable
DROP TABLE "_CredentialTags";
