# DevAgents 1.0 launch checklist

## What is already updated
- Event date changed to **July 5, 2026** in `data/events.json`.
- Placeholder testimonial section removed from the DevAgents page.
- Speaker/logo handling now supports Firebase-hosted asset URLs with local fallbacks.
- Payment modal now uses the main-site gradient palette.
- Registration receipt email endpoint added at `/api/devagents/register`.
- Approval email endpoint added at `/api/devagents/approve` with QR code support.

## What you still need to provide
1. **UPI ID**
   - Set `NEXT_PUBLIC_DEVAGENTS_UPI_ID` in `.env` / `.env.local`.
   - This powers the QR/deep-link payment flow for ₹199.

2. **Firebase-hosted branding assets**
   - Upload the founder speaker image to Firebase Storage.
   - Upload the matriXO logo to Firebase Storage.
   - Paste those public URLs into:
     - `NEXT_PUBLIC_DEVAGENTS_SPEAKER_IMAGE_URL`
     - `NEXT_PUBLIC_MATRIXO_LOGO_LIGHT_URL`
     - `NEXT_PUBLIC_MATRIXO_LOGO_DARK_URL`

3. **Email delivery**
   - Set `RESEND_API_KEY` and `RESEND_FROM_EMAIL`.
   - Make sure the sender domain is verified in Resend.

4. **Google Sheet / Apps Script**
   - Keep `NEXT_PUBLIC_DEVAGENTS_GOOGLE_SCRIPT_URL` pointed at the sheet endpoint.
   - Confirm the script stores the entry number / transaction code and screenshot status.

## Recommended approval workflow
1. User submits the registration form.
2. The site sends the payment screenshot to Google Sheets.
3. `/api/devagents/register` sends the **registration received** email.
4. Employee checks the payment screenshot in the sheet.
5. After approval, call `/api/devagents/approve` with:
   - `name`
   - `email`
   - `entryNumber`
   - optional `qrCodeValue`
   - optional `eventDate`
6. The attendee receives the approval email with a QR code and entry number.
7. At the venue, the employee portal QR scanner can verify the QR / entry number.

## Suggested payload for approval
```json
{
  "name": "Student Name",
  "email": "student@example.com",
  "entryNumber": "DEVAGENTS-1234-5678",
  "qrCodeValue": "DEVAGENTS-1234-5678",
  "eventTitle": "DevAgents 1.0",
  "eventDate": "July 5, 2026"
}
```

## Final verification checklist
- [ ] Mobile layout looks good on a narrow viewport
- [ ] Light mode and dark mode both render correctly
- [ ] QR payment link opens with ₹199 prefilled
- [ ] Receipt email sends after registration
- [ ] Approval email sends with QR image
- [ ] Employee scanner accepts the entry code
- [ ] Attendance is written to Google Sheet / Apps Script

## Notes
- If the UPI ID is not set yet, the UI will show a pending notice instead of a broken QR link.
- The approval email QR encodes the entry number, so employees can use either QR scanning or manual lookup.
