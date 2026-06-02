# Boundless Limousine — Booking App

Online booking form for chauffeured rides. Built with Next.js (App Router) and deployed on Vercel.

**Live site:** [rene-Boundless-Limousine-app.vercel.app](https://rene-Boundless-Limousine-app.vercel.app)

The UI still shows the **ExampleIQ** brand from the original design — that’s intentional for now.

---

## What it does

- Book a **one-way** or **hourly** trip
- Pick **pickup / drop-off** locations with Google Places autocomplete (address or airport)
- See **driving distance and estimated time** once both ends are selected
- Enter a phone number — returning customers get a personal greeting; new ones are asked for name and email
- Validates everything client-side and again on the server before submit
- Booking submit is a **mock endpoint** for now (returns a confirmation ID like `BK-…`)

---

## Run locally

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

You can use `npm` instead of `pnpm` if you prefer — same commands.

---

## Environment variables

Copy `.env.example` to `.env.local` for local dev. On Vercel, add the same keys under **Project → Settings → Environment Variables**.

| Variable | Where | What it’s for |
|----------|-------|----------------|
| `NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY` | Client (public) | Places autocomplete in the browser |
| `GOOGLE_MAPS_API_KEY` | Server (secret) | Routes API — distance & travel time |

Both keys come from [Google Cloud Console](https://console.cloud.google.com/). You need billing enabled (Google gives ~$200/month free credit).

**Browser key** — restrict by HTTP referrer:

```
http://localhost:3000/*
https://rene-Boundless-Limousine-app.vercel.app/*
```

Enable **Maps JavaScript API** and **Places API (New)** on that key.

**Server key** — restrict by API only (**Routes API**). No referrer restriction.

Mark `GOOGLE_MAPS_API_KEY` as **Sensitive** in Vercel so it never ships to the client.

---

## Try the phone lookup

These numbers are hard-coded for demo purposes:

| Phone | Customer |
|-------|----------|
| `+17744153244` | Jordan Reed — greeted as “Welcome back, Jordan!” |
| `+15551234567` | John Doe — greeted as “Welcome back, John!” |

Any other number triggers the “we don’t have that on file” flow and asks for contact details.

---

## Project layout

```
app/
  layout.tsx, page.tsx, globals.css
  api/
    compute-route/     distance + duration (Google Routes)
    lookup-phone/      mock customer lookup
    submit-booking/    mock booking confirmation
components/
  BookingForm.tsx      main form
  Field.tsx, Toggle.tsx, PlaceAutocomplete.tsx, UsFlag.tsx
lib/
  booking/
    compute-route.ts   Google Routes API + schema
    lookup-phone.ts    mock customer lookup
    submit-booking.ts  booking schema + mock submit
  google-maps.ts       Maps script loader
  open-picker.ts       date/time picker helper
```

---

## Browsers

Tested on current **Chrome, Edge, Firefox, and Safari** (desktop and mobile).

A few things worth knowing:

- **Date picker** — click the calendar icon on the left, or tap the field. Native icons on the right are hidden in most browsers.
- **Time picker** — same left-clock-icon pattern. Firefox is picky: we leave its native time control visible on the right because hiding it breaks the picker entirely.
- **Google Maps** won’t load unless your browser key allows the domain you’re on (localhost or the Vercel URL above).
- **IE** — not supported (Next.js 16).

---

## Deploy

Connected to Vercel. Push to the linked branch and it builds automatically.

After changing env vars in Vercel, redeploy once so they take effect.
