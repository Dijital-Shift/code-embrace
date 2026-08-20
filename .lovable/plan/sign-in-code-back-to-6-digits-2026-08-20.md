# Sign-in code: back to 6 digits

Now that the backend issues 6-digit codes, the sign-in screen should say and expect exactly 6.

## Confirm first

Before changing copy, verify the live setting actually returns a 6-digit code (read the auth config; if that isn't readable, send one code to a test address and check the length). If it still comes back as 8, stop and report instead of shipping copy that breaks sign-in.

## Copy and input fixes (`src/routes/login.tsx`)

- "…we'll send an 8-digit code." → "…we'll send a 6-digit code." (both the sign-in and create-account lines)
- "Enter the 8-digit code we sent to {email}" → "Enter the 6-digit code we sent to {email}"
- Code input: `minLength`/`maxLength` both 6, `pattern="\d{6}"`, and the onChange trim slices to 6
- Verify button stays disabled until 6 digits are entered

## Not changing

The auth emails (sign-in, signup, reauthentication) never state a digit count — they just render whatever token the backend sends, so they need no edits. Expiry copy ("expires in 1 hour") stays as-is.

## After

Run a real sign-in with a fresh code to confirm entry and verification work end to end.
