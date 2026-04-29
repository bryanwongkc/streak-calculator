# Mahjong Tracker

A Vite + React Mahjong game tracker for shared scoring, dashboard stats, share-link joining, and bundled rule sheets. The UI keeps a mobile-first grey/white Tailwind style with compact controls for game-night use.

## Local Setup

```bash
npm install
npm run dev
npm run build
```

## Firebase Setup

Install or create a Firebase project with Firestore and Anonymous Authentication enabled. Copy `.env.example` to `.env.local` and fill in the Vite values from your Firebase web app:

```bash
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

The app signs users in anonymously by default. If the env vars are missing, the app shows a setup message and offers a local demo game. The local demo does not write production demo data to Firestore.

## Firebase Rules

Rules are included but are not deployed automatically:

```bash
firebase deploy --only firestore:rules
```

The included rules are permissive MVP rules for anonymous-authenticated users. Production should use stronger membership checks or a backend join function.

## Data Model

Shared game state is stored in one Firestore document:

```text
games/{gameId}
  name
  shareToken
  createdAt / updatedAt / createdBy
  players[]
  lastWinner
  history[]
```

Round history now stores `beforeScores`, `afterScores`, `deltasByPlayer`, `winner`, `loserIds`, and `type` so dashboard stats can derive better per-round values. Older history is handled with fallback snapshot logic.

## Sharing

The share link format is:

```text
https://current-domain/?game={gameId}&token={shareToken}
```

On load, the app validates the token against the Firestore game document, opens the game, and stores it in `streak-calculator-games` localStorage so it appears in the switcher.

The Share action also renders a QR code for the same link. The initial join screen accepts pasted links/codes and can scan QR codes with the camera, with QR image upload as a fallback.

## Rule Sheets

Bundled rule sheets live in:

```text
public/rules/
```

The Rules tab displays those images as a mobile slideshow with a zoomable full-screen viewer.
