# ADR-008: Web v2.9 near-complete demo before native port

Status: Accepted
Date: 2026-07-03

## Context
Owner wants to show the friend (marketing partner candidate) a near-complete product immediately (target: tomorrow). Native v1 (ADR-007) is 4-5 weeks away post-exam. Current web v2.8 was judged by owner as visually generic with missing features.

## Decision
Upgrade the existing Next.js web app to "v2.9": implement the native v1 feature set on web — repertoire tab merge (achievement header + map/cookbook view toggle, level-up screen absorbed), dish edit mode (DishOverride layer), custom dish creation — plus a full UI overhaul driven by design research references. Notifications stay native-only (shown via blueprint in the demo). Tabs become 3 (食材/ホーム/レパートリー) matching the native design.

## Rationale
- Friend demo needs the experience, not the binary; mobile browser suffices
- Nothing is throwaway: DishOverride/CustomDish TS logic ports directly to RN; the polished UI becomes the native reference design (replaces the planned 7/5-6 concept-design step)
- De-risks native implementation by validating the new IA (3 tabs, cookbook) on a working app first

## Consequences
- Good: demo-ready product days earlier; native Wave 2-4 specs get a living reference implementation
- Risk: one night of heavy AI implementation before a human demo — quality-gate + owner morning review are mandatory before showing anyone
- blueprint-native-v1.md stays canonical for native; web v2.9 features must not drift from it
