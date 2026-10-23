# All Things Tyler directory demonstration

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

Ten rule tests pass, and build, JavaScript syntax, import validation, and local HTTP smoke checks pass. Build uses Node's TypeScript syntax stripping, not full static type checking. Browser execution was unavailable in the preparation environment, so visual, mobile, screen-reader, and keyboard behavior still require review. No production readiness claim.

## Decisions before production integration

Confirm authoritative category/business/tier/keyword data, the existing application's integration target and legacy URL migration, listing fields, brand assets, shuffle trigger, keyword ranking expectations, expected results for representative queries, and permitted publishing scope. Current ordering and navigation behavior are provisional review defaults. No fourth hierarchy level, mobile app, SMS, or Facebook automation is included.
