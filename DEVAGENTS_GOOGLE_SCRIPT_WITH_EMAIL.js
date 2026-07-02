// ================================================
// DevAgents 1.0 - Production-ready Google Apps Script
// Web App:
//   Execute as: Me
//   Who has access: Anyone
// ================================================

/**
 * All configuration is via Script Properties.
 * Project Settings -> Script Properties
 *
 * Required:
 * - DEVAGENTS_SHEET_ID
 * - DEVAGENTS_DRIVE_FOLDER_ID
 *
 * Optional:
 * - DEVAGENTS_ENTRY_PREFIX (default: DA)
 * - DEVAGENTS_ADMIN_EMAIL (default: events@matrixo.in)
 */
function getConfig_() {
  const props = PropertiesService.getScriptProperties()

  const spreadsheetId = (props.getProperty('DEVAGENTS_SHEET_ID') || '').trim()
  const driveFolderId = (props.getProperty('DEVAGENTS_DRIVE_FOLDER_ID') || '').trim()
  const entryPrefix = (props.getProperty('DEVAGENTS_ENTRY_PREFIX') || 'DA').trim()
  const adminEmail = (props.getProperty('DEVAGENTS_ADMIN_EMAIL') || 'events@matrixo.in').trim()

  if (!spreadsheetId) throw new Error('Missing Script Property: DEVAGENTS_SHEET_ID')
  if (!driveFolderId) throw new Error('Missing Script Property: DEVAGENTS_DRIVE_FOLDER_ID')

  return { spreadsheetId, driveFolderId, entryPrefix, adminEmail }
}

/**
 * Required spreadsheet header structure (exactly as requested)
 */
const SHEET_HEADERS_ = [
  'Timestamp',
  'Entry Number',
  'Full Name',
  'Email',
  'Phone',
  'College',
  'Year',
  'Branch',
  'City',
  'GitHub',
  'LinkedIn',
  'Experience Level',
  'Why do you want to attend?',
  'Payment Screenshot',
  'Payment Status',
  'Approval Status',
  'QR Code',
  'Check-in Status',
  'Approved By',
  'Approval Time',
]


const DEFAULT_PAYMENT_STATUS_ = 'Pending'
const DEFAULT_APPROVAL_STATUS_ = 'Pending'
const DEFAULT_CHECKIN_STATUS_ = 'Not Checked In'

function doGet() {
  return jsonResponse_({ success: true, message: 'DevAgents Apps Script is running.' })
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonError_(
        'NO_DATA',
        'No data received in request.',
        400,
        { hasPostData: !!(e && e.postData) }
      )
    }

    const raw = e.postData.contents
    const data = safeJsonParse_(raw)

    if (!data) {
      return jsonError_('INVALID_JSON', 'Request body is not valid JSON.', 400, {
        rawSample: String(raw).slice(0, 500),
      })
    }

    const action = String(data.action || 'register')

    // Prepared admin helpers for future use
    if (action === 'approveRegistration') return approveRegistration_(data)
    if (action === 'rejectRegistration') return rejectRegistration_(data)
    if (action === 'sendApprovalEmail') return sendApprovalEmail_(data)
    if (action === 'generateQRCode') return generateQRCode_(data)
    if (action === 'markCheckedIn') return markCheckedIn_(data)

    // Default: registration workflow
    return register_(data)
  } catch (error) {
    Logger.log('DevAgents doPost error: ' + (error && error.stack ? error.stack : error))
    return jsonError_('INTERNAL_ERROR', error ? error.toString() : 'Unknown error', 500, {})
  }
}

// =============================
// Registration workflow
// =============================
function register_(data) {
  try {
    const cfg = getConfig_()

    // Accept payload keys in a tolerant manner.
    const fullName = String(data.fullName || data.name || '').trim()
    const email = String(data.email || '').trim()
    const phone = String(data.phone || data.contactNumber || '').trim()
    const college = String(data.college || data.collegeName || '').trim()
    const year = String(data.year || '').trim()
    const branch = String(data.branch || data.department || '').trim()
    const github = String(data.github || '').trim()
    const linkedIn = String(data.linkedIn || data.linkedin || '').trim()
    const experienceLevel = String(data.experienceLevel || '').trim()
    const whyAttend = String(data.whyAttend || '').trim()
    const city = String(data.city || '').trim()

    // Base64 required by spec
    const paymentScreenshot = data.paymentScreenshot || data.paymentScreenshotBase64 || ''
    if (!fullName || !email) {

      return jsonError_(
        'MISSING_FIELDS',
        'Full Name and Email are required.',
        400,
        { fullNamePresent: !!fullName, emailPresent: !!email }
      )
    }
    if (!paymentScreenshot) {
      return jsonError_('MISSING_PAYMENT_SCREENSHOT', 'Payment Screenshot is required.', 400, {})
    }

    const sheet = getOrInitSheet_(cfg.spreadsheetId)

    // Sequential entry numbers (never timestamp-based)
    const entryNumber = generateEntryNumber_(cfg.entryPrefix)

    // Upload to Drive
    const driveInfo = uploadPaymentScreenshotToDrive_(cfg.driveFolderId, paymentScreenshot, entryNumber)

    // QR code in sheet (formula). If later you want QR as Drive file, we can extend.
    const qrFormula = buildQrCodeFormula_(entryNumber)

    // Payment Screenshot in sheet: thumbnail image via IMAGE(url).
    // We store screenshot only in Drive (not Base64 in Sheets).
    const screenshotFormula = buildImageFormula_(driveInfo.url)

    const nowIso = new Date().toISOString()

    const row = [
      nowIso, // Timestamp
      entryNumber, // Entry Number
      fullName, // Full Name
      email, // Email
      phone, // Phone
      college, // College
      year, // Year
      branch, // Branch
      city, // City
      github, // GitHub
      linkedIn, // LinkedIn
      experienceLevel, // Experience Level
      whyAttend, // Why do you want to attend?
      screenshotFormula, // Payment Screenshot (thumbnail)
      DEFAULT_PAYMENT_STATUS_, // Payment Status = Pending
      DEFAULT_APPROVAL_STATUS_, // Approval Status = Pending
      qrFormula, // QR Code
      DEFAULT_CHECKIN_STATUS_, // Check-in Status
      '', // Approved By
      '', // Approval Time
    ]


    sheet.appendRow(row)

    // Confirmation email to participant
    sendRegistrationReceivedEmail_(cfg.adminEmail, {
      toEmail: email,
      participantName: fullName,
      entryNumber,
      paymentVerificationPending: true,
      paymentScreenshotReceived: true,
    })

    return jsonResponse_({ success: true, entryNumber })
  } catch (error) {
    Logger.log('register_ error: ' + (error && error.stack ? error.stack : error))
    return jsonError_('REGISTRATION_FAILED', error ? error.toString() : 'Unknown error', 500, {})
  }
}

// =============================
// ADMIN WORKFLOW (helpers prepared)
// =============================
function approveRegistration_(data) {
  // Prepared for future use.
  try {
    return jsonResponse_({ success: true, message: 'approveRegistration endpoint is prepared.' })
  } catch (error) {
    Logger.log('approveRegistration_ error: ' + (error && error.stack ? error.stack : error))
    return jsonError_('APPROVAL_FAILED', error ? error.toString() : 'Unknown error', 500, {})
  }
}

function rejectRegistration_(data) {
  // Prepared for future use.
  try {
    return jsonResponse_({ success: true, message: 'rejectRegistration endpoint is prepared.' })
  } catch (error) {
    Logger.log('rejectRegistration_ error: ' + (error && error.stack ? error.stack : error))
    return jsonError_('REJECTION_FAILED', error ? error.toString() : 'Unknown error', 500, {})
  }
}

function sendApprovalEmail_(data) {
  // Prepared for future use.
  try {
    return jsonResponse_({ success: true, message: 'sendApprovalEmail endpoint is prepared.' })
  } catch (error) {
    Logger.log('sendApprovalEmail_ error: ' + (error && error.stack ? error.stack : error))
    return jsonError_('EMAIL_FAILED', error ? error.toString() : 'Unknown error', 500, {})
  }
}

function generateQRCode_(data) {
  // Prepared: generate QR formula payload.
  try {
    const entryNumber = String(data.entryNumber || '').trim()
    if (!entryNumber) throw new Error('Missing entryNumber')
    return jsonResponse_({ success: true, qrFormula: buildQrCodeFormula_(entryNumber) })
  } catch (error) {
    Logger.log('generateQRCode_ error: ' + (error && error.stack ? error.stack : error))
    return jsonError_('QR_FAILED', error ? error.toString() : 'Unknown error', 500, {})
  }
}

function markCheckedIn_(data) {
  // Prepared: update sheet check-in fields in future.
  try {
    return jsonResponse_({ success: true, message: 'markCheckedIn endpoint is prepared.' })
  } catch (error) {
    Logger.log('markCheckedIn_ error: ' + (error && error.stack ? error.stack : error))
    return jsonError_('CHECKIN_FAILED', error ? error.toString() : 'Unknown error', 500, {})
  }
}

// =============================
// Internal helpers
// =============================
function getOrInitSheet_(spreadsheetId) {
  const ss = SpreadsheetApp.openById(spreadsheetId)
  const sheet = ss.getActiveSheet()

  // Ensure header correctness.
  const lastRow = sheet.getLastRow()
  const existingHeader = lastRow >= 1
    ? sheet.getRange(1, 1, 1, SHEET_HEADERS_.length).getValues()[0]
    : []

  const isCorrect =
    existingHeader &&
    existingHeader.length === SHEET_HEADERS_.length &&
    existingHeader.join('|') === SHEET_HEADERS_.join('|')

  if (!isCorrect) {
    sheet.getRange(1, 1, 1, SHEET_HEADERS_.length).setValues([SHEET_HEADERS_])
  }

  return sheet
}

function generateEntryNumber_(prefix) {
  // Must never duplicate: use ScriptProperties counter with LockService.
  const lock = LockService.getScriptLock()
  lock.waitLock(10000)
  try {
    const props = PropertiesService.getScriptProperties()

    const current = parseInt(props.getProperty('DEVAGENTS_ENTRY_COUNTER') || '1000', 10)
    const next = Math.max(1001, current + 1)

    props.setProperty('DEVAGENTS_ENTRY_COUNTER', String(next))

    // DA1001, DA1002...
    return `${prefix}${next}`
  } finally {
    lock.releaseLock()
  }
}

function uploadPaymentScreenshotToDrive_(folderId, dataUrl, entryNumber) {
  try {
    const dataUrlStr = String(dataUrl)
    if (!dataUrlStr.startsWith('data:image')) {
      throw new Error('paymentScreenshot must be a base64 data URL starting with data:image')
    }

    const folder = DriveApp.getFolderById(folderId)

    const base64 = dataUrlStr.split(',')[1]
    const mimeType = dataUrlStr.split(',')[0].split(':')[1].split(';')[0]
    const ext = mimeType.includes('png')
      ? 'png'
      : mimeType.includes('jpeg')
        ? 'jpg'
        : 'png'

    const blob = Utilities.newBlob(
      Utilities.base64Decode(base64),
      mimeType,
      `${entryNumber}.${ext}`
    )

    const file = folder.createFile(blob)
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW)

    return {
      id: file.getId(),
      url: file.getUrl(),
    }
  } catch (error) {
    Logger.log('uploadPaymentScreenshotToDrive_ error: ' + (error && error.stack ? error.stack : error))
    throw error
  }
}

function buildImageFormula_(driveFileUrl) {
  // IMPORTANT: Use an embeddable Drive direct image URL for IMAGE().
  // This avoids failures with regular file "getUrl()" pages.
  //
  // driveFileUrl example: https://drive.google.com/file/d/<FILE_ID>/view
  //
  // We convert to:
  //   https://drive.google.com/uc?export=view&id=<FILE_ID>

  const match = String(driveFileUrl).match(/\/d\/([^/]+)\/view/)
  const fileId = match ? match[1] : ''

  const directUrl = fileId
    ? `https://drive.google.com/uc?export=view&id=${fileId}`
    : String(driveFileUrl)

  return `=IMAGE("${directUrl}")`
}


function buildQrCodeFormula_(value) {
  // Uses an external QR generator for simplicity.
  // If you want to store QR images in Drive later, we can extend.
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(value)}`
  return `=IMAGE("${qrUrl}")`
}

function sendRegistrationReceivedEmail_(adminEmail, opts) {
  const toEmail = String(opts.toEmail || '').trim()
  const participantName = String(opts.participantName || '').trim()
  const entryNumber = String(opts.entryNumber || '').trim()

  if (!toEmail) throw new Error('sendRegistrationReceivedEmail_: missing toEmail')

  // Professional HTML email (no plain text)
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 680px; margin: 0 auto; padding: 18px; color: #0f172a;">
      <div style="background: linear-gradient(135deg, #2563eb, #7c3aed, #ec4899); padding: 26px; border-radius: 18px; color: #ffffff; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">DevAgents 1.0 Registration Received</h1>
        <p style="margin: 10px 0 0; font-size: 14px; opacity: 0.95;">Registration successful</p>
      </div>

      <div style="margin-top: 16px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 18px; padding: 18px;">
        <p style="margin: 0 0 12px; font-size: 16px;">Hi <b>${participantName}</b>,</p>
        <p style="margin: 0 0 14px; font-size: 14px; line-height: 1.7; color: #334155;">
          Your registration is successful. We have received your payment screenshot.
          Payment verification is currently <b>pending</b>.
        </p>

        <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 14px; padding: 14px; margin: 12px 0;">
          <div style="font-size: 12px; color: #1d4ed8; font-weight: 700; margin-bottom: 6px;">Entry Number</div>
          <div style="font-family: monospace; font-size: 20px; color: #0f172a;">${entryNumber}</div>
        </div>

        <div style="font-size: 14px; color: #334155;">
          <p style="margin: 8px 0;"><b>Payment Screenshot:</b> ${opts.paymentScreenshotReceived ? 'Received' : 'Not Received'}</p>
          <p style="margin: 8px 0;"><b>Payment Verification:</b> ${opts.paymentVerificationPending ? 'Pending' : 'Completed'}</p>
        </div>

        <div style="margin-top: 16px; font-size: 13px; color: #475569; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 12px;">
          <b>Need help?</b><br/>
          Contact: <a href="mailto:${adminEmail}" style="color:#2563eb; text-decoration:none;">${adminEmail}</a><br/>
          Website: <a href="https://matrixo.in" style="color:#2563eb; text-decoration:none;">https://matrixo.in</a>
        </div>
      </div>

      <div style="margin-top: 14px; text-align: center; color: #64748b; font-size: 12px;">matriXO</div>
    </div>
  `

  GmailApp.sendEmail(toEmail, 'DevAgents 1.0 Registration Received', '', {
    htmlBody: html,
    name: 'matriXO Events',
    replyTo: adminEmail,
  })
}

function safeJsonParse_(raw) {
  try {
    return JSON.parse(raw)
  } catch (e) {
    Logger.log('safeJsonParse_ error: ' + (e && e.toString ? e.toString() : e))
    return null
  }
}

function jsonResponse_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON)
}

function jsonError_(errorCode, message, status, details) {
  // Web apps return body JSON. Include status for frontend.
  return jsonResponse_({
    success: false,
    errorCode: errorCode,
    error: message,
    details: details || {},
    status: status,
  })
}

