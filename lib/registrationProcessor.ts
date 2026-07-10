import { getRegistrationData, updateRegistrationStatus } from "./googleSheets";
import { sendConfirmationEmail } from "./emailService";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const processRegistrations = async () => {
  console.log("[Processor] Starting registration processing...");
  
  const rows = await getRegistrationData();
  
  if (rows.length === 0) {
    console.log("[Processor] No data found in the sheet.");
    return { processed: 0, sent: 0, failed: 0 };
  }

  // The first row is usually headers
  // Headers check (optional, but good for validation)
  const headers = rows[0];
  const emailIndex = 3; // Column D (0-indexed)
  const nameIndex = 2; // Column C
  const entryNumberIndex = 1; // Column B
  const emailStatusIndex = 17; // Column R
  
  let sentCount = 0;
  let failedCount = 0;

  // Process from row 2 (index 1) downwards
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const emailStatus = row[emailStatusIndex] || "";
    
    // Skip if already sent or processing
    if (emailStatus.trim() === "Sent") {
      continue;
    }

    const name = row[nameIndex];
    const email = row[emailIndex];
    const entryNumber = row[entryNumberIndex];

    if (!email || !name || !entryNumber) {
      console.log(`[Processor] Skipping Row ${i + 1} - Missing required fields.`);
      continue;
    }

    try {
      console.log(`[Processor] Sending email to ${email} (Row ${i + 1})...`);
      
      await sendConfirmationEmail({
        name: String(name),
        email: String(email),
        entryNumber: String(entryNumber),
      });

      const timestamp = new Date().toISOString();
      await updateRegistrationStatus(i + 1, "Sent", timestamp);
      
      console.log(`[Processor] Successfully sent and updated Row ${i + 1}.`);
      sentCount++;
      
      // Delay to avoid SMTP rate limits
      await delay(2000);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error(`[Processor] Failed to send to ${email} (Row ${i + 1}):`, msg);
      
      const timestamp = new Date().toISOString();
      await updateRegistrationStatus(i + 1, `Failed: ${msg}`, timestamp);
      failedCount++;
    }
  }

  console.log(`[Processor] Completed. Sent: ${sentCount}, Failed: ${failedCount}`);
  return { processed: rows.length - 1, sent: sentCount, failed: failedCount };
};
