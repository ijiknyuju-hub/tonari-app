# ADR-004: Abolish arrange/nearby dish distinction

Status: Accepted
Date: 2026-06-15

## Context
The data model had two concepts: "arrange" (minor variations like salt karaage) and "nearby dish" (different dishes like yurinchi). The boundary was ambiguous, the user didn't care about the distinction, and maintaining two entity types added complexity.

## Decision
Unify everything under "nearby dish" with proximity score. Standard variations (salt karaage, oroshi-ponzu karaage) live inside the parent dish card. Users can promote a variation to an independent node if desired.

## Rationale
- The arrange vs nearby boundary was subjective and inconsistent
- Users don't think in these categories — they think "easy change" vs "bigger project"
- Difficulty tabs (easy/stretch/full) already serve the categorization purpose
- Simpler data model = fewer bugs, easier content creation

## Alternatives Considered
- Keep both with clear rules: rejected — every edge case produced a new rule
- Remove variations entirely: rejected — "salt karaage" inside parent card is useful

## Consequences
- Good: One entity type, one score dimension, one UI pattern
- Good: Parent card variations add depth without data model complexity
- Risk: Promoted variations need careful UI to avoid clutter
