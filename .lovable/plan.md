## What's wrong today

Two issues are stacking and making the logo look like a "square":

1. The uploaded logo PNG has a **solid white background** baked into the image. On the dark navy site, that white square shows behind the gold mark — that's the box you're seeing.
2. The logo **already contains** the wordmark "ISABELLE HART / INTERIOR" inside it. Next to that we added a second "Isabelle Hart / Interiors" wordmark with a divider line — so the brand name is shown twice, which looks cluttered, not premium.

## The fix

### 1. Remove the white background from the logo
Regenerate the logo asset (same IH monogram + "ISABELLE HART / INTERIOR" wordmark, same gold) as a **transparent PNG**, so only the gold artwork shows and it floats cleanly on any background (dark or light theme).

### 2. Simplify the header and footer
Because the wordmark lives inside the logo, drop the second typeset wordmark and the gold divider line. Show the logo on its own, sized larger so it reads as the proper brand mark — not a tiny icon crammed against text.

- Header: logo only, `h-12 md:h-14`, transparent background, subtle hover fade. No text beside it.
- Footer: same treatment, slightly larger (`h-14`), centered or left-aligned to match the existing layout.

### 3. Keep the admin upload flow
The `useBrandingLogo` hook stays as-is — you can still upload a replacement logo any time from Admin → Appearance → Branding. The new transparent file just becomes the default fallback.

## Files affected

- `src/assets/logo-isabelle-hart.png` — replaced with a transparent-background version
- `src/components/Navigation.tsx` — remove the wordmark block + divider, size up the logo
- `src/components/Footer.tsx` — same simplification

## Result

A single, clean gold brand mark sitting directly on the dark navy — no white box, no duplicated text. That's what reads as premium and editorial.
