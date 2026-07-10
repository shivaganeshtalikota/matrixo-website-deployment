import { config } from "dotenv";
import path from "path";
import { processRegistrations } from "../lib/registrationProcessor";

// Load environment variables from .env.local
config({ path: path.resolve(__dirname, "../.env.local") });

const main = async () => {
  console.log("==========================================");
  console.log("Starting Manual Email Confirmation Script");
  console.log("==========================================");

  if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY || !process.env.GOOGLE_SHEET_ID) {
    console.error("Error: Google Sheets credentials are not fully configured in .env.local");
    process.exit(1);
  }

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error("Error: SMTP credentials are not fully configured in .env.local");
    process.exit(1);
  }

  try {
    const result = await processRegistrations();
    console.log("==========================================");
    console.log(`Script finished.`);
    console.log(`Processed rows: ${result.processed}`);
    console.log(`Emails sent: ${result.sent}`);
    console.log(`Emails failed: ${result.failed}`);
    console.log("==========================================");
    process.exit(0);
  } catch (error) {
    console.error("Script failed with error:", error);
    process.exit(1);
  }
};

main();
