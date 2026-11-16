# TradeX signup prototype

Clickable prototype of the TradeX signup A/B/C test, built in Next.js from the Figma designs.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3200. Press **P** (or the "Prototype" pill) to open the navigator with every flow, mobile view and out-of-flow screen.

## Flows

- **A · Guided**: `/` → signup → connect exchange → `/dashboard`
- **B · Soft lock**: `/b` → signup → locked dashboard → connect → `/b/unlocked`
- **C · Freemium 7 days**: `/c` → signup → trial dashboard with one modal per day (`?day=1–8`, `&modal=0|1`; day 1 is the welcome) → lock wall → reactivation → `/c/unlocked`

There is no password: signup asks only for the email, and login is always a 6-digit email code. Connect moments in B and C use the shared paywall (`components/paywall`).

## Demo values

| Value | Result |
| --- | --- |
| `taken@example.com` | Email already has an account |
| `000000` / `999999` | Wrong / expired code |
| `111111111` | UID already used |
| `222222222` | Account not opened through TradeX |

Add `?clean=1` to any URL to hide the navigator (used for screenshots).

## Deploy

Standard Next.js project at the repo root: import it in Vercel with the default settings.
