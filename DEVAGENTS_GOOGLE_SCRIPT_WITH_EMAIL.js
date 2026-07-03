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
  const props = PropertiesService.getScriptProperties();

  const spreadsheetId = (props.getProperty("DEVAGENTS_SHEET_ID") || "").trim();
  const driveFolderId = (
    props.getProperty("DEVAGENTS_DRIVE_FOLDER_ID") || ""
  ).trim();
  const entryPrefix = (
    props.getProperty("DEVAGENTS_ENTRY_PREFIX") || "DA"
  ).trim();
  const adminEmail = (
    props.getProperty("DEVAGENTS_ADMIN_EMAIL") || "events@matrixo.in"
  ).trim();

  if (!spreadsheetId)
    throw new Error("Missing Script Property: DEVAGENTS_SHEET_ID");
  if (!driveFolderId)
    throw new Error("Missing Script Property: DEVAGENTS_DRIVE_FOLDER_ID");

  return { spreadsheetId, driveFolderId, entryPrefix, adminEmail };
}

/**
 * Required spreadsheet header structure
 */
// Column order MUST match the appendRow() call in register_() exactly.
// 17 columns — do not add, remove, or reorder without updating register_() too.
const SHEET_HEADERS_ = [
  "Timestamp", // [0]
  "Entry Number", // [1]  generated internally — never from frontend
  "Full Name", // [2]
  "Email", // [3]
  "Phone", // [4]
  "College", // [5]
  "Year", // [6]
  "Branch", // [7]
  "City", // [8]
  "GitHub", // [9]
  "LinkedIn", // [10]
  "Experience Level", // [11]
  "Payment Screenshot", // [12]  =IMAGE() formula pointing to Drive thumbnail
  "Payment Status", // [13]
  "Approval Status", // [14]
  "Drive File URL", // [15]  direct Google Drive link to screenshot file
  "Registration Status", // [16]
];

const DEFAULT_PAYMENT_STATUS_ = "Pending";
const DEFAULT_APPROVAL_STATUS_ = "Pending";
const DEFAULT_REGISTRATION_STATUS_ = "Pending";

function doGet() {
  return jsonResponse_({
    success: true,
    message: "DevAgents Apps Script is running.",
  });
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonError_("NO_DATA", "No data received in request.", 400, {
        hasPostData: !!(e && e.postData),
      });
    }

    const raw = e.postData.contents;
    const data = safeJsonParse_(raw);

    if (!data) {
      return jsonError_(
        "INVALID_JSON",
        "Request body is not valid JSON.",
        400,
        {
          rawSample: String(raw).slice(0, 500),
        },
      );
    }

    const action = String(data.action || "register");

    // Admin helpers
    if (action === "approveRegistration") return approveRegistration_(data);
    if (action === "rejectRegistration") return rejectRegistration_(data);
    if (action === "sendApprovalEmail") return sendApprovalEmail_(data);
    if (action === "generateQRCode") return generateQRCode_(data);
    if (action === "markCheckedIn") return markCheckedIn_(data);

    // Default: registration workflow
    return register_(data);
  } catch (error) {
    Logger.log(
      "DevAgents doPost error: " + (error && error.stack ? error.stack : error),
    );
    return jsonError_(
      "INTERNAL_ERROR",
      error ? error.toString() : "Unknown error",
      500,
      {},
    );
  }
}

// =============================
// Registration workflow
// =============================
function register_(data) {
  try {
    const cfg = getConfig_();

    // Accept payload keys in a tolerant manner.
    const fullName = String(data.fullName || data.name || "").trim();
    const email = String(data.email || "").trim();
    const phone = String(data.phone || data.contactNumber || "").trim();
    const college = String(data.college || data.collegeName || "").trim();
    const year = String(data.year || "").trim();
    const branch = String(data.branch || data.department || "").trim();
    const github = String(data.github || "").trim();
    const linkedIn = String(data.linkedIn || data.linkedin || "").trim();
    const experienceLevel = String(data.experienceLevel || "").trim();
    const city = String(data.city || "").trim();

    // Base64 required by spec
    const paymentScreenshot =
      data.paymentScreenshot || data.paymentScreenshotBase64 || "";

    if (!fullName || !email) {
      return jsonError_(
        "MISSING_FIELDS",
        "Full Name and Email are required.",
        400,
        { fullNamePresent: !!fullName, emailPresent: !!email },
      );
    }
    if (!paymentScreenshot) {
      return jsonError_(
        "MISSING_PAYMENT_SCREENSHOT",
        "Payment Screenshot is required.",
        400,
        {},
      );
    }

    const sheet = getOrInitSheet_(cfg.spreadsheetId);

    // Check for duplicate registration by email
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      const emailCol = 4; // Column D = Email (1-indexed)
      const emailValues = sheet
        .getRange(2, emailCol, lastRow - 1, 1)
        .getValues();
      for (var i = 0; i < emailValues.length; i++) {
        if (
          String(emailValues[i][0]).trim().toLowerCase() === email.toLowerCase()
        ) {
          return jsonError_(
            "DUPLICATE_EMAIL",
            "You have already registered for this event. Check your email for confirmation.",
            409,
            { email: email },
          );
        }
      }
    }

    // 1. Generate Entry Number internally — NEVER taken from the frontend payload.
    const entryNumber = generateEntryNumber_(cfg.entryPrefix);

    // 2. Upload Base64 screenshot to Google Drive.
    const driveInfo = uploadPaymentScreenshotToDrive_(
      cfg.driveFolderId,
      paymentScreenshot,
      entryNumber,
    );

    // 3. Build =IMAGE() formula for the thumbnail cell.
    const screenshotFormula = buildImageFormula_(driveInfo.url);

    const nowIso = new Date().toISOString();

    // -----------------------------------------------------------------------
    // CRITICAL: this array MUST stay in exact sync with SHEET_HEADERS_ above.
    // Position [0..16] — 17 elements, no more, no less.
    // -----------------------------------------------------------------------
    const row = [
      nowIso, // [0]  Timestamp
      entryNumber, // [1]  Entry Number
      fullName, // [2]  Full Name
      email, // [3]  Email
      phone, // [4]  Phone
      college, // [5]  College
      year, // [6]  Year
      branch, // [7]  Branch
      city, // [8]  City
      github, // [9]  GitHub
      linkedIn, // [10] LinkedIn
      experienceLevel, // [11] Experience Level
      screenshotFormula, // [12] Payment Screenshot (=IMAGE formula)
      DEFAULT_PAYMENT_STATUS_, // [13] Payment Status
      DEFAULT_APPROVAL_STATUS_, // [14] Approval Status
      driveInfo.url, // [15] Drive File URL
      DEFAULT_REGISTRATION_STATUS_, // [16] Registration Status
    ];

    sheet.appendRow(row);

    // Confirmation email to participant
    sendRegistrationReceivedEmail_(cfg.adminEmail, {
      toEmail: email,
      participantName: fullName,
      entryNumber: entryNumber,
      paymentVerificationPending: true,
      paymentScreenshotReceived: true,
    });

    return jsonResponse_({ success: true, entryNumber: entryNumber });
  } catch (error) {
    Logger.log(
      "register_ error: " + (error && error.stack ? error.stack : error),
    );
    return jsonError_(
      "REGISTRATION_FAILED",
      error ? error.toString() : "Unknown error",
      500,
      {},
    );
  }
}

// =============================
// ADMIN WORKFLOW (helpers prepared)
// =============================
function approveRegistration_(data) {
  try {
    return jsonResponse_({
      success: true,
      message: "approveRegistration endpoint is prepared.",
    });
  } catch (error) {
    Logger.log(
      "approveRegistration_ error: " +
        (error && error.stack ? error.stack : error),
    );
    return jsonError_(
      "APPROVAL_FAILED",
      error ? error.toString() : "Unknown error",
      500,
      {},
    );
  }
}

function rejectRegistration_(data) {
  try {
    return jsonResponse_({
      success: true,
      message: "rejectRegistration endpoint is prepared.",
    });
  } catch (error) {
    Logger.log(
      "rejectRegistration_ error: " +
        (error && error.stack ? error.stack : error),
    );
    return jsonError_(
      "REJECTION_FAILED",
      error ? error.toString() : "Unknown error",
      500,
      {},
    );
  }
}

function sendApprovalEmail_(data) {
  try {
    return jsonResponse_({
      success: true,
      message: "sendApprovalEmail endpoint is prepared.",
    });
  } catch (error) {
    Logger.log(
      "sendApprovalEmail_ error: " +
        (error && error.stack ? error.stack : error),
    );
    return jsonError_(
      "EMAIL_FAILED",
      error ? error.toString() : "Unknown error",
      500,
      {},
    );
  }
}

function generateQRCode_(data) {
  try {
    const entryNumber = String(data.entryNumber || "").trim();
    if (!entryNumber) throw new Error("Missing entryNumber");
    return jsonResponse_({
      success: true,
      qrFormula: buildQrCodeFormula_(entryNumber),
    });
  } catch (error) {
    Logger.log(
      "generateQRCode_ error: " + (error && error.stack ? error.stack : error),
    );
    return jsonError_(
      "QR_FAILED",
      error ? error.toString() : "Unknown error",
      500,
      {},
    );
  }
}

function markCheckedIn_(data) {
  try {
    return jsonResponse_({
      success: true,
      message: "markCheckedIn endpoint is prepared.",
    });
  } catch (error) {
    Logger.log(
      "markCheckedIn_ error: " + (error && error.stack ? error.stack : error),
    );
    return jsonError_(
      "CHECKIN_FAILED",
      error ? error.toString() : "Unknown error",
      500,
      {},
    );
  }
}

// =============================
// Internal helpers
// =============================
function getOrInitSheet_(spreadsheetId) {
  const ss = SpreadsheetApp.openById(spreadsheetId);
  const sheet = ss.getActiveSheet();

  // Ensure header correctness.
  const lastRow = sheet.getLastRow();
  const existingHeader =
    lastRow >= 1
      ? sheet.getRange(1, 1, 1, SHEET_HEADERS_.length).getValues()[0]
      : [];

  const isCorrect =
    existingHeader &&
    existingHeader.length === SHEET_HEADERS_.length &&
    existingHeader.join("|") === SHEET_HEADERS_.join("|");

  if (!isCorrect) {
    sheet.getRange(1, 1, 1, SHEET_HEADERS_.length).setValues([SHEET_HEADERS_]);
  }

  return sheet;
}

function generateEntryNumber_(prefix) {
  // Must never duplicate: use ScriptProperties counter with LockService.
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const props = PropertiesService.getScriptProperties();

    const current = parseInt(
      props.getProperty("DEVAGENTS_ENTRY_COUNTER") || "1000",
      10,
    );
    const next = Math.max(1001, current + 1);

    props.setProperty("DEVAGENTS_ENTRY_COUNTER", String(next));

    // DA1001, DA1002...
    return prefix + next;
  } finally {
    lock.releaseLock();
  }
}

function uploadPaymentScreenshotToDrive_(folderId, dataUrl, entryNumber) {
  try {
    var dataUrlStr = String(dataUrl);
    if (!dataUrlStr.startsWith("data:image")) {
      throw new Error(
        "paymentScreenshot must be a base64 data URL starting with data:image",
      );
    }

    var folder = DriveApp.getFolderById(folderId);

    var base64 = dataUrlStr.split(",")[1];
    var mimeType = dataUrlStr.split(",")[0].split(":")[1].split(";")[0];
    var ext =
      mimeType.indexOf("png") !== -1
        ? "png"
        : mimeType.indexOf("jpeg") !== -1
          ? "jpg"
          : "png";

    var blob = Utilities.newBlob(
      Utilities.base64Decode(base64),
      mimeType,
      entryNumber + "." + ext,
    );

    var file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    return {
      id: file.getId(),
      url: file.getUrl(),
    };
  } catch (error) {
    Logger.log(
      "uploadPaymentScreenshotToDrive_ error: " +
        (error && error.stack ? error.stack : error),
    );
    throw error;
  }
}

function buildImageFormula_(driveFileUrl) {
  var match = String(driveFileUrl).match(/\/d\/([^/]+)\/view/);
  var fileId = match ? match[1] : "";

  var directUrl = fileId
    ? "https://drive.google.com/uc?export=view&id=" + fileId
    : String(driveFileUrl);

  return '=IMAGE("' + directUrl + '")';
}

function buildQrCodeFormula_(value) {
  var qrUrl =
    "https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=" +
    encodeURIComponent(value);
  return '=IMAGE("' + qrUrl + '")';
}

function sendRegistrationReceivedEmail_(adminEmail, opts) {
  var toEmail = String(opts.toEmail || "").trim();
  var participantName = String(opts.participantName || "").trim();
  var entryNumber = String(opts.entryNumber || "").trim();

  if (!toEmail)
    throw new Error("sendRegistrationReceivedEmail_: missing toEmail");

  // Professional HTML email
  var html =
    '<div style="font-family: Arial, sans-serif; max-width: 680px; margin: 0 auto; padding: 18px; color: #0f172a;">' +
    '<div style="background: linear-gradient(135deg, #2563eb, #7c3aed, #ec4899); padding: 26px; border-radius: 18px; color: #ffffff; text-align: center;">' +
    '<h1 style="margin: 0; font-size: 28px;">DevAgents 1.0 Registration Received</h1>' +
    '<p style="margin: 10px 0 0; font-size: 14px; opacity: 0.95;">Registration successful</p>' +
    "</div>" +
    '<div style="margin-top: 16px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 18px; padding: 18px;">' +
    '<p style="margin: 0 0 12px; font-size: 16px;">Hi <b>' +
    participantName +
    "</b>,</p>" +
    '<p style="margin: 0 0 14px; font-size: 14px; line-height: 1.7; color: #334155;">' +
    "Your registration is successful. We have received your payment screenshot. " +
    "Payment verification is currently <b>pending</b>." +
    "</p>" +
    '<div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 14px; padding: 14px; margin: 12px 0;">' +
    '<div style="font-size: 12px; color: #1d4ed8; font-weight: 700; margin-bottom: 6px;">Entry Number</div>' +
    '<div style="font-family: monospace; font-size: 20px; color: #0f172a;">' +
    entryNumber +
    "</div>" +
    "</div>" +
    '<div style="font-size: 14px; color: #334155;">' +
    '<p style="margin: 8px 0;"><b>Payment Screenshot:</b> ' +
    (opts.paymentScreenshotReceived ? "Received" : "Not Received") +
    "</p>" +
    '<p style="margin: 8px 0;"><b>Payment Verification:</b> ' +
    (opts.paymentVerificationPending ? "Pending" : "Completed") +
    "</p>" +
    "</div>" +
    '<div style="margin-top: 16px; font-size: 13px; color: #475569; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 12px;">' +
    "<b>Need help?</b><br/>" +
    'Contact: <a href="mailto:' +
    adminEmail +
    '" style="color:#2563eb; text-decoration:none;">' +
    adminEmail +
    "</a><br/>" +
    'Website: <a href="https://matrixo.in" style="color:#2563eb; text-decoration:none;">https://matrixo.in</a>' +
    "</div>" +
    "</div>" +
    '<div style="margin-top: 14px; text-align: center; color: #64748b; font-size: 12px;">matriXO</div>' +
    "</div>";

  GmailApp.sendEmail(toEmail, "DevAgents 1.0 Registration Received", "", {
    htmlBody: html,
    name: "matriXO Events",
    replyTo: adminEmail,
  });
}

function safeJsonParse_(raw) {
  try {
    return JSON.parse(raw);
  } catch (e) {
    Logger.log("safeJsonParse_ error: " + (e && e.toString ? e.toString() : e));
    return null;
  }
}

function jsonResponse_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

function jsonError_(errorCode, message, status, details) {
  return jsonResponse_({
    success: false,
    errorCode: errorCode,
    error: message,
    details: details || {},
    status: status,
  });
}
