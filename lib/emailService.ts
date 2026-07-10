import nodemailer from "nodemailer";

interface ConfirmationEmailParams {
  name: string;
  email: string;
  entryNumber: string;
}

/**
 * Creates the transporter using SMTP credentials from environment variables.
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "465", 10),
    secure: parseInt(process.env.SMTP_PORT || "465", 10) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

/**
 * Sends the DevAgentic 1.0 confirmation email.
 */
export const sendConfirmationEmail = async ({
  name,
  email,
  entryNumber,
}: ConfirmationEmailParams) => {
  const transporter = createTransporter();

  const htmlBody = `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="format-detection" content="telephone=no, address=no, email=no, date=no, url=no">
  <title>Registration Confirmed - DevAgentic 1.0</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    body, p, h1, h2, h3, h4, h5, h6 { margin: 0; padding: 0; }
    body, table, td, p, a, li, blockquote { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { border: 0; line-height: 100%; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
    body { background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #374151; }
    .container { width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .card { padding: 20px; border-radius: 8px; }
    .header { padding: 30px 20px; text-align: center; background-color: #1e293b; color: #ffffff; }
    .content { padding: 30px 20px; }
    .footer { padding: 20px; text-align: center; font-size: 12px; color: #64748b; background-color: #f1f5f9; }
    @media screen and (max-width: 600px) {
      .container { width: 100% !important; }
      .content { padding: 20px 15px !important; }
      .card { padding: 15px !important; }
    }
  </style>
</head>
<body style="background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table role="presentation" class="container" width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; max-width: 600px; margin: 0 auto; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
          <!-- Header -->
          <tr>
            <td class="header" style="padding: 30px 20px; text-align: center; background-color: #1e293b; color: #ffffff;">
              <h1 style="margin: 0; font-size: 24px; font-weight: bold; letter-spacing: 1px;">matriXO</h1>
              <p style="margin: 10px 0 0 0; font-size: 16px; color: #cbd5e1;">DevAgentic 1.0 Registration</p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td class="content" style="padding: 30px 20px;">
              <p style="margin-bottom: 20px; font-size: 16px; line-height: 24px;">Dear <strong>${name}</strong>,</p>
              
              <p style="margin-bottom: 25px; font-size: 16px; line-height: 24px;">
                Thank you for registering for <strong>DevAgentic 1.0 - From LLMs to Autonomous AI Agents</strong>. We are pleased to confirm your registration for the workshop.
              </p>

              <!-- Entry Number Card -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 25px;">
                <tr>
                  <td class="card" style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; text-align: center;">
                    <p style="margin: 0 0 10px 0; font-size: 14px; color: #166534; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">Your Entry Number</p>
                    <div style="font-size: 32px; font-weight: bold; color: #15803d; letter-spacing: 2px;">
                      <span style="display:inline-block; vertical-align:middle; margin-right:8px;">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#15803d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-label="Entry ticket" role="img"><title>Entry ticket</title><path d="M4 7v10c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2z"></path><path d="M4 11h2"></path><path d="M4 13h2"></path><path d="M18 11h2"></path><path d="M18 13h2"></path><path d="M10 7v10"></path><path d="M14 7v10"></path></svg>
                      </span>
                      <span style="vertical-align:middle;">${entryNumber}</span>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Event Details Card -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 25px;">
                <tr>
                  <td class="card" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px;">
                    <h3 style="margin: 0 0 15px 0; font-size: 18px; color: #0f172a;">Event Details</h3>
                    
                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td width="30" valign="top" style="padding-bottom: 12px;">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-label="Calendar" role="img"><title>Calendar</title><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                        </td>
                        <td valign="top" style="padding-bottom: 12px; font-size: 15px; line-height: 20px; color: #334155;">
                          <strong>Date:</strong> Saturday, 11th July 2026
                        </td>
                      </tr>
                      <tr>
                        <td width="30" valign="top" style="padding-bottom: 12px;">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-label="Clock" role="img"><title>Clock</title><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        </td>
                        <td valign="top" style="padding-bottom: 12px; font-size: 15px; line-height: 20px; color: #334155;">
                          <strong>Time:</strong> 3:00 PM - 6:00 PM
                        </td>
                      </tr>
                      <tr>
                        <td width="30" valign="top">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-label="Location pin" role="img"><title>Location pin</title><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                        </td>
                        <td valign="top" style="font-size: 15px; line-height: 20px; color: #334155;">
                          <strong>Venue:</strong> DraperU India, Indira Nagar, Gachibowli, Hyderabad
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Important Instructions Card -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 25px;">
                <tr>
                  <td class="card" style="background-color: #fff7ed; border: 1px solid #ffedd5; border-radius: 8px; padding: 20px;">
                    <h3 style="margin: 0 0 15px 0; font-size: 18px; color: #9a3412;">
                      <span style="display:inline-block; vertical-align:middle; margin-right:6px;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ea580c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-label="Warning" role="img"><title>Warning</title><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                      </span>
                      <span style="vertical-align:middle;">Important Instructions</span>
                    </h3>
                    
                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td width="30" valign="top" style="padding-bottom: 12px;">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ea580c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-label="Check-in" role="img"><title>Check-in</title><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                        </td>
                        <td valign="top" style="padding-bottom: 12px; font-size: 14px; line-height: 20px; color: #431407;">
                          Please keep a note of your <strong>Entry Number</strong> and present it during check-in at the venue. Entry will be verified using this number.
                        </td>
                      </tr>
                      <tr>
                        <td width="30" valign="top" style="padding-bottom: 12px;">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ea580c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-label="Laptop" role="img"><title>Laptop</title><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="2" y1="20" x2="22" y2="20"></line></svg>
                        </td>
                        <td valign="top" style="padding-bottom: 12px; font-size: 14px; line-height: 20px; color: #431407;">
                          As this is a hands-on workshop, all participants are required to <strong>bring their own laptops</strong>.
                        </td>
                      </tr>
                      <tr>
                        <td width="30" valign="top">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ea580c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-label="Clock" role="img"><title>Clock</title><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        </td>
                        <td valign="top" style="font-size: 14px; line-height: 20px; color: #431407;">
                          We recommend arriving <strong>15-20 minutes early</strong> to complete the check-in process and settle in.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin-bottom: 20px; font-size: 16px; line-height: 24px;">
                We look forward to an engaging session where you'll explore Agentic AI, build AI agents, and gain practical exposure to the latest AI technologies.
              </p>

              <p style="margin-bottom: 20px; font-size: 15px; line-height: 22px; color: #475569; border-top: 1px solid #e2e8f0; padding-top: 20px;">
                If you have any questions or require further assistance, please feel free to contact:<br/><br/>
                <strong>Jahnavi Mulukutla</strong><br/>
                Operations Manager, matriXO<br/>
                <span style="display:inline-block; vertical-align:middle; margin-right:4px;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#475569" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-label="Phone" role="img"><title>Phone</title><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                </span>
                <span style="vertical-align:middle;">7330855353</span>
              </p>
              
              <p style="margin-bottom: 0; font-size: 16px; line-height: 24px;">
                Warm regards,<br/>
                <strong>Team matriXO</strong>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td class="footer" style="padding: 20px; text-align: center; font-size: 12px; color: #64748b; background-color: #f1f5f9; border-top: 1px solid #e2e8f0;">
              &copy; 2026 matriXO. All rights reserved.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM || '"matriXO Events" <events@matrixo.in>',
    to: email,
    subject: "Registration Confirmed - DevAgentic 1.0 | 11th July 2026",
    html: htmlBody,
    textEncoding: "base64",
  });

  return info;
};
