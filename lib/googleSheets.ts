import { google } from "googleapis";

// Configure Google Auth
const getAuth = () => {
  const credentials = {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  };

  return new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
};

// Initialize Sheets API
export const getSheetsClient = async () => {
  const auth = getAuth();
  const authClient = await auth.getClient();
  return google.sheets({ version: "v4", auth: authClient as any });
};

/**
 * Fetches registration data from Google Sheets.
 */
export const getRegistrationData = async () => {
  if (!process.env.GOOGLE_SHEET_ID) {
    throw new Error("GOOGLE_SHEET_ID is not configured");
  }

  const sheets = await getSheetsClient();
  
  // Fetch all rows from the primary sheet (assuming the first sheet or named "Sheet1")
  // We fetch up to column S, which contains the Email Status and Sent At info.
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: "A:S", 
  });

  const rows = response.data.values || [];
  return rows;
};

/**
 * Updates the 'Email Status' and 'Confirmation Sent At' columns for a specific row.
 * @param rowNumber The 1-indexed row number to update.
 * @param status The status string, e.g., "Sent" or "Failed".
 * @param timestamp The timestamp of the update.
 */
export const updateRegistrationStatus = async (
  rowNumber: number,
  status: string,
  timestamp: string
) => {
  if (!process.env.GOOGLE_SHEET_ID) {
    throw new Error("GOOGLE_SHEET_ID is not configured");
  }

  const sheets = await getSheetsClient();

  // Assuming Column R (18th column) is Email Status, and Column S (19th column) is Confirmation Sent At
  // Note: R and S correspond to A1 notation "R[rowNumber]:S[rowNumber]"
  const range = `R${rowNumber}:S${rowNumber}`;

  await sheets.spreadsheets.values.update({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[status, timestamp]],
    },
  });
};
