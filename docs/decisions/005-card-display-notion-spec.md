# ADR-005: Card display reverted to Notion spec

Status: Accepted
Date: 2026-06-15

## Context
The v2.8 implementation drifted toward a diff-based card (変わるところ/変わらないところ). The original Notion おすすめ画面仕様書 defined a simpler, more compelling format: photo + difficulty + name + 2-line intro + new ingredients + bookmark.

## Decision
Revert card display to the Notion spec. Show: photo, difficulty label, dish name, 2-line introduction (line 1: flavor change, line 2: eating occasion or ease), new ingredients needed, bookmark button. Do NOT show: step count, diff breakdown, add-to-list text.

## Rationale
- The Notion spec was designed around "what makes someone want to cook this"
- Diff display answers "what changes" but not "why I'd want to"
- 2-line intro rules vary by tab, creating appropriate messaging per difficulty level

## Consequences
- Good: Cards feel like recommendations, not technical comparisons
- Risk: Intro text quality is critical — bad intros undermine the entire card
