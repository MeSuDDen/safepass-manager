/*
  Warnings:

  - A unique constraint covering the columns `[hash]` on the table `EmailVerification` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `hash` to the `EmailVerification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EmailVerification" ADD COLUMN     "hash" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "EmailVerification_hash_key" ON "EmailVerification"("hash");
