import { config } from "dotenv";
import path from "path";
import nodemailer from "nodemailer";
import { sendConfirmationEmail } from "../lib/emailService";

// Load environment variables from .env.local
config({ path: path.resolve(__dirname, "../.env.local") });

const main = async () => {
  console.log("==========================================");
  console.log("Starting Test Email Script");
  console.log("==========================================");

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error("Error: SMTP credentials are not fully configured in .env.local");
    process.exit(1);
  }

  // Get recipient from command line args, fallback to SMTP_USER
  const recipient = process.argv[2] || process.env.SMTP_USER || "test@example.com";

  console.log(`Verifying SMTP Connection to ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}...`);

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "465", 10),
      secure: parseInt(process.env.SMTP_PORT || "465", 10) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.verify();
    console.log("✅ SMTP Connection Successful!");

    console.log(`\nSending test email to ${recipient}...`);
    
    await sendConfirmationEmail({
      name: "Test User",
      email: recipient,
      entryNumber: "DA-TEST-000",
    });

    console.log("✅ Test email sent successfully!");
    console.log("\nIf you don't see it, check your Spam folder.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Test failed with error:", error);
    process.exit(1);
  }
};

main();
