// DevAgents 1.0 Registration System - Google Apps Script
// Deploy this script as a web app with "Execute as: Me" and "Who has access: Anyone"

// Handle GET requests (for verification or lookup if needed)
function doGet(e) {
  try {
    const action = e.parameter.action;
    const entryNumber = e.parameter.entryNumber;
    const email = e.parameter.email;
    
    Logger.log('doGet called. Action: ' + action + ', EntryNumber: ' + entryNumber + ', Email: ' + email);
    
    // Validate Script Properties on load
    validateProperties();
    
    const properties = PropertiesService.getScriptProperties();
    const sheetId = properties.getProperty('DEVAGENTS_SHEET_ID');
    const sheet = SpreadsheetApp.openById(sheetId).getActiveSheet();
    
    if (action === 'lookup') {
      const result = lookupRegistration(sheet, entryNumber, email);
      return ContentService.createTextOutput(JSON.stringify(result))
                           .setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ 
      success: false, 
      error: 'Invalid action or missing parameters' 
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log('doGet Error: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({ 
      success: false, 
      error: error.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Handle POST requests
function doPost(e) {
  try {
    Logger.log('doPost initiated');
    
    // Validate request data
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error('No data received in request');
    }
    
    // Validate all required script properties
    validateProperties();
    
    const data = JSON.parse(e.postData.contents);
    Logger.log('Received payload action: ' + (data.action || 'register'));
    
    const properties = PropertiesService.getScriptProperties();
    const sheetId = properties.getProperty('DEVAGENTS_SHEET_ID');
    const folderId = properties.getProperty('DEVAGENTS_DRIVE_FOLDER_ID');
    const prefix = properties.getProperty('DEVAGENTS_ENTRY_PREFIX') || 'DA';
    
    const sheet = SpreadsheetApp.openById(sheetId).getActiveSheet();
    
    // Route action
    if (data.action === 'approve') {
      return approveRegistration(sheet, data.email || data.entryNumber);
    } else if (data.action === 'reject') {
      return rejectRegistration(sheet, data.email || data.entryNumber);
    } else if (data.action === 'processApprovals') {
      return processSheetApprovals(sheet);
    }
    
    // Default action: Registration
    // Duplicate check by email (Column D, 1-indexed = 4)
    const emailColumn = 4;
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      const emailValues = sheet.getRange(2, emailColumn, lastRow - 1, 1).getValues();
      for (let i = 0; i < emailValues.length; i++) {
        if (emailValues[i][0].toString().trim().toLowerCase() === data.email.toString().trim().toLowerCase()) {
          Logger.log('Duplicate registration detected for email: ' + data.email);
          return ContentService.createTextOutput(JSON.stringify({
            success: false,
            error: 'You have already registered for DevAgents 1.0. Check your email for details.'
          })).setMimeType(ContentService.MimeType.JSON);
        }
      }
    }
    
    // Upload Screenshot to Drive
    let driveFileUrl = '';
    let sheetScreenshotFormula = '';
    
    if (data.paymentScreenshot && data.paymentScreenshot.startsWith('data:image')) {
      Logger.log('Processing payment screenshot upload to Drive');
      driveFileUrl = uploadScreenshotToDrive(folderId, data.paymentScreenshot, data.email);
      // Optional: Set Formula to display inside cell using =IMAGE()
      sheetScreenshotFormula = `=IMAGE("${driveFileUrl}")`;
      Logger.log('Screenshot successfully uploaded. URL: ' + driveFileUrl);
    } else {
      Logger.log('Warning: Payment screenshot is empty or not in correct Base64 format');
    }
    
    // Generate Safe & Unique Entry Number
    const entryNumber = generateEntryNumber(sheet, prefix);
    Logger.log('Generated Entry Number: ' + entryNumber);
    
    // Map values exactly to headers:
    // 1. Timestamp | 2. Entry Number | 3. Full Name | 4. Email | 5. Phone | 6. College | 7. Year | 8. Branch | 9. City | 10. GitHub | 11. LinkedIn | 12. Experience Level | 13. Why do you want to attend? | 14. Payment Screenshot | 15. Payment Status | 16. Approval Status | 17. Drive File URL | 18. Registration Status
    const appendValues = [
      new Date(),                         // 1. Timestamp
      entryNumber,                        // 2. Entry Number
      data.fullName || '',                // 3. Full Name
      data.email || '',                   // 4. Email
      data.phone || '',                   // 5. Phone
      data.college || '',                 // 6. College
      data.year || '',                    // 7. Year
      data.branch || '',                  // 8. Branch
      data.city || '',                    // 9. City
      data.github || '',                  // 10. GitHub
      data.linkedIn || '',                // 11. LinkedIn
      data.experienceLevel || '',          // 12. Experience Level
      data.whyAttend || '',               // 13. Why do you want to attend?
      sheetScreenshotFormula,             // 14. Payment Screenshot (=IMAGE formula)
      'Pending',                          // 15. Payment Status
      'Pending',                          // 16. Approval Status
      driveFileUrl,                       // 17. Drive File URL (Raw link)
      'Registered'                        // 18. Registration Status
    ];
    
    sheet.appendRow(appendValues);
    Logger.log('Successfully appended row to Sheet for: ' + data.email);
    
    // Send "Registration Successful" (Pending verification) email
    sendRegistrationReceivedEmail(data, entryNumber);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      entryNumber: entryNumber,
      message: 'Registration successfully received!'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log('doPost Error: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Validate script properties
function validateProperties() {
  const properties = PropertiesService.getScriptProperties();
  const required = ['DEVAGENTS_SHEET_ID', 'DEVAGENTS_DRIVE_FOLDER_ID', 'DEVAGENTS_ADMIN_EMAIL'];
  
  required.forEach(function(prop) {
    const val = properties.getProperty(prop);
    if (!val || val.trim() === '') {
      throw new Error('Missing required Script Property: ' + prop + '. Please configure it in Project Settings.');
    }
  });
}

// Generate sequential safe entry number
function generateEntryNumber(sheet, prefix) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return prefix + '0001';
  }
  
  // Read entry numbers in column B (column 2)
  const values = sheet.getRange(2, 2, lastRow - 1, 1).getValues();
  let maxNum = 0;
  
  for (let i = 0; i < values.length; i++) {
    const val = values[i][0].toString().trim();
    if (val && val.startsWith(prefix)) {
      const numPart = val.substring(prefix.length);
      const parsed = parseInt(numPart, 10);
      if (!isNaN(parsed) && parsed > maxNum) {
        maxNum = parsed;
      }
    }
  }
  
  const nextNum = maxNum + 1;
  const padded = ('0000' + nextNum).slice(-4);
  return prefix + padded;
}

// Decode Base64 and write image file to Drive folder
function uploadScreenshotToDrive(folderId, base64Image, email) {
  const folder = DriveApp.getFolderById(folderId);
  
  // Parse MIME type and extract pure base64 code
  const parts = base64Image.split(',');
  const mimeHeader = parts[0];
  const base64Data = parts[1];
  
  let mimeType = 'image/jpeg';
  let ext = 'jpg';
  
  if (mimeHeader.includes(':') && mimeHeader.includes(';')) {
    mimeType = mimeHeader.split(':')[1].split(';')[0];
    ext = mimeType.split('/')[1] || 'jpg';
  }
  
  const decoded = Utilities.base64Decode(base64Data);
  const fileName = 'devagents_' + email.replace(/[@.]/g, '_') + '_' + Date.now() + '.' + ext;
  const blob = Utilities.newBlob(decoded, mimeType, fileName);
  
  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  
  return file.getUrl();
}

// Send Registration Received email
function sendRegistrationReceivedEmail(data, entryNumber) {
  const adminEmail = PropertiesService.getScriptProperties().getProperty('DEVAGENTS_ADMIN_EMAIL');
  
  const subject = 'Registration Received: DevAgents 1.0 (Entry ' + entryNumber + ')';
  
  const htmlBody = `
  <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0b0f19; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; color: #f3f4f6;">
    <div style="background: linear-gradient(135deg, #0e7490 0%, #6d28d9 100%); padding: 32px 24px; text-align: center;">
      <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 800; letter-spacing: 0.5px;">matriXO Events</h1>
      <p style="margin: 8px 0 0 0; color: #a5f3fc; font-size: 14px; text-transform: uppercase; font-weight: 600; letter-spacing: 1px;">Application Received</p>
    </div>
    
    <div style="padding: 32px 24px;">
      <p style="font-size: 16px; line-height: 1.6; color: #d1d5db; margin-top: 0;">Hi ${data.fullName},</p>
      <p style="font-size: 15px; line-height: 1.6; color: #9ca3af;">
        Thank you for submitting your application to register for <strong>DevAgents 1.0</strong>! We have successfully recorded your details and payment receipt.
      </p>
      
      <div style="background-color: #111827; border: 1px solid #1f2937; border-radius: 12px; padding: 20px; margin: 24px 0;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 8px 0; color: #9ca3af; font-weight: 500;">Entry Number:</td>
            <td style="padding: 8px 0; color: #38bdf8; font-weight: 700; font-family: monospace;">${entryNumber}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #9ca3af; font-weight: 500;">Payment Status:</td>
            <td style="padding: 8px 0; color: #fbbf24; font-weight: 700;">PAYMENT PENDING</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #9ca3af; font-weight: 500;">Full Name:</td>
            <td style="padding: 8px 0; color: #e5e7eb;">${data.fullName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #9ca3af; font-weight: 500;">College:</td>
            <td style="padding: 8px 0; color: #e5e7eb;">${data.college}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #9ca3af; font-weight: 500;">Branch & Year:</td>
            <td style="padding: 8px 0; color: #e5e7eb;">${data.branch} (${data.year})</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #9ca3af; font-weight: 500;">Experience Level:</td>
            <td style="padding: 8px 0; color: #e5e7eb;">${data.experienceLevel}</td>
          </tr>
        </table>
      </div>
      
      <div style="background-color: rgba(251, 191, 36, 0.05); border-left: 4px solid #fbbf24; border-radius: 0 8px 8px 0; padding: 16px; margin: 24px 0;">
        <p style="margin: 0; font-size: 13.5px; line-height: 1.5; color: #f59e0b;">
          <strong>📌 Verification in Progress:</strong> Our admin team is verifying your payment screenshot. You will receive your final confirmation email along with your entry QR Code within 24 hours.
        </p>
      </div>
      
      <div style="background-color: #1e293b; border-radius: 12px; padding: 20px; margin: 24px 0;">
        <h3 style="margin-top: 0; color: #ffffff; font-size: 15px; font-weight: 600;">Event Quick Guide:</h3>
        <ul style="margin: 0; padding-left: 20px; font-size: 13.5px; line-height: 1.6; color: #9ca3af;">
          <li><strong>Event Date:</strong> Sunday, March 15, 2026</li>
          <li><strong>Reporting Time:</strong> 09:30 AM</li>
          <li><strong>Venue:</strong> Seminar Hall, A-Block, KPRIT, Hyderabad</li>
          <li><strong>Necessity:</strong> Bring a fully charged laptop & College ID Card</li>
        </ul>
      </div>

      <p style="font-size: 14px; line-height: 1.6; color: #9ca3af; margin-bottom: 0;">
        For support or queries, reach us at <a href="mailto:${adminEmail}" style="color: #38bdf8; text-decoration: none;">${adminEmail}</a>.
      </p>
    </div>
    
    <div style="background-color: #111827; padding: 20px; text-align: center; border-t: 1px solid #1e293b; font-size: 12px; color: #6b7280;">
      <p style="margin: 0 0 4px 0;">Organized by Smartzy Education & matriXO</p>
      <p style="margin: 0;">This is an automated notification. Please do not reply directly to this email.</p>
    </div>
  </div>
  `;
  
  const textBody = `Hi ${data.fullName},\n\n` +
                   `We have received your application for DevAgents 1.0 (Entry Number: ${entryNumber}).\n\n` +
                   `Status: PAYMENT PENDING\n` +
                   `Event: DevAgents 1.0\n` +
                   `Date: March 15, 2026\n` +
                   `Venue: Seminar Hall, A-Block, KPRIT, Hyderabad\n\n` +
                   `Our admin team is verifying your payment. Once approved, you will receive a second email with your QR Code for check-in.\n\n` +
                   `Best regards,\nTeam matriXO`;

  GmailApp.sendEmail(data.email, subject, textBody, {
    name: 'matriXO Events',
    replyTo: adminEmail,
    htmlBody: htmlBody
  });
  
  Logger.log('Registration received email sent to: ' + data.email);
}

// Approve Registration
function approveRegistration(sheet, identifier) {
  Logger.log('Running approval for identifier: ' + identifier);
  const row = findRowByIdentifier(sheet, identifier);
  if (row === -1) {
    throw new Error('Registration record not found for: ' + identifier);
  }
  
  // Headers: 15. Payment Status, 16. Approval Status, 18. Registration Status
  sheet.getRange(row, 15).setValue('Verified');
  sheet.getRange(row, 16).setValue('Approved');
  
  const rowData = getRowData(sheet, row);
  sendRegistrationConfirmedEmail(rowData);
  
  sheet.getRange(row, 18).setValue('Confirmed');
  Logger.log('Successfully approved registration on row: ' + row);
  
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    message: 'Registration for ' + rowData.fullName + ' successfully approved and email sent.'
  })).setMimeType(ContentService.MimeType.JSON);
}

// Reject Registration
function rejectRegistration(sheet, identifier) {
  Logger.log('Running rejection for identifier: ' + identifier);
  const row = findRowByIdentifier(sheet, identifier);
  if (row === -1) {
    throw new Error('Registration record not found for: ' + identifier);
  }
  
  // Update Approval Status to Rejected
  sheet.getRange(row, 16).setValue('Rejected');
  
  const rowData = getRowData(sheet, row);
  sendRegistrationRejectedEmail(rowData);
  
  sheet.getRange(row, 18).setValue('Rejected');
  Logger.log('Successfully rejected registration on row: ' + row);
  
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    message: 'Registration for ' + rowData.fullName + ' rejected and notification sent.'
  })).setMimeType(ContentService.MimeType.JSON);
}

// Batch function to process manual sheet updates (Triggered via UI/Cron)
function processSheetApprovals(sheet) {
  if (!sheet) {
    sheet = SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('DEVAGENTS_SHEET_ID')).getActiveSheet();
  }
  
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return ContentService.createTextOutput(JSON.stringify({ success: true, processed: 0 })).setMimeType(ContentService.MimeType.JSON);
  }
  
  // Read columns A to R (18 columns)
  const range = sheet.getRange(2, 1, lastRow - 1, 18);
  const values = range.getValues();
  let approvedCount = 0;
  let rejectedCount = 0;
  
  for (let i = 0; i < values.length; i++) {
    const rowNum = i + 2;
    const approvalStatus = values[i][15]; // Column 16
    const regStatus = values[i][17];       // Column 18
    const email = values[i][3];            // Column 4
    
    // Process only if status is "Registered" (meaning email hasn't been sent for confirmation/rejection yet)
    if (regStatus === 'Registered') {
      const rowData = getRowData(sheet, rowNum);
      
      if (approvalStatus === 'Approved') {
        Logger.log('Batch processing: Approving row ' + rowNum);
        sheet.getRange(rowNum, 15).setValue('Verified'); // Set Payment Status = Verified
        sendRegistrationConfirmedEmail(rowData);
        sheet.getRange(rowNum, 18).setValue('Confirmed');
        approvedCount++;
        Utilities.sleep(500); // Throttling
      } else if (approvalStatus === 'Rejected') {
        Logger.log('Batch processing: Rejecting row ' + rowNum);
        sendRegistrationRejectedEmail(rowData);
        sheet.getRange(rowNum, 18).setValue('Rejected');
        rejectedCount++;
        Utilities.sleep(500); // Throttling
      }
    }
  }
  
  Logger.log(`Batch execution complete. Approved: ${approvedCount}, Rejected: ${rejectedCount}`);
  
  try {
    SpreadsheetApp.getUi().alert(`Batch processing done! Sent ${approvedCount} confirmation(s) and ${rejectedCount} rejection(s).`);
  } catch (e) {
    Logger.log('Spreadsheet alert ignored (called outside sheet context)');
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    approved: approvedCount,
    rejected: rejectedCount
  })).setMimeType(ContentService.MimeType.JSON);
}

// Find row index by Entry Number or Email
function findRowByIdentifier(sheet, identifier) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return -1;
  
  const values = sheet.getRange(2, 1, lastRow - 1, 4).getValues(); // Columns A-D (Timestamp, EntryNumber, Name, Email)
  
  for (let i = 0; i < values.length; i++) {
    const entryNumber = values[i][1].toString().trim();
    const email = values[i][3].toString().trim();
    
    if (entryNumber.toLowerCase() === identifier.toString().trim().toLowerCase() || 
        email.toLowerCase() === identifier.toString().trim().toLowerCase()) {
      return i + 2;
    }
  }
  return -1;
}

// Read registration row values into organized object
function getRowData(sheet, row) {
  const vals = sheet.getRange(row, 1, 1, 18).getValues()[0];
  return {
    rowNumber: row,
    timestamp: vals[0],
    entryNumber: vals[1],
    fullName: vals[2],
    email: vals[3],
    phone: vals[4],
    college: vals[5],
    year: vals[6],
    branch: vals[7],
    city: vals[8],
    github: vals[9],
    linkedIn: vals[10],
    experienceLevel: vals[11],
    whyAttend: vals[12],
    paymentScreenshot: vals[13],
    paymentStatus: vals[14],
    approvalStatus: vals[15],
    driveFileUrl: vals[16],
    registrationStatus: vals[17]
  };
}

// Send Confirmed HTML email with QR code
function sendRegistrationConfirmedEmail(data) {
  const adminEmail = PropertiesService.getScriptProperties().getProperty('DEVAGENTS_ADMIN_EMAIL');
  
  // QR Server generation URL
  const qrCodeUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' + encodeURIComponent(data.entryNumber);
  
  const subject = 'Registration CONFIRMED: DevAgents 1.0 (Entry ' + data.entryNumber + ')';
  
  const htmlBody = `
  <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0b0f19; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; color: #f3f4f6;">
    <div style="background: linear-gradient(135deg, #06b6d4 0%, #7c3aed 100%); padding: 36px 24px; text-align: center;">
      <div style="font-size: 40px; margin-bottom: 12px;">✅</div>
      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 800; letter-spacing: 0.5px;">Registration Confirmed!</h1>
      <p style="margin: 8px 0 0 0; color: #e2e8f0; font-size: 15px;">Your spot is secured for DevAgents 1.0</p>
    </div>
    
    <div style="padding: 32px 24px;">
      <p style="font-size: 16px; line-height: 1.6; color: #d1d5db; margin-top: 0;">Hi ${data.fullName},</p>
      <p style="font-size: 15px; line-height: 1.6; color: #9ca3af;">
        CONGRATULATIONS! Your payment verification is complete and your application has been officially approved. Get ready for an intensive journey into autonomous AI agent building.
      </p>
      
      <div style="background-color: #111827; border: 1px solid #1f2937; border-radius: 12px; padding: 20px; margin: 24px 0;">
        <h3 style="margin-top: 0; color: #ffffff; font-size: 15px; font-weight: 600; border-bottom: 1px solid #1f2937; padding-bottom: 10px; margin-bottom: 14px;">Attendee Record</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 6px 0; color: #9ca3af;">Entry Number:</td>
            <td style="padding: 6px 0; color: #06b6d4; font-weight: 700; font-family: monospace;">${data.entryNumber}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #9ca3af;">Status:</td>
            <td style="padding: 6px 0; color: #10b981; font-weight: 700; text-transform: uppercase;">Verified & Confirmed</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #9ca3af;">Full Name:</td>
            <td style="padding: 6px 0; color: #e5e7eb;">${data.fullName}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #9ca3af;">College & Branch:</td>
            <td style="padding: 6px 0; color: #e5e7eb;">${data.college} (${data.branch})</td>
          </tr>
        </table>
      </div>
      
      <h3 style="color: #ffffff; font-size: 16px; font-weight: 700; margin-top: 32px; margin-bottom: 12px;">Your Check-In QR Code</h3>
      <div style="background-color: #111827; border: 1px solid #1f2937; border-radius: 12px; padding: 24px; text-align: center; margin: 16px 0;">
        <img src="${qrCodeUrl}" alt="Check-in QR Code" style="max-width: 200px; width: 100%; height: auto; border: 4px solid #7c3aed; border-radius: 12px; display: inline-block;" />
        <p style="margin: 12px 0 0 0; color: #6b7280; font-size: 12px;">Present this QR code on your mobile device at the check-in desk for entry.</p>
        <p style="margin: 8px 0 0 0;"><a href="${qrCodeUrl}" target="_blank" style="color: #06b6d4; text-decoration: underline; font-size: 13px;">View QR Code in browser</a></p>
      </div>

      <div style="background-color: #1e293b; border-radius: 12px; padding: 20px; margin: 28px 0;">
        <h3 style="margin-top: 0; color: #ffffff; font-size: 15px; font-weight: 600;">Reporting Instructions</h3>
        <ul style="margin: 0; padding-left: 20px; font-size: 13.5px; line-height: 1.6; color: #9ca3af;">
          <li><strong>Venue:</strong> Seminar Hall, A-Block, KPRIT, Hyderabad</li>
          <li><strong>Reporting Time:</strong> 09:30 AM</li>
          <li><strong>Bring:</strong> Fully charged laptop (compulsory) and College ID Card</li>
          <li><strong>WhatsApp group:</strong> The link to join the participant group will be shared with you shortly via SMS/WhatsApp.</li>
        </ul>
      </div>

      <h3 style="color: #ffffff; font-size: 16px; font-weight: 700; margin-top: 32px; margin-bottom: 12px;">Event Schedule</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 13.5px; color: #d1d5db; line-height: 1.6;">
        <tr style="border-bottom: 1px solid #1f2937;"><td style="padding: 8px 0; color: #06b6d4; font-family: monospace; font-weight: bold; width: 140px;">09:30 AM</td><td style="padding: 8px 0;">Check-in & Registration</td></tr>
        <tr style="border-bottom: 1px solid #1f2937;"><td style="padding: 8px 0; color: #06b6d4; font-family: monospace; font-weight: bold;">10:00 AM</td><td style="padding: 8px 0;">Keynote: The Rise of Agentic AI</td></tr>
        <tr style="border-bottom: 1px solid #1f2937;"><td style="padding: 8px 0; color: #06b6d4; font-family: monospace; font-weight: bold;">10:30 AM</td><td style="padding: 8px 0;">Session 1: Building your first autonomous agent</td></tr>
        <tr style="border-bottom: 1px solid #1f2937;"><td style="padding: 8px 0; color: #06b6d4; font-family: monospace; font-weight: bold;">12:30 PM</td><td style="padding: 8px 0;">Lunch Break (Provided at Venue)</td></tr>
        <tr style="border-bottom: 1px solid #1f2937;"><td style="padding: 8px 0; color: #06b6d4; font-family: monospace; font-weight: bold;">01:30 PM</td><td style="padding: 8px 0;">Session 2: Multi-agent orchestration & systems</td></tr>
        <tr style="border-bottom: 1px solid #1f2937;"><td style="padding: 8px 0; color: #06b6d4; font-family: monospace; font-weight: bold;">03:30 PM</td><td style="padding: 8px 0;">Agent Hackathon & Coding Challenge</td></tr>
        <tr><td style="padding: 8px 0; color: #06b6d4; font-family: monospace; font-weight: bold;">05:30 PM</td><td style="padding: 8px 0;">Closing & Merit Award Distribution</td></tr>
      </table>

      <p style="font-size: 14px; line-height: 1.6; color: #9ca3af; margin-top: 32px; margin-bottom: 0;">
        If you have any questions, feel free to contact us at <a href="mailto:${adminEmail}" style="color: #06b6d4; text-decoration: none;">${adminEmail}</a>.
      </p>
    </div>
    
    <div style="background-color: #111827; padding: 20px; text-align: center; border-t: 1px solid #1e293b; font-size: 12px; color: #6b7280;">
      <p style="margin: 0 0 4px 0;">Organized by Smartzy Education & matriXO</p>
      <p style="margin: 0;">Please keep this email safe as ticket entry receipt.</p>
    </div>
  </div>
  `;

  const textBody = `Hi ${data.fullName},\n\n` +
                   `CONGRATULATIONS! Your registration for DevAgents 1.0 has been CONFIRMED!\n\n` +
                   `Entry Number: ${data.entryNumber}\n` +
                   `Venue: Seminar Hall, A-Block, KPRIT, Hyderabad\n` +
                   `Reporting Time: 09:30 AM, March 15, 2026\n\n` +
                   `Your Check-in QR URL: ${qrCodeUrl}\n\n` +
                   `Please bring a fully charged laptop and your College ID Card.\n\n` +
                   `Best regards,\nTeam matriXO`;

  GmailApp.sendEmail(data.email, subject, textBody, {
    name: 'matriXO Events',
    replyTo: adminEmail,
    htmlBody: htmlBody
  });
  
  Logger.log('Confirmation email sent to: ' + data.email);
}

// Send Rejection email
function sendRegistrationRejectedEmail(data) {
  const adminEmail = PropertiesService.getScriptProperties().getProperty('DEVAGENTS_ADMIN_EMAIL');
  const subject = 'Registration Rejection: DevAgents 1.0';
  
  const htmlBody = `
  <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0b0f19; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; color: #f3f4f6;">
    <div style="background: linear-gradient(135deg, #ef4444 0%, #991b1b 100%); padding: 32px 24px; text-align: center;">
      <div style="font-size: 40px; margin-bottom: 12px;">❌</div>
      <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 800;">Registration Denied</h1>
      <p style="margin: 8px 0 0 0; color: #fee2e2; font-size: 14px;">DevAgents 1.0 Registration Status Update</p>
    </div>
    
    <div style="padding: 32px 24px;">
      <p style="font-size: 16px; line-height: 1.6; color: #d1d5db; margin-top: 0;">Hi ${data.fullName},</p>
      <p style="font-size: 15px; line-height: 1.6; color: #9ca3af;">
        Thank you for your interest in registering for DevAgents 1.0. 
      </p>
      <p style="font-size: 15px; line-height: 1.6; color: #9ca3af;">
        Unfortunately, we were unable to verify your payment screenshot or the registration details submitted (Entry: ${data.entryNumber}). As a result, your registration has been cancelled.
      </p>
      
      <div style="background-color: rgba(239, 68, 68, 0.05); border-left: 4px solid #ef4444; border-radius: 0 8px 8px 0; padding: 16px; margin: 24px 0;">
        <p style="margin: 0; font-size: 13.5px; line-height: 1.5; color: #f87171;">
          <strong>Possible reasons:</strong> The payment receipt uploaded was blurred, not visible, did not contain the correct reference code, or failed verification check.
        </p>
      </div>

      <p style="font-size: 15px; line-height: 1.6; color: #9ca3af;">
        If you believe this is a mistake or would like to re-apply, please contact us immediately or re-submit the form with a valid receipt screenshot.
      </p>
      
      <p style="font-size: 14px; line-height: 1.6; color: #9ca3af; margin-top: 32px; margin-bottom: 0;">
        For assistance, please email us at <a href="mailto:${adminEmail}" style="color: #ef4444; text-decoration: none;">${adminEmail}</a>.
      </p>
    </div>
    
    <div style="background-color: #111827; padding: 20px; text-align: center; border-t: 1px solid #1e293b; font-size: 12px; color: #6b7280;">
      <p style="margin: 0; font-weight: bold;">Team matriXO</p>
    </div>
  </div>
  `;

  const textBody = `Hi ${data.fullName},\n\n` +
                   `We were unable to verify your payment receipt for DevAgents 1.0 (Entry Number: ${data.entryNumber}). Your registration status has been marked as Rejected.\n\n` +
                   `If this is a mistake, please reach out to us at ${adminEmail}.\n\n` +
                   `Best regards,\nTeam matriXO`;

  GmailApp.sendEmail(data.email, subject, textBody, {
    name: 'matriXO Events',
    replyTo: adminEmail,
    htmlBody: htmlBody
  });
  
  Logger.log('Rejection email sent to: ' + data.email);
}

// Hook that sets up custom menu when spreadsheet is opened
function onOpen() {
  try {
    const ui = SpreadsheetApp.getUi();
    ui.createMenu('DevAgents 1.0 Admin')
      .addItem('Process Pending Approvals/Rejections', 'processSheetApprovals')
      .addToUi();
  } catch (e) {
    Logger.log('onOpen can only run inside spreadsheet context');
  }
}
