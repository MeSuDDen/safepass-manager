/*
  Warnings:

  - Added the required column `isVerified` to the `PasswordReset` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PasswordReset" ADD COLUMN     "isVerified" BOOLEAN NOT NULL;
