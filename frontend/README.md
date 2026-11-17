# AgriCycle Frontend

AgriCycle is a React and Vite prototype for a crop-residue marketplace connecting farmers and buyers in Western Maharashtra.

## Run locally

```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite (by default, `http://localhost:5173`).

## Demo accounts

Sign in with any email or phone number and a password of at least six characters. Choose either the Farmer or Buyer role. Registration is also simulated and does not create a production account.

The demo profile is stored in browser session storage. Selecting **Remember me** stores it in local storage instead. Signing out clears the saved demo profile.

## Checks

```bash
npm run build
npm run lint
npm test
```

## Demo limitations

This frontend is not connected to a production backend. Listings, requests, pickups, analytics, and AI suggestions use illustrative demo behavior and data. Actions do not create real transactions, send email, or contact farmers. Do not enter real passwords or sensitive personal information.

The **Demo Terms** and **Demo Privacy Notice** links on registration describe these prototype limitations; they are not production legal documents.
