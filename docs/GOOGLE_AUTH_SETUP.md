# CivicVoice — Google Sign-In Setup & Security Guide

This document describes how to configure Google OAuth 2.0 / OpenID Connect for citizen authentication in CivicVoice.

---

## 1. Google Cloud Console Setup

### Step 1: Create or Select a Google Cloud Project
1. Visit the [Google Cloud Console](https://console.cloud.google.com/).
2. Log in with your Google account.
3. Click the project dropdown at the top and click **New Project**.
4. Set the project name to `CivicVoice-Vadodara` and click **Create**.

### Step 2: Configure the OAuth Consent Screen
1. In the sidebar, navigate to **APIs & Services** > **OAuth consent screen**.
2. Select **External** user type (allows any citizen with a Google account to sign in) and click **Create**.
3. Fill in the required application details:
   - **App name**: `CivicVoice Vadodara`
   - **User support email**: Your development or support email.
   - **Developer contact information**: Your contact email.
4. Click **Save and Continue**.
5. On the **Scopes** page, click **Add or Remove Scopes** and select:
   - `.../auth/userinfo.email` (See your primary Google Account email address)
   - `.../auth/userinfo.profile` (See your personal info, including personal info you've made publicly available)
   - `openid` (Associate you with your personal info on Google)
6. Click **Update** and then **Save and Continue**.
7. Under **Test users**, add the email addresses of the Google accounts you will use for testing in development.
8. Click **Save and Continue**.

### Step 3: Create Web Application Credentials
1. In the sidebar, navigate to **APIs & Services** > **Credentials**.
2. Click **+ Create Credentials** > **OAuth client ID**.
3. Under **Application type**, select **Web application**.
4. Name: `CivicVoice Web Client`.
5. Under **Authorized JavaScript origins**, click **+ Add URI** and add:
   - `http://localhost:5173` (Vite dev server)
   - `http://localhost:5000` (Node backend server)
   - `http://127.0.0.1:5173`
   - `http://127.0.0.1:5000`
6. Under **Authorized redirect URIs**, click **+ Add URI** and add:
   - `http://localhost:5173`
   - `http://localhost:5000/api/auth/google/callback` (if using server redirect)
7. Click **Create**.
8. Copy the generated **Client ID** (ends with `.apps.googleusercontent.com`) and **Client secret**.

---

## 2. Environment Variables Configuration

### Backend (`backend/.env`)
Add the following to your `backend/.env` file:
```env
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Frontend (`frontend/.env`)
Add the client ID to your `frontend/.env` file:
```env
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

> **Security Note:** Never commit `.env` containing production secrets to version control. `VITE_GOOGLE_CLIENT_ID` is public by design, but `GOOGLE_CLIENT_SECRET` must remain strictly server-side.

---

## 3. Backend Verification Architecture & RBAC Security

1. **Token Verification**:
   The backend uses Google's official `google-auth-library` (`OAuth2Client.verifyIdToken`) to cryptographically verify:
   - Signature integrity against Google public keys.
   - Issuer (`accounts.google.com` or `https://accounts.google.com`).
   - Audience matching `process.env.GOOGLE_CLIENT_ID` (prevents token reuse from other apps).
   - Expiration and email verification status (`payload.email_verified === true`).

2. **Stable Subject Identifier (`sub`)**:
   Users are identified by `google_id` (`payload.sub`), which is permanent and does not change even if the citizen changes their Google email.

3. **Role Enforcement**:
   - Google self-registration strictly assigns `CITIZEN` role.
   - If an existing Municipal Officer or Admin logs in via Google with a matching verified email, their account is securely linked while **strictly preserving their Municipal or Admin role**. No role elevation or downgrade is permitted.

---

## 4. Local Testing & Troubleshooting

### Scenario A: Google Sign-In with Valid Configuration
1. Start backend: `npm run dev` in `backend/`
2. Start frontend: `npm run dev` in `frontend/`
3. Click "Sign In" > "Continue with Google".
4. Select your test Google account.
5. You will be authenticated as a citizen and issued a CivicVoice JWT.

### Scenario B: Unconfigured Environment (`VITE_GOOGLE_CLIENT_ID` is blank)
- The modal renders a clean "Continue with Google" button.
- Clicking the button displays a friendly notice explaining how to configure Google OAuth in `.env`, preventing misleading failures.

### Troubleshooting:
- `Google token verification failed: Token used too late`: Check your local system clock and ensure time synchronization is active.
- `Wrong recipient, payload audience != client id`: Ensure the `GOOGLE_CLIENT_ID` in `backend/.env` matches `VITE_GOOGLE_CLIENT_ID` in `frontend/.env`.
- `403 Access Blocked: App has not completed the Google verification process`: In development mode, the Google account you are logging in with must be added to the **Test Users** list in Google Cloud Console.
