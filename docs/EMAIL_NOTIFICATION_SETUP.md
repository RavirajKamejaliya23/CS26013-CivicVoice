# CivicVoice — Email Notifications Setup & Zero-Cost Guide

CivicVoice includes an automated, transactional email notification service built on **Nodemailer**. It is configured to operate at **₹0 cost** out of the box with development previews, while supporting standard SMTP providers for production delivery.

---

## 1. Automated Email Events

### Event 1: Complaint Successfully Submitted
- **Recipient**: The authenticated citizen who submitted the complaint.
- **Trigger**: Executed asynchronously after the database transaction commits the new complaint.
- **Content**:
  - Official Vadodara Municipal Corporation header.
  - Unique Reference Code (e.g., `CV-VAD-2026-XXXX`).
  - Complaint Title, Full Description, Category, Locality/Address, and Timestamp.
  - One-click link to view and track progress.

### Event 2: Municipal Work Completed
- **Recipient**: The original reporter of the complaint.
- **Trigger**: When an authorized Municipal Officer or Admin transitions the complaint status to `completed`.
- **Content**:
  - Reference Code, Title, and problem description.
  - Field officer's resolution notes and department info.
  - Work completion evidence photo (if attached by field squad).
  - Prominent **Citizen Verification CTA**: clear instructions to inspect the site and certify the repair or reopen the complaint.
- **Idempotency Guarantee**: Before dispatching, the service verifies `notification_logs` to ensure retried status updates never trigger duplicate completion emails.

### Event 3: Duplicate Complaint Merged
- **Recipient**: The reporter of the child duplicate report.
- **Trigger**: When an Admin marks a report as a duplicate of a canonical complaint.
- **Content**:
  - Explains that the report has been grouped into canonical complaint `#CV-VAD-2026-XXXX`.
  - Reassurance that the original submission, photos, and reporter details are preserved.
  - Link to follow the consolidated complaint.

---

## 2. Zero-Cost (₹0) Development Mode

When no external SMTP credentials are provided in `backend/.env`:
1. CivicVoice automatically initializes an ephemeral **Ethereal** test account or formatted console preview transport.
2. Every notification generates a real, clickable web preview URL:
   ```
   [EMAIL NOTIFICATION] Complaint submitted preview URL: https://ethereal.email/message/...
   ```
3. You can click the link in your backend terminal to inspect the rendered responsive HTML and plain-text templates.
4. Delivery status is logged to the `notification_logs` table with status `dev_preview`.

---

## 3. Production SMTP Provider Setup & Free Tiers

To send real emails to citizens' inboxes, add SMTP credentials to `backend/.env`. Below are genuinely free tiers suitable for academic and demo use:

### Option A: Brevo (Formerly Sendinblue) — Recommended for Free Production
- **Free Allowance**: 300 emails/day forever (₹0).
- **Setup**:
  1. Register at [brevo.com](https://www.brevo.com/).
  2. Go to **SMTP & API** > **Generate new SMTP key**.
  3. Configure in `backend/.env`:
     ```env
     SMTP_HOST=smtp-relay.brevo.com
     SMTP_PORT=587
     SMTP_USER=your-brevo-login-email
     SMTP_PASS=your-smtp-master-key
     SMTP_FROM=CivicVoice Vadodara <your-verified-sender@example.com>
     ```

### Option B: Gmail App Password
- **Free Allowance**: 500 emails/day with standard free Gmail account (₹0).
- **Setup**:
  1. In your Google Account, enable 2-Step Verification.
  2. Navigate to **Security** > **App passwords**.
  3. Generate a password for "Mail" / "CivicVoice".
  4. Configure in `backend/.env`:
     ```env
     SMTP_HOST=smtp.gmail.com
     SMTP_PORT=587
     SMTP_USER=youraccount@gmail.com
     SMTP_PASS=your-16-character-app-password
     SMTP_FROM=CivicVoice Vadodara <youraccount@gmail.com>
     ```

### Option C: SendGrid Free Plan
- **Free Allowance**: 100 emails/day forever (₹0).
- **Setup**:
  ```env
  SMTP_HOST=smtp.sendgrid.net
  SMTP_PORT=587
  SMTP_USER=apikey
  SMTP_PASS=your-sendgrid-api-key
  SMTP_FROM=CivicVoice Vadodara <your-verified-single-sender@example.com>
  ```

---

## 4. Architecture & Security Guarantees

1. **Non-Blocking Post-Commit Execution**:
   All email calls run in `try/catch` handlers *after* the PostgreSQL transaction commits. If an SMTP server is unreachable or offline, **it never rolls back or prevents a complaint submission or status update**.
2. **HTML Injection / XSS Prevention**:
   All user-provided text (titles, descriptions, citizen names, notes) is passed through `escapeHtml()` before interpolating into HTML email bodies.
3. **Idempotency**:
   The `notification_logs` table tracks `(issue_id, event_type, status)`. Retrying a completion status change will detect the existing log and skip sending a second email.
4. **Credential Safety**:
   Passwords, JWT tokens, and Google tokens are never included in email templates or log payloads.
