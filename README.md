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

- Up to four category levels with multiple parents, including a clearly fictional specialty example; selected-level results include directly assigned businesses and descendants without duplicate cards.
- BronzePlus before Bronze. Deterministic seeded order within each tier; every new logical results visit, submitted search (including repeat queries), category selection, category Back, Start Over, and Refresh order generates a new seed. Merely typing or rerendering does not. Reload, browser history, listing open/return, and copied URLs restore the existing seed. This is the preview interpretation of “shuffle each time,” not a continuous animation.
- Back retraces the chosen category path. Start Over resets query, category, listing, and path and generates a new seed.
- Query URLs restore filtered results or a single fictional listing. Invalid category/listing IDs and paths are rejected.
- Deterministic intent matching through synonyms and descriptive keywords, not general AI. Try “my toilet is overflowing! help!”, “my air conditioner needs fixing”, “flowers”, or “coffee”. Every remaining normalized term must match; cards explain normalized terms.
- Semantic form controls, keyboard focus styles, skip link, live result counts, and responsive layouts.

## Data contract

`src/core.ts` defines TypeScript types and runtime validation. `fictional-import-example.json` is a complete import example. Run `node validate-import.mjs fictional-import-example.json` for validation without writing data. Parent references must exist at the preceding level. Duplicate IDs, invalid tiers, unknown business/category references, and missing or non-fictional provenance are rejected. Production data must use a separately reviewed ingestion boundary; do not embed private member information in browser assets.

## Original verification and limits

At the original review, twenty tests passed (18 core behavior tests and 2 static accessibility markup/wiring assertions), and build, JavaScript syntax, import validation, and local HTTP smoke checks pass. Build uses Node's TypeScript syntax stripping, not full static type checking. Local Chromium execution was unavailable. A supported cloud browser subsequently verified desktop rendering, category paths, Back/Clear, keyboard Enter search/listing activation, reload restoration, return/skip-link focus, and tier-safe seeded shuffle. Mobile viewport and screen-reader verification remain outstanding. No production readiness claim.

## Decisions before production integration

Confirm authoritative category/business/tier/keyword data, the existing application's integration target and legacy URL migration, listing fields, brand assets, shuffle trigger, keyword ranking expectations, expected results for representative queries, and permitted publishing scope. Current ordering and navigation behavior are provisional review defaults. An optional fourth hierarchy level is supported by synthetic tests and a fictional display example; approved real taxonomy, mobile app, SMS, and Facebook automation are not included.

## Original-site visual reconstruction

Homepage/header/footer are reconstructed from public All Things Tyler pages inspected October 23, 2026. The original navy (#113559), cream (#faf7ef), coral (#ef3937), public logo, downtown hero photograph and original sponsor image are referenced. The embedded directory follows the existing subdomain's navy masthead, rounded category tiles, and public set of twelve broad category labels. Directory businesses, tiers, keyword eligibility, and lower-level associations remain explicitly fictional.

Public Squarespace image URLs are referenced directly, not private assets. Typography uses Georgia/Arial fallbacks rather than copying licensed IvyPresto/Degular font files. This is not a pixel-identical font reproduction or a complete site migration.

Reproduced here: homepage hero, navigation, embedded review directory, community statement, and footer presentation. About Us, Contact, Events, Become a Partner, member login, newsletter signup, legal pages, highlights and partner stories link to their original destinations. No account, payment or newsletter form is recreated. Community Corner was unavailable on inspection and is shown as unavailable, not fabricated. The original Facebook footer destination pointed to an unrelated business; this preview links to the verified official contact page instead. Original designer credit is explicitly attributed to the original site, not this new implementation.

Reference: https://www.allthingstyler.com/ and https://directory.allthingstyler.com/ . Public imagery remains dependent on the original Squarespace CDN.

## Original-note core behavior update

Assigned descriptive keywords are searchable for both Bronze and BronzePlus. Both tiers remain discoverable by ordinary name, description and associated category/ancestor terms. Explicitly assigned keywords unlock `emergency services`, `color specialist`, and `curly hair specialist` concepts; accidental mention in a description does not confer eligibility. Three new fictional Plus fixtures and a Bronze salon comparison exercise this boundary. There is no claim of real emergency availability.

Normalization handles case, punctuation, polite filler (including please), colour/color and colorist variants, curly-hair phrases, and the overflowing-toilet intent. The dictionary is bounded, not general AI; unknown requests can still return no matches. No typo correction, semantic model, paid API, location inference, or live availability check is implied.

Ordering changes on explicit logical result actions as listed above, with BronzePlus always ahead of Bronze. A new seed is persisted to the URL so incidental renders, typing, history restoration, and shared links do not rearrange a viewed result. Random permutations can coincidentally repeat, especially in small tiers.

Negated requests retain a blocking token rather than silently recommending the negated service. This conservative handling is not full grammatical negation understanding. The specific repair idiom “not working” is normalized to repair.

Keyboard QA found and corrected lost focus after category rerender: category selection, Back and Start Over now focus the category path. Repeated listing action links include business names in their accessible labels. Narrow-width and actual screen-reader testing remain unverified; responsive CSS inspection is not device testing.

## November 3 search/cascade update

The current review behavior uses step-by-step filters with relevant businesses
at each step and keyword search across all businesses. This change removes the prior Plus-only keyword restriction, retains
Plus-before-Bronze display ordering, and supports an optional fourth category level.
The existing browser navigation already follows direct children and shows businesses
at the selected node and every descendant. A broad-only listing is not shown as a
specialist without an explicit association. No real category relationships were added.

Common equipment-repair phrases now include “isn't working,” “does not work,” and
“stopped working.” The search help explains its limited dictionary and both-tier
coverage. Unknown terms still require a match and can yield no results. It is not
general semantic/AI search, typo correction, live availability or location inference.

Search remains scoped by a selected category; starting over or using the existing
example-query buttons clears the category. Whether every submitted
search should ignore the selected category remains a product question. The interpretation
of “smart search” also needs examples of expected queries/results before any broader
semantic feature, external service, or member-data transmission is introduced.

21 core tests and 2 static accessibility tests pass, build passes, fictional import
validates, generated JavaScript passes syntax checks, and strict TypeScript checking
passes. Hosted browser/device QA is tracked separately. The existing noindex and fictional-data boundary are unchanged.

## Sarah feedback update — November 6, 2026

Removed membership labels from cards, listing details and ordering copy, plus keyword/matched-term diagnostics. Tier data, tier precedence, all-tier keyword search and four-level cascading navigation remain intact.

Added conspicuously fictional pet-sitting and logo-apparel fixtures. Query-only phrase normalization supports Sarah's three exact examples (overflowing toilet, sitting a dog while out of town, logo shirts ASAP). Timing is not treated as verified availability; search displays an explicit warning. Unknown constraints and missing directory entries still produce no matches. This is bounded deterministic matching, not a general conversational AI system.

Verification: 27 unit/static tests, build, generated JavaScript syntax and import-example validation pass. Chromium browser execution was attempted but failed at launch because the environment disallowed its socket. No mobile or screen-reader pass is claimed from these checks.

Google ratings remain absent. Real business identity/Place IDs and an authorized Google Places integration are prerequisites; fictional businesses must never receive invented Google ratings. The official Places policy requires appropriate Google attribution for display without a map, public Terms/Privacy disclosures and compliance with content storage restrictions (Place IDs have separate exceptions). Implementation must fetch permitted fields under the applicable billing/terms and gracefully omit unavailable ratings. No credentials, billing services or legal changes were created in this update. Reference checked November 6, 2026: https://developers.google.com/maps/documentation/places/web-service/policies .

## Local search revision — November 6, 2026

This revision is prepared locally, not published. It retains fictional data, private-data isolation, tier precedence and seeded ordering. There is still no live AI model or external search service.

- Generic conversational framing and plural normalization work across service/business vocabulary, rather than requiring a specific whole sentence. Explicit `or` alternatives form a union; ordinary `and` remains a strict match.
- Misspellings and adjacent-letter swaps produce optional corrections derived from this dataset's names, categories, assigned keywords and applicable service aliases. Corrections are shown only if the revised query actually matches an existing listing. Ambiguous corrections and unknown substantive requirements are not silently guessed or discarded.
- Category-conflict guidance can search all categories while preserving the query. Other refinements preserve the selected category unless the button explicitly says it will search all categories.
- Vague questions ask for a service instead of returning everything. Exclusions are conservatively held for rewording. Timing queries show service candidates with an explicit unverified-hours/availability warning. Price/rating requests are not inferred; an optional button removes those requirements only when the user chooses it.
- Negative description disclaimers no longer count as evidence that a business provides the named service. Cards still omit membership labels and keyword diagnostics.

Verification: all 42 unit/static/DOM-fixture tests pass, including the 27 earlier regressions. Strict TypeScript checking of all source files, build, generated JavaScript syntax, import-example validation, whitespace checks and local HTTP checks for all six page/assets pass. The DOM fixture tests event/state/history wiring, not actual rendering. The cloud browser could not reach the local preview server, so rendered desktop/mobile and actual screen-reader QA for this revision remain unverified. No new deployment, billing, credentials or member-data import was performed.

Google ratings readiness and licensing gates are documented in `GOOGLE_RATINGS_READINESS.md`.
