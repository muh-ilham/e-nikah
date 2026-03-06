-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MasterBerkas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nama" TEXT NOT NULL,
    "wajib" BOOLEAN NOT NULL DEFAULT true,
    "kategori" TEXT NOT NULL DEFAULT 'umum',
    "jenisPengajuan" TEXT NOT NULL DEFAULT 'NIKAH',
    "agama" TEXT,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "urut" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_MasterBerkas" ("aktif", "id", "kategori", "nama", "urut", "wajib") SELECT "aktif", "id", "kategori", "nama", "urut", "wajib" FROM "MasterBerkas";
DROP TABLE "MasterBerkas";
ALTER TABLE "new_MasterBerkas" RENAME TO "MasterBerkas";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
