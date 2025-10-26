-- AlterTable
ALTER TABLE "TokenBlacklist" ADD COLUMN     "reason" TEXT DEFAULT 'MANUAL_LOGOUT';

-- CreateIndex
CREATE INDEX "TokenBlacklist_expiresAt_idx" ON "TokenBlacklist"("expiresAt");
