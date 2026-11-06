# Google ratings readiness

## Current implementation

The demo is a static Node-built site with fourteen conspicuously fictional listings. Its data contract requires fictional provenance. It has no verified real business identities, Google profile links, Place IDs, Google/API credentials, ratings source, ratings backend, caching policy or billing integration. No stars, ratings, review counts or Google badges should be attached to these fictional listings.

The original website and its existing member/billing services remain outside this demo. Do not publish a private member export in browser assets to bootstrap ratings.

## Gates before implementation

1. Confirm that the intended Google data use is licensed for a directory service. Separate research has flagged a directory/listings restriction in Google Maps Platform terms. Attribution alone does not establish permission. Do not build or activate a Places ratings feed until this use case is cleared.
2. Establish the approved public directory ingestion boundary. Verify each real business and any public Google profile link against authoritative identity information; resolve ambiguous branches/locations instead of guessing.
3. If appropriately licensed, agree on the exact fields, attribution, public legal disclosures, freshness and permitted storage/retention. Decide how unavailable, removed or mismatched profiles are omitted gracefully.
4. Obtain explicit authorization for any billing, credentials, persistent access, external data transmission and publication. Keep credentials server-side and out of the static bundle.

Pending licensing clarification, verified outbound Google review/profile links for real businesses are a lower-complexity option to assess. This is a link proposal, not permission to scrape or reproduce ratings. No such links have been invented or added to fictional fixtures.

## This revision

No Google integration was activated and no Google ratings were fabricated. Search now explains that verified ratings/reviews/prices are absent and will not silently pretend to satisfy or rank by those requirements.
