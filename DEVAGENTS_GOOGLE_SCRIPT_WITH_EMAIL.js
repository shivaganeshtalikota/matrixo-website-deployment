// DevAgents 1.0 - Google Apps Script registration + approval workflow
// Deploy this as a Web App with:
//   Execute as: Me
//   Who has access: Anyone

const DEVAGENTS_SHEET_ID = 'REPLACE_WITH_YOUR_DEVAGENTS_SHEET_ID'
const DEVAGENTS_SCREENSHOT_FOLDER_ID = 'REPLACE_WITH_YOUR_DRIVE_FOLDER_ID'
const DEVAGENTS_EVENT_TITLE = 'DevAgents 1.0'
const DEVAGENTS_EVENT_DATE = 'July 5, 2026'
const DEVAGENTS_PRICE = 199
const DEVAGENTS_ENTRY_PREFIX = 'DEVAGENTS'

function doGet() {
  return jsonResponse({
    success: true,
    message: 'DevAgents Apps Script is running.',
  })
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({ success: false, error: 'No data received in request.' }, 400)
    }

    const data = JSON.parse(e.postData.contents)
    const action = String(data.action || 'register')

    if (action === 'approveRegistration') {
      return handleApproval(data)
    }

    return handleRegistration(data)
  } catch (error) {
    Logger.log('DevAgents doPost error: ' + error)
    return jsonResponse({ success: false, error: error.toString() }, 500)
  }
}

function handleRegistration(data) {
  const required = ['name', 'email', 'transactionCode']
  const missing = required.filter((key) => !String(data[key] || '').trim())

  if (missing.length > 0) {
    return jsonResponse({
      success: false,
      error: 'Missing required registration fields: ' + missing.join(', '),
    }, 400)
  }

  const sheet = SpreadsheetApp.openById(DEVAGENTS_SHEET_ID).getActiveSheet()
  const entryNumber = String(data.entryNumber || data.transactionCode || buildEntryNumber())
  const screenshotUrl = saveScreenshotIfPresent(data.paymentScreenshot, data.screenshotFileName || data.transactionCode)

  sheet.appendRow([
    new Date().toISOString(),
    data.eventId || '',
    data.eventTitle || DEVAGENTS_EVENT_TITLE,
    data.ticketType || 'DevAgents 1.0 Pass',
    data.price || DEVAGENTS_PRICE,
    data.transactionCode || '',
    entryNumber,
    data.qrCodeValue || entryNumber,
    data.name || '',
    data.email || '',
    data.phone || '',
    data.college || '',
    data.year || '',
    data.branch || '',
    data.city || '',
    data.github || '',
    data.linkedin || '',
    data.experienceLevel || '',
    data.whyAttend || '',
    screenshotUrl,
    data.status || 'pending_verification',
    'Pending Approval',
  ])

  sendRegistrationReceiptEmail({
    ...data,
    entryNumber,
    screenshotUrl,
  })

  return jsonResponse({
    success: true,
    message: 'Registration saved successfully. Confirmation email sent.',
    entryNumber,
    screenshotUrl,
  })
}

function handleApproval(data) {
  const required = ['name', 'email', 'entryNumber']
  const missing = required.filter((key) => !String(data[key] || '').trim())

  if (missing.length > 0) {
    return jsonResponse({
      success: false,
      error: 'Missing required approval fields: ' + missing.join(', '),
    }, 400)
  }

  const qrCodeValue = String(data.qrCodeValue || data.entryNumber)
  sendApprovalEmail({
    ...data,
    qrCodeValue,
  })

  return jsonResponse({
    success: true,
    message: 'Approval email sent successfully.',
  })
}

function sendRegistrationReceiptEmail(data) {
  const emailBody = `Hi ${data.name},

We’ve received your DevAgents 1.0 registration and payment screenshot.

Registration Details
• Event: ${data.eventTitle || DEVAGENTS_EVENT_TITLE}
• Date: ${DEVAGENTS_EVENT_DATE}
• Entry Number: ${data.entryNumber}
• Transaction Code: ${data.transactionCode}
• Amount Paid: ₹${data.price || DEVAGENTS_PRICE}

Your registration is now pending verification. Once approved, we’ll send a second email with your QR code for entry.

If you need to correct any details, reply to this email before approval.

— Team matriXO`

  GmailApp.sendEmail(String(data.email), `✅ Registration Received: ${data.eventTitle || DEVAGENTS_EVENT_TITLE}`, emailBody, {
    name: 'matriXO Events',
    replyTo: 'events@matrixo.in',
    htmlBody: buildReceiptHtml(data),
  })
}

function sendApprovalEmail(data) {
  const qrCodeValue = String(data.qrCodeValue || data.entryNumber)
  const qrImage = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(qrCodeValue)}`

  const emailBody = `Hi ${data.name},

Your DevAgents 1.0 registration has been approved.

Entry Number: ${data.entryNumber}
Event Date: ${data.eventDate || DEVAGENTS_EVENT_DATE}
Ticket Value: ₹${data.price || DEVAGENTS_PRICE}

Please show the QR code in this email at the venue.

— Team matriXO`

  GmailApp.sendEmail(String(data.email), `✅ Approved: ${data.eventTitle || DEVAGENTS_EVENT_TITLE}`, emailBody, {
    name: 'matriXO Events',
    replyTo: 'events@matrixo.in',
    htmlBody: buildApprovalHtml(data, qrImage),
  })
}

function buildReceiptHtml(data) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 24px; background: #f8fafc; color: #0f172a;">
      <div style="background: linear-gradient(135deg, #2563eb, #7c3aed, #ec4899); padding: 28px; border-radius: 20px; color: white; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">Registration Received</h1>
        <p style="margin: 10px 0 0; opacity: 0.95;">${DEVAGENTS_EVENT_TITLE}</p>
      </div>
      <div style="background: white; border-radius: 20px; margin-top: 18px; padding: 24px; border: 1px solid #e2e8f0;">
        <p style="font-size: 16px; line-height: 1.6; margin-top: 0;">Hi ${data.name},</p>
        <p style="font-size: 14px; line-height: 1.7; color: #334155;">We have received your registration and payment screenshot. Your request is now pending verification. Once approved, we’ll send a second email containing your QR code and entry number.</p>
        <div style="margin: 20px 0; padding: 16px; border-radius: 16px; background: #eff6ff; border: 1px solid #bfdbfe;">
          <p style="margin: 0 0 8px; font-weight: 700; color: #1d4ed8;">Entry Number</p>
          <p style="margin: 0; font-size: 18px; font-family: monospace; color: #0f172a;">${data.entryNumber}</p>
        </div>
        <div style="display:grid; gap: 8px; font-size: 14px; color: #334155;">
          <p style="margin: 0;"><strong>Phone:</strong> ${data.phone || '—'}</p>
          <p style="margin: 0;"><strong>College:</strong> ${data.college || '—'}</p>
          <p style="margin: 0;"><strong>Year:</strong> ${data.year || '—'}</p>
          <p style="margin: 0;"><strong>Branch:</strong> ${data.branch || '—'}</p>
          <p style="margin: 0;"><strong>City:</strong> ${data.city || '—'}</p>
          <p style="margin: 0;"><strong>Fee:</strong> ₹${data.price || DEVAGENTS_PRICE}</p>
        </div>
      </div>
    </div>
  `
}

function buildApprovalHtml(data, qrImage) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 24px; background:#f8fafc; color:#0f172a;">
      <div style="background: linear-gradient(135deg, #2563eb, #7c3aed, #ec4899); padding: 28px; border-radius: 20px; color: white; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">Your Entry Is Approved</h1>
        <p style="margin: 10px 0 0; opacity: 0.95;">Show this QR code at the venue</p>
      </div>
      <div style="background: white; border-radius: 20px; margin-top: 18px; padding: 24px; border: 1px solid #e2e8f0; text-align: center;">
        <p style="font-size: 16px; line-height: 1.6; margin-top: 0; text-align: left;">Hi ${data.name}, your registration for <strong>${data.eventTitle || DEVAGENTS_EVENT_TITLE}</strong> has been approved.</p>
        <p style="text-align: left; font-size: 14px; color: #334155;">Entry Number: <strong style="font-family: monospace;">${data.entryNumber}</strong></p>
        ${data.eventDate ? `<p style="text-align: left; font-size: 14px; color: #334155;">Event Date: <strong>${data.eventDate}</strong></p>` : `<p style="text-align: left; font-size: 14px; color: #334155;">Event Date: <strong>${DEVAGENTS_EVENT_DATE}</strong></p>`}
        <div style="display:inline-block; padding:16px; border-radius:18px; border: 1px solid #e2e8f0; background:#fff; margin: 10px 0 18px;">
          <img src="${qrImage}" alt="Approval QR Code" width="280" height="280" style="display:block; border-radius:12px;" />
        </div>
        <p style="font-size: 14px; color:#334155; line-height:1.7;">Our team will scan this QR code or verify your entry number at the venue. Please keep this email accessible on event day.</p>
        <div style="margin-top:18px; padding:16px; border-radius:16px; background:#eff6ff; border:1px solid #bfdbfe; text-align:left;">
          <p style="margin:0 0 8px; font-weight:700; color:#1d4ed8;">What to show at the venue</p>
          <p style="margin:0; font-family: monospace;">${data.entryNumber}</p>
        </div>
      </div>
    </div>
  `
}

function saveScreenshotIfPresent(paymentScreenshot, fileNameSeed) {
  if (!paymentScreenshot || !String(paymentScreenshot).startsWith('data:image')) {
    return ''
  }

  try {
    const folder = DriveApp.getFolderById(DEVAGENTS_SCREENSHOT_FOLDER_ID)
    const base64Data = String(paymentScreenshot).split(',')[1]
    const mimeType = String(paymentScreenshot).split(',')[0].split(':')[1].split(';')[0]
    const blob = Utilities.newBlob(
      Utilities.base64Decode(base64Data),
      mimeType,
      `${String(fileNameSeed || 'devagents').replace(/[^a-zA-Z0-9_-]/g, '_')}.png`,
    )

    const file = folder.createFile(blob)
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW)
    return file.getUrl()
  } catch (error) {
    Logger.log('DevAgents screenshot upload error: ' + error)
    return 'Error uploading screenshot'
  }
}

function buildEntryNumber() {
  return `${DEVAGENTS_ENTRY_PREFIX}-${new Date().getTime()}`
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON)
}