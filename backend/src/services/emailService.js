import nodemailer from 'nodemailer';
import { config } from '../config/env.js';
import { query } from '../config/database.js';

/**
 * CivicVoice Email Notification Service
 * Supports standard SMTP (e.g., Gmail, SendGrid, Brevo, AWS SES) or Ethereal/Console fallback.
 * Strictly ₹0 cost for academic/demo use with zero paid dependencies.
 */

let cachedTransporter = null;

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function getTransporter() {
  if (cachedTransporter) return cachedTransporter;

  if (config.smtpHost && config.smtpUser && config.smtpPass) {
    cachedTransporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpPort === 465,
      auth: {
        user: config.smtpUser.trim(),
        pass: config.smtpPass.replace(/\s+/g, ''),
      },
    });
    console.log(`[EMAIL SERVICE] Configured SMTP relay (${config.smtpHost}:${config.smtpPort}) for ${config.smtpUser}`);
    return cachedTransporter;
  }

  // Development / Demo Fallback: create an ephemeral test account or json transport
  try {
    const testAccount = await nodemailer.createTestAccount();
    cachedTransporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log(`[EMAIL SERVICE] Initialized ₹0 development preview transport with Ethereal (${testAccount.user})`);
  } catch (err) {
    // If offline or ethereal fails, use nodemailer jsonTransport to log cleanly
    cachedTransporter = nodemailer.createTransport({
      jsonTransport: true,
    });
    console.log('[EMAIL SERVICE] Initialized local fallback transport.');
  }

  return cachedTransporter;
}

/**
 * Check idempotency: returns true if this event was already delivered for this issue
 */
async function hasAlreadyNotified(issueId, eventType) {
  try {
    const res = await query(
      `SELECT id FROM notification_logs WHERE issue_id = $1 AND event_type = $2 AND status IN ('sent', 'delivered', 'dev_preview') LIMIT 1;`,
      [issueId, eventType]
    );
    return res.rows.length > 0;
  } catch (err) {
    console.warn('[EMAIL SERVICE] Could not verify idempotency:', err.message);
    return false;
  }
}

/**
 * Record notification log entry
 */
async function logNotification({ eventType, issueId, recipientEmail, recipientName, subject, status, previewUrl, errorMessage }) {
  try {
    await query(
      `INSERT INTO notification_logs (event_type, issue_id, recipient_email, recipient_name, subject, status, preview_url, error_message)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8);`,
      [eventType, issueId, recipientEmail, recipientName || 'Citizen', subject, status, previewUrl || null, errorMessage || null]
    );
  } catch (err) {
    console.warn('[EMAIL SERVICE] Failed to record notification log:', err.message);
  }
}

/**
 * Event 1: Send confirmation when a complaint is registered
 */
export async function sendComplaintSubmittedEmail({ issue, citizenEmail, citizenName }) {
  if (!citizenEmail) return { skipped: true, reason: 'No recipient email provided' };

  const eventType = 'COMPLAINT_SUBMITTED';
  const issueId = issue.id;

  if (await hasAlreadyNotified(issueId, eventType)) {
    console.log(`[EMAIL SERVICE] Idempotency: Issue ${issueId} already received ${eventType} acknowledgement. Skipping duplicate.`);
    return { skipped: true, reason: 'Duplicate notification skipped' };
  }
  const trackingUrl = `${config.frontendUrl}/?trackIssue=${encodeURIComponent(issueId)}#issue-${encodeURIComponent(issueId)}`;
  const subject = `[CivicVoice] Complaint Registered: ${issueId} — ${issue.title}`;
  const safeName = escapeHtml(citizenName || 'Citizen');
  const safeTitle = escapeHtml(issue.title);
  const safeDesc = escapeHtml(issue.description);
  const safeAddress = escapeHtml(issue.address || 'Local Municipal Jurisdiction Area');
  const safeCategory = escapeHtml(issue.categoryName || issue.category || 'General Civic');

  const textBody = `
CivicVoice — Official Grievance Acknowledgement

Namaste ${citizenName || 'Citizen'},

Your civic complaint has been registered with the local municipal grievance system.

Complaint ID: ${issueId}
Title: ${issue.title}
Category: ${safeCategory}
Location: ${issue.address}
Status: Reported (Awaiting Department Review)
Date: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}

Problem Description:
${issue.description}

You can track real-time resolution updates here:
${trackingUrl}

Thank you for contributing to your community.
Responsible Civic Authority · CivicVoice Public Grievance Cell
`.trim();

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Complaint Registered - CivicVoice</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 20px; }
    .card { max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
    .header { background-color: #1e3a8a; color: #ffffff; padding: 24px; text-align: left; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.01em; }
    .header p { margin: 4px 0 0 0; font-size: 13px; opacity: 0.9; }
    .content { padding: 24px; font-size: 14px; line-height: 1.6; color: #334155; }
    .ref-badge { display: inline-block; background-color: #eff6ff; color: #1e40af; padding: 4px 10px; border-radius: 4px; font-weight: 700; font-size: 14px; font-family: monospace; border: 1px solid #bfdbfe; margin-bottom: 12px; }
    .meta-table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px; }
    .meta-table td { padding: 8px 12px; border-bottom: 1px solid #f1f5f9; }
    .meta-table td.label { font-weight: 600; color: #64748b; width: 35%; }
    .desc-box { background: #f8fafc; border-left: 4px solid #3b82f6; padding: 12px 16px; margin: 16px 0; border-radius: 0 4px 4px 0; font-size: 13px; color: #1e293b; }
    .btn-wrap { text-align: center; margin: 28px 0 16px; }
    .btn { display: inline-block; background-color: #1e3a8a; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 14px; }
    .footer { background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 24px; font-size: 12px; color: #64748b; text-align: center; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>CivicVoice</h1>
      <p>Public Grievance Redressal System · Local Municipal Governance</p>
    </div>
    <div class="content">
      <div class="ref-badge">Reference: ${issueId}</div>
      <p>Namaste <strong>${safeName}</strong>,</p>
      <p>Your civic complaint has been registered and scheduled for municipal inspection.</p>
      
      <table class="meta-table">
        <tr>
          <td class="label">Complaint Title</td>
          <td><strong>${safeTitle}</strong></td>
        </tr>
        <tr>
          <td class="label">Category</td>
          <td>${safeCategory}</td>
        </tr>
        <tr>
          <td class="label">Location / Ward</td>
          <td>${safeAddress}</td>
        </tr>
        <tr>
          <td class="label">Initial Status</td>
          <td><span style="color:#2563eb; font-weight:600;">Reported</span></td>
        </tr>
        <tr>
          <td class="label">Date & Time</td>
          <td>${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</td>
        </tr>
      </table>

      <div class="desc-box">
        <strong>Reported Description:</strong><br>
        ${safeDesc}
      </div>

      <div class="btn-wrap">
        <a href="${trackingUrl}" class="btn">View & Track Complaint Progress</a>
      </div>
    </div>
    <div class="footer">
      Responsible Civic Authority · CivicVoice Citizen Redressal Platform.<br>
      This is an automated civic service notification. No payment is ever requested.
    </div>
  </div>
</body>
</html>
`.trim();

  try {
    const transporter = await getTransporter();
    const info = await transporter.sendMail({
      from: config.smtpFrom,
      to: citizenEmail,
      subject,
      text: textBody,
      html: htmlBody,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info) || null;
    const isDev = Boolean(previewUrl) || !config.smtpHost;

    await logNotification({
      eventType,
      issueId,
      recipientEmail: citizenEmail,
      recipientName: citizenName,
      subject,
      status: isDev ? 'dev_preview' : 'sent',
      previewUrl,
    });

    if (previewUrl) {
      console.log(`[EMAIL NOTIFICATION] Complaint submitted preview URL: ${previewUrl}`);
    }

    return { success: true, previewUrl };
  } catch (err) {
    console.error('[EMAIL NOTIFICATION] Failed to send submission email:', err.message);
    await logNotification({
      eventType,
      issueId,
      recipientEmail: citizenEmail,
      recipientName: citizenName,
      subject,
      status: 'failed',
      errorMessage: err.message,
    });
    return { success: false, error: err.message };
  }
}

/**
 * Event 2: Send completion notification when municipal work is completed
 * Includes citizen verification call to action.
 * Enforces idempotency to avoid duplicate notifications on retried status updates.
 */
export async function sendWorkCompletedEmail({ issue, citizenEmail, citizenName, resolutionNote, completionEvidenceUrl, officerName, department }) {
  if (!citizenEmail) return { skipped: true, reason: 'No recipient email provided' };

  const eventType = 'COMPLAINT_COMPLETED';
  const issueId = issue.id;

  // Idempotency check: do not resend if already notified for this completion
  const alreadySent = await hasAlreadyNotified(issueId, eventType);
  if (alreadySent) {
    return { skipped: true, reason: 'Completion notification already dispatched for this complaint.' };
  }

  const trackingUrl = `${config.frontendUrl}/?trackIssue=${encodeURIComponent(issueId)}#issue-${encodeURIComponent(issueId)}`;
  const subject = `[Resolved] Municipal Work Completed: ${issueId} — ${issue.title}`;
  const safeName = escapeHtml(citizenName || 'Citizen');
  const safeTitle = escapeHtml(issue.title);
  const safeDesc = escapeHtml(issue.description);
  const safeNote = escapeHtml(resolutionNote || 'Work completed by municipal field squad.');
  const safeOfficer = escapeHtml(officerName || 'Field Operations Team');
  const safeDept = escapeHtml(department || 'Responsible Civic Department');

  const textBody = `
CivicVoice — Resolution Notification

Namaste ${citizenName || 'Citizen'},

The municipal team has completed work on your complaint #${issueId}: "${issue.title}".

Status: Work Completed (Awaiting Citizen Verification)
Officer / Crew: ${safeOfficer} (${safeDept})
Resolution Notes: ${safeNote}
Completion Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}

Original Complaint:
${issue.description}

PLEASE VERIFY THE RESOLUTION:
As the reporter, your inspection is critical. Please visit the complaint link below to verify if the problem has been solved satisfactorily or to reopen the complaint if further action is required:
${trackingUrl}

Thank you for your active citizenship in your community.
Responsible Civic Authority · CivicVoice
`.trim();

  const evidenceHtml = completionEvidenceUrl
    ? `<div style="margin: 16px 0; text-align: center;">
         <p style="font-size: 12px; color: #64748b; margin-bottom: 6px;">Work Completion Photo:</p>
         <img src="${escapeHtml(completionEvidenceUrl)}" alt="Completion Evidence" style="max-width: 100%; max-height: 260px; border-radius: 6px; border: 1px solid #cbd5e1;" />
       </div>`
    : '';

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Work Completed - CivicVoice</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 20px; }
    .card { max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
    .header { background-color: #065f46; color: #ffffff; padding: 24px; text-align: left; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 700; }
    .header p { margin: 4px 0 0 0; font-size: 13px; opacity: 0.9; }
    .content { padding: 24px; font-size: 14px; line-height: 1.6; color: #334155; }
    .badge { display: inline-block; background-color: #ecfdf5; color: #065f46; padding: 4px 10px; border-radius: 4px; font-weight: 700; font-size: 14px; border: 1px solid #a7f3d0; margin-bottom: 12px; }
    .note-box { background: #f0fdf4; border-left: 4px solid #10b981; padding: 12px 16px; margin: 16px 0; border-radius: 0 4px 4px 0; font-size: 13px; color: #064e3b; }
    .verify-callout { background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px; padding: 14px; margin: 20px 0; }
    .verify-callout h3 { margin: 0 0 6px 0; font-size: 14px; color: #92400e; font-weight: 700; }
    .verify-callout p { margin: 0; font-size: 13px; color: #78350f; line-height: 1.5; }
    .btn-wrap { text-align: center; margin: 24px 0 16px; }
    .btn { display: inline-block; background-color: #065f46; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: 600; font-size: 14px; }
    .footer { background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 24px; font-size: 12px; color: #64748b; text-align: center; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>CivicVoice</h1>
      <p>Municipal Work Completed Notification</p>
    </div>
    <div class="content">
      <div class="badge">Reference: ${issueId} · Status: Work Completed</div>
      <p>Namaste <strong>${safeName}</strong>,</p>
      <p>The municipal team has reported that repair and field work for your complaint <strong>"${safeTitle}"</strong> is complete.</p>

      <div class="note-box">
        <strong>Field Officer Update:</strong><br>
        ${safeNote}<br>
        <small style="color: #047857; margin-top: 4px; display: inline-block;">Logged by ${safeOfficer} · ${safeDept}</small>
      </div>

      ${evidenceHtml}

      <div class="verify-callout">
        <h3>Citizen Verification Required</h3>
        <p>Please inspect the site. You can verify that the problem is resolved or reopen the complaint if further action is required.</p>
      </div>

      <div class="btn-wrap">
        <a href="${trackingUrl}" class="btn">Inspect & Verify Resolution</a>
      </div>
    </div>
    <div class="footer">
      Responsible Civic Authority · Local Municipal Public Redressal.<br>
      This is an official public service communication.
    </div>
  </div>
</body>
</html>
`.trim();

  try {
    const transporter = await getTransporter();
    const info = await transporter.sendMail({
      from: config.smtpFrom,
      to: citizenEmail,
      subject,
      text: textBody,
      html: htmlBody,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info) || null;
    const isDev = Boolean(previewUrl) || !config.smtpHost;

    await logNotification({
      eventType,
      issueId,
      recipientEmail: citizenEmail,
      recipientName: citizenName,
      subject,
      status: isDev ? 'dev_preview' : 'sent',
      previewUrl,
    });

    if (previewUrl) {
      console.log(`[EMAIL NOTIFICATION] Work completed preview URL: ${previewUrl}`);
    }

    return { success: true, previewUrl };
  } catch (err) {
    console.error('[EMAIL NOTIFICATION] Failed to send completion email:', err.message);
    await logNotification({
      eventType,
      issueId,
      recipientEmail: citizenEmail,
      recipientName: citizenName,
      subject,
      status: 'failed',
      errorMessage: err.message,
    });
    return { success: false, error: err.message };
  }
}

/**
 * Event 3: Send notification when a complaint is merged into a canonical complaint
 */
export async function sendComplaintMergedEmail({ duplicateIssue, canonicalIssue, citizenEmail, citizenName }) {
  if (!citizenEmail) return { skipped: true, reason: 'No recipient email provided' };

  const eventType = 'COMPLAINT_MERGED';
  const issueId = duplicateIssue.id;

  const alreadySent = await hasAlreadyNotified(issueId, eventType);
  if (alreadySent) {
    return { skipped: true, reason: 'Merge notification already dispatched.' };
  }

  const canonicalUrl = `${config.frontendUrl}/#issue-${canonicalIssue.id}`;
  const subject = `[Merged] Complaint ${issueId} grouped into ${canonicalIssue.id}`;
  const safeName = escapeHtml(citizenName || 'Citizen');
  const safeDupTitle = escapeHtml(duplicateIssue.title);
  const safeCanonTitle = escapeHtml(canonicalIssue.title);

  const textBody = `
CivicVoice — Complaint Consolidation Notice

Namaste ${citizenName || 'Citizen'},

Your complaint #${issueId} ("${duplicateIssue.title}") has been grouped with an existing canonical report #${canonicalIssue.id} ("${canonicalIssue.title}") describing the same incident.

Your report has NOT been deleted. Your description, photos, and support count have been preserved and consolidated into the main report to give it stronger priority with municipal crews.

You can still view your submission under "My Complaints", and follow the main complaint progress here:
${canonicalUrl}

Thank you for reporting.
Responsible Civic Authority · CivicVoice
`.trim();

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Reports Grouped - CivicVoice</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 20px; }
    .card { max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
    .header { background-color: #1e3a8a; color: #ffffff; padding: 20px; }
    .header h1 { margin: 0; font-size: 18px; }
    .content { padding: 20px; font-size: 14px; line-height: 1.6; color: #334155; }
    .info-box { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 14px; margin: 16px 0; font-size: 13px; }
    .btn-wrap { text-align: center; margin: 20px 0; }
    .btn { display: inline-block; background-color: #1e3a8a; color: #ffffff !important; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-weight: 600; font-size: 13px; }
    .footer { background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 14px; font-size: 12px; color: #64748b; text-align: center; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>CivicVoice</h1>
      <p style="margin:4px 0 0 0; font-size:12px; opacity:0.9;">Complaint Consolidation Notice</p>
    </div>
    <div class="content">
      <p>Namaste <strong>${safeName}</strong>,</p>
      <p>Your report <strong>#${issueId}: "${safeDupTitle}"</strong> has been grouped with existing complaint <strong>#${canonicalIssue.id}: "${safeCanonTitle}"</strong> representing the same real-world issue.</p>
      <div class="info-box">
        <strong>What this means:</strong><br>
        • Your original submission and photos are preserved.<br>
        • Supporters have been consolidated to strengthen priority.<br>
        • You can still access this report under <em>My Complaints</em>.
      </div>
      <div class="btn-wrap">
        <a href="${canonicalUrl}" class="btn">View Consolidated Complaint</a>
      </div>
    </div>
    <div class="footer">
      Responsible Civic Authority · CivicVoice Public Grievance Cell
    </div>
  </div>
</body>
</html>
`.trim();

  try {
    const transporter = await getTransporter();
    const info = await transporter.sendMail({
      from: config.smtpFrom,
      to: citizenEmail,
      subject,
      text: textBody,
      html: htmlBody,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info) || null;
    const isDev = Boolean(previewUrl) || !config.smtpHost;

    await logNotification({
      eventType,
      issueId,
      recipientEmail: citizenEmail,
      recipientName: citizenName,
      subject,
      status: isDev ? 'dev_preview' : 'sent',
      previewUrl,
    });

    return { success: true, previewUrl };
  } catch (err) {
    console.error('[EMAIL NOTIFICATION] Failed to send merge email:', err.message);
    await logNotification({
      eventType,
      issueId,
      recipientEmail: citizenEmail,
      recipientName: citizenName,
      subject,
      status: 'failed',
      errorMessage: err.message,
    });
    return { success: false, error: err.message };
  }
}
