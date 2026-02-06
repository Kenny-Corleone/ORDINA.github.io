## ORDINA Svelte – Life Order Assistant

Premium personal finance and life‑management PWA, rebuilt with **Svelte + TypeScript** and kept in full feature parity with the vanilla **ORDINA 1 (MAIN)** application.

This project is the Svelte/TypeScript implementation of the same product you see in the vanilla ORDINA MAIN: finances, debts, tasks, calendar, dashboard widgets, news, weather, and radio – all backed by the same Firebase project and Firestore data.

### Features

- **Finance**: expenses, debts, recurring expenses, CSV export, AZN/USD with fixed rate.
- **Productivity**: daily / monthly / yearly tasks, automatic carry‑over, calendar with typed events.
- **Dashboard**: summary cards, clock, weather, news feed, radio player with equalizer.
- **Internationalization**: EN / RU / AZ / IT, localized dates and labels.
- **Theming & UX**: dark/light theme, responsive layout (mobile / tablet / desktop).
- **PWA**: installable app, offline mode via service worker, manifest and icons aligned with ORDINA MAIN.

### Tech Stack

- **Framework**: Svelte 4
- **Language**: TypeScript (strict)
- **Build tool**: Vite 5
- **Styling**: Tailwind CSS 3 + custom CSS
- **Backend**: Firebase Authentication + Firestore (same schema as ORDINA 1)
- **Testing**: Vitest, Playwright, fast‑check, visual regression and accessibility checks
- **Node**: 20.x (see `.nvmrc`)

## Getting started

### Prerequisites

- Node.js **20.x**
- npm (or another Node package manager)

### Install and run

```bash
# install dependencies
npm install

# start dev server
npm run dev

# build for production
npm run build

# preview production build
npm run preview
```

The app will use the same Firebase project and data as ORDINA MAIN, so you can switch between versions without data migration.

## Firebase configuration

By default, the app can run against the existing Firebase project. For your own project or production deployment, configure environment variables:

1. Copy `.env.example` to `.env`.
2. Put your Firebase credentials into the variables:

```bash
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

The `.env` file is not committed to version control.

## Testing

```bash
# unit + integration tests (Vitest)
npm run test

# watch mode
npm run test:watch

# end‑to‑end tests (Playwright)
npm run test:e2e
```

Additional visual, accessibility, and property‑based tests are documented in `docs/VISUAL-REGRESSION-TESTING.md` and `MIGRATION.md`.

## Project structure (high‑level)

```text
ORDINA-SVELTE/
├─ src/
│  ├─ components/        # UI components: layout, tabs, modals, widgets, tables
│  ├─ lib/
│  │  ├─ stores/         # Svelte stores (user, finance, tasks, calendar, ui)
│  │  ├─ services/       # Firebase + external APIs (weather, news, radio, export)
│  │  ├─ utils/          # Formatting, validation, performance, gestures, keyboard
│  │  └─ types/          # TypeScript models and enums
│  ├─ locales/           # i18n JSON files (EN/RU/AZ/IT)
│  ├─ styles/            # Responsive CSS, dashboard fixes
│  ├─ App.svelte         # Root authenticated/unauthenticated shell
│  └─ main.ts            # Entry point
├─ public/
│  ├─ assets/            # favicons, logos, screenshots (mirrors ORDINA MAIN)
│  ├─ manifest.webmanifest
│  └─ sw.js              # PWA service worker
├─ docs/                 # Architecture and deep‑dive technical docs
├─ tests/                # Vitest + Playwright + property‑based tests
├─ vite.config.ts        # Vite configuration
└─ svelte.config.js      # Svelte configuration
```

## Architecture & relation to ORDINA MAIN

- **High‑level architecture** is described in `ARCHITECTURE.md`.
- **Migration details** from vanilla JS to Svelte + TypeScript are in `MIGRATION.md`.
- **Component tree and responsibilities** are in `docs/COMPONENTS.md`.
- **State management and stores** are in `docs/STORES.md`.
- **Type system** is documented in `docs/TYPES.md`.

ORDINA Svelte preserves the same Firebase collections, routes, and main screens as ORDINA 1 (Dashboard, Expenses, Debts, Recurring, Tasks, Calendar), so behavior and data are aligned while the implementation is fully modernized.

## License

This project follows the same licensing model as ORDINA MAIN (MIT). See `LICENSE` in the main repository for details.
