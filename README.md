# All Things Tyler website and directory review

Review-only directory concept using conspicuously fictional businesses. Not the live All Things Tyler website or membership system. No real business details, private member data, credentials, payments, contact forms, messaging, or external AI services.

## Development

Requires Node 24+. No dependency installation required.

```sh
npm test
npm run build
npm run preview
```

Open http://127.0.0.1:4173 locally. Vercel configuration builds the static `dist` directory. No custom domain is configured. Pages include noindex metadata and hosting headers; this is not access control.

## Demonstrated behavior

- Three category levels with multiple parents; selected-level results include directly assigned businesses and descendants without duplicate cards.
- BronzePlus before Bronze. Deterministic seeded order within each tier; explicit Refresh order changes the seed. Browsing, reload, search, and share links preserve it.
- Back retraces the chosen category path. Clear resets query, category, listing, and path while retaining the seed.
- Query URLs restore filtered results or a single fictional listing. Invalid category/listing IDs and paths are rejected.
- Deterministic intent matching through synonyms and descriptive keywords, not general AI. Try “my toilet is overflowing! help!”, “my air conditioner needs fixing”, “flowers”, or “coffee”. Every remaining normalized term must match; cards explain normalized terms.
- Semantic form controls, keyboard focus styles, skip link, live result counts, and responsive layouts.

## Data contract

`src/core.ts` defines TypeScript types and runtime validation. `fictional-import-example.json` is a complete import example. Run `node validate-import.mjs fictional-import-example.json` for validation without writing data. Parent references must exist at the preceding level. Duplicate IDs, invalid tiers, unknown business/category references, and missing or non-fictional provenance are rejected. Production data must use a separately reviewed ingestion boundary; do not embed private member information in browser assets.

## Verification and limits

Twelve rule tests pass, and build, JavaScript syntax, import validation, and local HTTP smoke checks pass. Build uses Node's TypeScript syntax stripping, not full static type checking. Local Chromium execution was unavailable. A supported cloud browser subsequently verified desktop rendering, category paths, Back/Clear, keyboard Enter search/listing activation, reload restoration, return/skip-link focus, and tier-safe seeded shuffle. Mobile viewport and screen-reader verification remain outstanding. No production readiness claim.

## Decisions before production integration

Confirm authoritative category/business/tier/keyword data, the existing application's integration target and legacy URL migration, listing fields, brand assets, shuffle trigger, keyword ranking expectations, expected results for representative queries, and permitted publishing scope. Current ordering and navigation behavior are provisional review defaults. No fourth hierarchy level, mobile app, SMS, or Facebook automation is included.

## Original-site visual reconstruction

Homepage/header/footer are reconstructed from public All Things Tyler pages inspected October 23, 2026. The original navy (#113559), cream (#faf7ef), coral (#ef3937), public logo, downtown hero photograph and original sponsor image are referenced. The embedded directory follows the existing subdomain's navy masthead, rounded category tiles, and public set of twelve broad category labels. Directory businesses, tiers, keyword eligibility, and lower-level associations remain explicitly fictional.

Public Squarespace image URLs are referenced directly, not private assets. Typography uses Georgia/Arial fallbacks rather than copying licensed IvyPresto/Degular font files. This is not a pixel-identical font reproduction or a complete site migration.

Reproduced here: homepage hero, navigation, embedded review directory, community statement, and footer presentation. About Us, Contact, Events, Become a Partner, member login, newsletter signup, legal pages, highlights and partner stories link to their original destinations. No account, payment or newsletter form is recreated. Community Corner was unavailable on inspection and is shown as unavailable, not fabricated. The original Facebook footer destination pointed to an unrelated business; this preview links to the verified official contact page instead. Original designer credit is explicitly attributed to the original site, not this new implementation.

Reference: https://www.allthingstyler.com/ and https://directory.allthingstyler.com/ . Public imagery remains dependent on the original Squarespace CDN.
