import { sendEmail } from '../lib/mail';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const currentSettings = await prisma.systemSettings.findUnique({ where: { id: "current" } });
    console.log("Current SMTP Settings:", currentSettings);

    console.log("Attempting to send a test email...");
    const success = await sendEmail("tester@gmail.com", "Test Email dari CLI", "<p>Test</p>");
    console.log("Email send result:", success ? "SUCCESS" : "FAILED");
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
