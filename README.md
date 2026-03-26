# The Celestial Observer

A responsive Next.js MVP inspired by the provided Figma design for daily Islamic essentials:

- Current and next prayer focus
- Full daily prayer times
- Hijri date display
- Qibla direction
- Browser-only saved preferences (city, country, calculation method)

## Tech

- Next.js 16 + App Router + TypeScript
- Tailwind CSS
- Zod for API response validation
- date-fns + date-fns-tz for time utilities
- AlAdhan free public APIs

References:

- [Figma Design](https://www.figma.com/design/spRfqfWp8BlIjxbjXU2ol8/The-Celestial-Observer?node-id=0-1&p=f&t=ETCpxlM9GRPZmBXh-0)
- [AlAdhan](https://aladhan.com/)
- [Prayer Times API](https://aladhan.com/prayer-times-api)

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Build

```bash
npm run build
npm run start
```

## API Usage

The UI calls:

- `GET /api/dashboard?city=Karachi&country=Pakistan&method=2`

The route internally calls AlAdhan:

- `timingsByCity`
- `qibla`

No API key is required for this MVP.
