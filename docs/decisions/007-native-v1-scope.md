# ADR-007: Native v1 scope (Expo port)

Status: Accepted
Date: 2026-07-03

## Context
Tonari promoted to main dev project; exit is native iOS+Android via Expo/RN (see main repo `docs/specs/tonari-reboot-plan-2026-07.md` and `docs/decisions/2026-07-03-tonari-native-expo.md`). Web v2.8 (incl. spec-021 H5 continuity features) is the porting baseline.

## Decision
Native v1 = web v2.8 feature set restructured around the "personal cookbook" concept (2026-07-03 owner design session, rev 2):
- **3 tabs** (was 4): 食材 / ホーム / レパートリー. The レパートリー tab absorbs island map + level-up: achievement header (dish count, next milestone) + map view ⇄ cookbook list view toggle. Standalone level-up screen abolished (celebration moves to post-record modal)
- **Personal cookbook**: dish cards are user-editable (ingredients, steps, memo) via an edit mode on the dish detail screen — stored as a device-local override layer, canonical data immutable. **User-created custom dishes included in v1** (name/ingredients/steps form, placed on island map)
- **2 local notifications** (was 1): morning "今日のとなりごはん" (deep-links to today's pick) + evening "作りましたか？" with an action button that records 作った directly from the notification (fallback: tap opens recording modal at step 2). Evening one fires only on days the user viewed/saved a card. Rationale: owner's thesis — the app lives or dies by how often 作った gets pressed
- Onboarding base-dish selector: category-header vertical scroll grid (15 dishes)
- Storage device-only (AsyncStorage, no DB/login/cloud). No dish photos (text + emoji + design-token visual language). Dish data WILL be expanded before v1 launch (base 10 → 15, relations 52 → ~120): owner judged 62 dishes too few for preference coverage and growth headroom, and 20 bases too many. Existing 10 bases are kept (preserves all 52 relations); 5 additions fix the washoku-everyday gap: 生姜焼き・ハンバーグ・豚汁・うどん・野菜炒め.

## Rationale
- Daily notification is the only feature that materially attacks H5 (no reason to return) and is impossible on the web prototype; local notifications need no server
- Device-only storage keeps server cost ¥0 and launch unblocked; export/migration deferred to v1.1
- Photos would delay launch by weeks (62+ quality judgments); design consistency carries the quality line instead
- Data expansion directly serves the value core (レパートリーを育てる needs headroom) — pipeline: AI generates+pre-scores candidates, owner batch-reviews (ADR-003 body-feel scoring preserved as owner spot-judgment)

## Consequences
- Onboarding base-dish selector (2×5 grid) must be redesigned for 15 dishes
- Owner review time for ~180 candidates is the main human cost (est. 3–4h in batches)
- Monetization unchanged: v1 fully free, no IAP scaffold (ADR-006 gate: weekly revisit ≥2 before subscription design)
