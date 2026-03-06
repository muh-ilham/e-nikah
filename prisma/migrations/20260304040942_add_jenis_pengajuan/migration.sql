-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nrp" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'prajurit',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "agamaId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ProfilPrajurit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "fotoUrl" TEXT,
    "tempatLahir" TEXT,
    "tglLahir" DATETIME,
    "suku" TEXT,
    "agama" TEXT,
    "hp" TEXT,
    "pangkatId" TEXT,
    "jabatanId" TEXT,
    "satuanId" TEXT,
    "alamat" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProfilPrajurit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ProfilPrajurit_pangkatId_fkey" FOREIGN KEY ("pangkatId") REFERENCES "MasterPangkat" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ProfilPrajurit_jabatanId_fkey" FOREIGN KEY ("jabatanId") REFERENCES "MasterJabatan" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ProfilPrajurit_satuanId_fkey" FOREIGN KEY ("satuanId") REFERENCES "MasterSatuan" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MasterPangkat" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nama" TEXT NOT NULL,
    "korps" TEXT,
    "aktif" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "MasterJabatan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nama" TEXT NOT NULL,
    "aktif" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "MasterSatuan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nama" TEXT NOT NULL,
    "aktif" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "MasterBerkas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nama" TEXT NOT NULL,
    "wajib" BOOLEAN NOT NULL DEFAULT true,
    "kategori" TEXT NOT NULL DEFAULT 'umum',
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "urut" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "PengajuanNikah" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "noRegistrasi" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Menunggu',
    "jenisPengajuan" TEXT NOT NULL DEFAULT 'NIKAH',
    "agama" TEXT NOT NULL,
    "tglPengajuan" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "namaCalon" TEXT NOT NULL,
    "tempatLahirCalon" TEXT NOT NULL,
    "tglLahirCalon" DATETIME NOT NULL,
    "agamaCalon" TEXT NOT NULL,
    "pekerjaanCalon" TEXT NOT NULL,
    "sukuCalon" TEXT NOT NULL,
    "alamatCalon" TEXT NOT NULL,
    "jadwalKedatangan" DATETIME,
    "catatanAdmin" TEXT,
    "adminVerifikatorId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PengajuanNikah_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BerkasPengajuan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pengajuanId" TEXT NOT NULL,
    "masterBerkasId" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "catatan" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BerkasPengajuan_pengajuanId_fkey" FOREIGN KEY ("pengajuanId") REFERENCES "PengajuanNikah" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BerkasPengajuan_masterBerkasId_fkey" FOREIGN KEY ("masterBerkasId") REFERENCES "MasterBerkas" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SystemSettings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'current',
    "appName" TEXT NOT NULL DEFAULT 'E-NIKAH',
    "instansiName" TEXT NOT NULL DEFAULT 'DISBINTALAD',
    "satuanInduk" TEXT NOT NULL DEFAULT 'Mabes TNI AD',
    "alamatKantor" TEXT NOT NULL DEFAULT 'Jl. Veteran No. 5, Jakarta Pusat',
    "logoUrl" TEXT,
    "emailNotif" BOOLEAN NOT NULL DEFAULT true,
    "browserNotif" BOOLEAN NOT NULL DEFAULT true,
    "waNotif" BOOLEAN NOT NULL DEFAULT false,
    "smtpHost" TEXT,
    "smtpPort" INTEGER DEFAULT 587,
    "smtpUser" TEXT,
    "smtpPass" TEXT,
    "smtpSecure" BOOLEAN DEFAULT false,
    "smtpFromName" TEXT DEFAULT 'E-NIKAH DISBINTALAD',
    "smtpFromEmail" TEXT DEFAULT 'no-reply@e-nikah.mil.id',
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_nrp_key" ON "User"("nrp");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ProfilPrajurit_userId_key" ON "ProfilPrajurit"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "MasterPangkat_nama_key" ON "MasterPangkat"("nama");

-- CreateIndex
CREATE UNIQUE INDEX "MasterJabatan_nama_key" ON "MasterJabatan"("nama");

-- CreateIndex
CREATE UNIQUE INDEX "MasterSatuan_nama_key" ON "MasterSatuan"("nama");

-- CreateIndex
CREATE UNIQUE INDEX "PengajuanNikah_noRegistrasi_key" ON "PengajuanNikah"("noRegistrasi");
