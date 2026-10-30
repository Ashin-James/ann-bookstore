# Ann — Premium Author Bookstore Demo

A responsive frontend demo inspired by the supplied “Ann's Bookstore – New Direction” PDF. It includes an editorial homepage, sample book catalogue and detail pages, format selection, a local cart, wishlist, sample chapter, author page, and a clearly labelled demo checkout. No backend, database, account authentication, mailing-list service, or real payment provider is connected.

## Requirements
- Node.js 20.9+ recommended
- npm

## Run locally
```bash
npm install
npm run dev
```
Open http://localhost:3000.

## Build
```bash
npm run build
npm start
```

## Content and covers
- Edit `data/books.ts` to change sample titles, descriptions, formats, and prices.
- Book covers are generated using CSS in `app/globals.css`, so the demo works without external image assets. Replace the `Cover` component in `components/book-card.tsx` with approved cover images when Ann supplies them.
- Replace the sample author text and original demo chapter with Ann-approved copy.
- Reviews, quotes, delivery amounts, and product details are placeholders and must not be represented as real customer data or confirmed store policies.

## Demo behaviour
- Cart and wishlist use browser localStorage. This is non-sensitive demo state only.
- Checkout calculates illustrative shipping and creates a temporary sessionStorage confirmation. It does not create a real order or charge a payment.
- No payment details are requested. Do not enter sensitive personal information into the demo.
- The newsletter form only displays a demo message; it does not subscribe anyone.
- There is no production authentication or order persistence.

## Deploy a preview
1. Push the project to a private or public Git repository as appropriate.
2. Import the repository into Vercel.
3. Use the default Next.js build settings.
4. Deploy a preview and share it with the client for design feedback.

## Before production
Use a real commerce platform or build server-side commerce infrastructure with trusted price validation, order persistence, payment-provider integration, verified webhooks, appropriate privacy controls, monitoring, and security testing. Do not treat this frontend demo as a production checkout.

redeploy
