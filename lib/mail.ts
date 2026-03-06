import nodemailer from 'nodemailer';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Fungsi untuk mengirim email notifikasi ke pengguna
 * Konfigurasi diambil secara dinamis dari database, fallback ke .env
 * @param to Alamat email tujuan
 * @param subject Subjek email
 * @param html Konten email dalam format HTML
 */
export async function sendEmail(to: string, subject: string, html: string) {
    try {
        // Ambil pengaturan dari database
        const settings = await prisma.systemSettings.findUnique({
            where: { id: "current" }
        });

        // Tentukan konfigurasi SMTP (Prioritas: Database > Environment Variables)
        // @ts-ignore - Field mungkin belum terdeteksi jika prisma generate gagal
        const host = settings?.smtpHost || process.env.SMTP_HOST;
        // @ts-ignore
        const port = settings?.smtpPort ? parseInt(settings.smtpPort.toString()) : parseInt(process.env.SMTP_PORT || '587');
        // @ts-ignore
        const user = settings?.smtpUser || process.env.SMTP_USER;
        // @ts-ignore
        const pass = settings?.smtpPass || process.env.SMTP_PASS;
        // @ts-ignore
        const secure = settings?.smtpSecure ?? (process.env.SMTP_SECURE === 'true');
        // @ts-ignore
        const fromName = settings?.smtpFromName || process.env.SMTP_FROM_NAME || 'E-NIKAH DISBINTALAD';
        // @ts-ignore
        const fromEmail = settings?.smtpFromEmail || process.env.SMTP_FROM_EMAIL || 'no-reply@e-nikah.mil.id';

        // Jika host tidak ada, jalankan simulasi
        if (!host) {
            console.warn('--- EMAIL SIMULATION (SMTP HOST NOT CONFIGURED) ---');
            console.warn(`TO: ${to}`);
            console.warn(`SUBJECT: ${subject}`);
            console.warn(`FROM: "${fromName}" <${fromEmail}>`);
            console.warn('--------------------------------------------------');
            return true;
        }

        // Buat transporter secara dinamis
        const transporter = nodemailer.createTransport({
            host,
            port,
            secure,
            auth: {
                user,
                pass,
            },
        });

        await transporter.sendMail({
            from: `"${fromName}" <${fromEmail}>`,
            to,
            subject,
            html,
        });

        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
}

/**
 * Template email untuk persetujuan akun/user
 * @param name Nama pengguna
 */
export function getAccountApprovalTemplate(name: string) {
    return `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 12px;">
            <h2 style="color: #1a365d; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">Akun Disetujui</h2>
            <p>Halo <strong>${name}</strong>,</p>
            <p>Selamat! Akun Anda telah disetujui oleh Admin. Anda sekarang dapat menggunakan seluruh fitur di sistem E-NIKAH.</p>
            <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; font-size: 14px; color: #475569;">Silakan login menggunakan email dan password yang telah Anda daftarkan.</p>
            </div>
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login" 
               style="display: inline-block; background-color: #0f172a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
               LOGIN KE SISTEM
            </a>
            <p style="margin-top: 30px; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; pt: 15px;">
                Pesan ini dikirim secara otomatis oleh sistem E-NIKAH. Mohon tidak membalas email ini.
            </p>
        </div>
    `;
}

/**
 * Template email untuk penolakan akun/user
 * @param name Nama pengguna
 */
export function getAccountRejectionTemplate(name: string) {
    return `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <h2 style="color: #dc2626; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">Status Pendaftaran Akun E-NIKAH</h2>
            <p>Halo <strong>${name}</strong>,</p>
            <p>Mohon maaf, kami informasikan bahwa permohonan pendaftaran akun E-NIKAH Anda telah <strong>DITOLAK</strong> oleh Administrator.</p>
            
            <div style="background-color: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0 0 5px 0; font-size: 14px; color: #b91c1c; font-weight: bold;">Catatan dari Sistem:</p>
                <p style="margin: 0; font-size: 14px; color: #991b1b;">Data pendaftaran Anda mungkin tidak sesuai dengan data di sistem SISFOPERS. Silakan hubungi bagian Bintal atau atasan Anda untuk informasi lebih lanjut.</p>
            </div>

            <p style="margin-top: 30px; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 15px;">
                Pesan ini dikirim secara otomatis oleh sistem E-NIKAH. Mohon tidak membalas email ini.
            </p>
        </div>
    `;
}

/**
 * Template email untuk persetujuan pengajuan nikah
 * @param name Nama pendaftar
 * @param noRegistrasi Nomor registrasi pengajuan
 * @param jadwalKedatangan Jadwal kedatangan yang ditentukan (opsional)
 */
/**
 * Template email untuk persetujuan pengajuan nikah
 */
export function getOrderApprovalTemplate(
    name: string,
    noRegistrasi: string,
    profilDetail: { pangkat?: string, satuan?: string, nrp?: string },
    jadwalKedatangan?: string,
    catatanAdmin?: string
) {
    return `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <h2 style="color: #1a365d; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">Pengajuan Nikah Disetujui</h2>
            <p>Halo <strong>${profilDetail.pangkat || ''} ${name}</strong> ${profilDetail.nrp ? `(NRP: ${profilDetail.nrp})` : ''},</p>
            <p>Kami informasikan bahwa pengajuan nikah Anda dengan nomor registrasi <strong>${noRegistrasi}</strong> telah <strong>DISETUJUI</strong> oleh Admin.</p>
            
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0 0 5px 0; font-size: 14px; font-weight: bold;">Detail Pemohon:</p>
                <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #334155;">
                    <li><strong>Nama:</strong> ${name}</li>
                    <li><strong>NRP:</strong> ${profilDetail.nrp || '-'}</li>
                    <li><strong>Pangkat/Korps:</strong> ${profilDetail.pangkat || '-'}</li>
                    <li><strong>Kesatuan:</strong> ${profilDetail.satuan || '-'}</li>
                </ul>
            </div>

            ${jadwalKedatangan ? `
            <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0 0 5px 0; font-size: 12px; color: #166534; font-weight: bold; text-transform: uppercase;">Jadwal Kedatangan / Sidang:</p>
                <p style="margin: 0; font-size: 18px; color: #14532d; font-weight: 800;">${jadwalKedatangan}</p>
            </div>
            ` : ''}

            ${catatanAdmin ? `
            <div style="background-color: #fffbeb; border: 1px solid #fde68a; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0 0 5px 0; font-size: 12px; color: #b45309; font-weight: bold; text-transform: uppercase;">Catatan Verifikator / Admin:</p>
                <p style="margin: 0; font-size: 14px; color: #78350f;"><em>"${catatanAdmin}"</em></p>
            </div>
            ` : ''}

            <p>Silakan login ke dashboard untuk melihat detail atau mencetak berkas langkah selanjutnya.</p>
            
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" 
               style="display: inline-block; background-color: #0f172a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 10px;">
               CEK STATUS DI DASHBOARD
            </a>
            
            <p style="margin-top: 30px; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 15px;">
                Pesan ini dikirim secara otomatis oleh sistem E-NIKAH. Mohon tidak membalas email ini.
            </p>
        </div>
    `;
}

/**
 * Template email untuk pengajuan nikah yang direvisi
 */
export function getOrderRevisionTemplate(name: string, noRegistrasi: string, catatanAdmin: string) {
    return `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <h2 style="color: #b45309; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">Pengajuan Nikah Perlu Direvisi</h2>
            <p>Halo <strong>${name}</strong>,</p>
            <p>Kami informasikan bahwa pengajuan nikah Anda dengan nomor registrasi <strong>${noRegistrasi}</strong> memerlukan <strong>REVISI</strong> atau perbaikan data berkas.</p>
            
            <div style="background-color: #fffbeb; border: 1px solid #fde68a; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0 0 5px 0; font-size: 12px; color: #b45309; font-weight: bold; text-transform: uppercase;">Catatan Revisi dari Admin:</p>
                <p style="margin: 0; font-size: 16px; color: #92400e; font-weight: 600;">"${catatanAdmin}"</p>
            </div>

            <p>Mohon segera login ke dashboard dan memperbaiki berkas/dokumen sesuai dengan catatan dari admin agar pengajuan Anda dapat diproses ke tahap selanjutnya.</p>
            
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" 
               style="display: inline-block; background-color: #b45309; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 10px;">
               PERBAIKI BERKAS SEKARANG
            </a>
            
            <p style="margin-top: 30px; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 15px;">
                Pesan ini dikirim secara otomatis oleh sistem E-NIKAH. Mohon tidak membalas email ini.
            </p>
        </div>
    `;
}

/**
 * Template email untuk pengajuan nikah yang ditolak
 */
export function getOrderRejectionTemplate(name: string, noRegistrasi: string, catatanAdmin: string) {
    return `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <h2 style="color: #dc2626; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">Status Pengajuan Nikah: DITOLAK</h2>
            <p>Halo <strong>${name}</strong>,</p>
            <p>Mohon maaf, kami informasikan bahwa pengajuan nikah Anda dengan nomor registrasi <strong>${noRegistrasi}</strong> telah <strong>DITOLAK</strong> oleh Admin/Verifikator.</p>
            
            <div style="background-color: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0 0 5px 0; font-size: 12px; color: #b91c1c; font-weight: bold; text-transform: uppercase;">Alasan Penolakan:</p>
                <p style="margin: 0; font-size: 16px; color: #991b1b; font-weight: 600;">"${catatanAdmin || 'Tidak ada alasan spesifik yang diberikan.'}"</p>
            </div>

            <p>Jika Anda memiliki pertanyaan lebih lanjut mengenai penolakan ini, silakan hubungi bagian Bintal atau atasan Anda.</p>
            
            <p style="margin-top: 30px; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 15px;">
                Pesan ini dikirim secara otomatis oleh sistem E-NIKAH. Mohon tidak membalas email ini.
            </p>
        </div>
    `;
}
