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
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <p>Dear ${name},</p>
      
      <p>Greetings from matriXO!</p>
      
      <p>Thank you for registering for <strong>DevAgentic 1.0 – From LLMs to Autonomous AI Agents</strong>. We are pleased to confirm your registration for the workshop.</p>
      
      <p><strong>Event Details:</strong><br/>
      Date: Saturday, 11th July 2026<br/>
      Time: 3:00 PM – 6:00 PM<br/>
      Venue: DraperU India, Indira Nagar, Gachibowli, Hyderabad</p>
      
      <p><strong>Your Entry Details:</strong><br/>
      Entry Number: <strong>${entryNumber}</strong></p>
      
      <p><strong>Important:</strong><br/>
      Please keep a note of your Entry Number and present it during check-in at the venue. Entry will be verified using this number, so kindly have it readily available during registration.</p>
      
      <p>As this is a hands-on workshop, all participants are required to bring their own laptops to actively participate in the practical sessions. We recommend arriving 15–20 minutes early to complete the check-in process and settle in before the workshop begins.</p>
      
      <p>We look forward to an engaging session where you'll explore Agentic AI, build AI agents, and gain practical exposure to the latest AI technologies.</p>
      
      <p>If you have any questions or require further assistance, please feel free to contact:</p>
      
      <p>Jahnavi Mulukutla<br/>
      Operations Manager, matriXO<br/>
      7330855353</p>
      
      <p>We look forward to welcoming you to DevAgentic 1.0!</p>
      
      <p>Warm regards,<br/>
      Team matriXO</p>
    </div>
  `;

  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM || '"matriXO Events" <events@matrixo.in>',
    to: email,
    subject: "Registration Confirmed – DevAgentic 1.0 | 11th July 2026",
    html: htmlBody,
  });

  return info;
};
