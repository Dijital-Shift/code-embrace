Update the footer credit line across the site and in the email template.

## What to change
1. **Homepage footer** (`src/routes/index.tsx`)
   - Replace `Built by Dijital Shift · v1.0` with `Dijital.System 2`.
   - Drop the version number entirely.

2. **Legal page footers**
   - `src/routes/terms.tsx`
   - `src/routes/refund.tsx`
   - `src/routes/privacy.tsx`
   - Replace `Built by Dijital Shift` with `Dijital.System 2`.

3. **Email template** (`src/lib/email-templates/_brand.tsx`)
   - Replace the credit line `Dijital System • 01` with `Dijital.System 2`.

4. **User memory** (`mem://~user`)
   - Record the new footer credit preference so future sessions default to `Dijital.System 2`.

## Notes
- No structural or routing changes.
- No new assets needed.
- Keep the same muted styling and size; only the text changes.
