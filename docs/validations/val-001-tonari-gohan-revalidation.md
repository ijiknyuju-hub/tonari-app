# Validation 001: Tonari Gohan Re-validation

Date: 2026-06-15
Verdict: Conditional Go
Score: 14/20

## Lean Canvas

| Block | Content |
|-------|---------|
| Problem | Repertoire stagnation: users cook the same 3-5 dishes. YouTube/Kurashiru/GPT help discover new recipes but they don't stick (no record, too difficult) |
| Alternative | YouTube, Kurashiru, ChatGPT for recipe ideas. But suggestions are too distant, no habit forms, no tracking |
| Solution | Recommend nearby dishes (low psychological barrier), show diffs (what to change), track "made" records for growth visualization |
| Unique Value | Nearness x Diff x Record - the combination is completely unexplored in the market |
| Revenue | Core free for validation. Future: subscription or one-time purchase. Possibly ads. AI meeting memo suggested 400 yen/month at 2-5% conversion |
| Cost | AI coding ~20,000 yen/month, Vercel free tier (0 yen infra), ad testing budget (few thousand yen), photo sourcing TBD, app store fee (12,000 yen/year future) |

## Competitive Landscape

### Direct Competitors (Meal Planning / AI)

| App | Pricing | Users | Strength | Weakness vs Tonari |
|-----|---------|-------|----------|-------------------|
| me:new | Free | 4.2/5 (16K reviews) | AI meal plan + shopping list | Limited variety complaints. No gradual expansion |
| pecco | Free | 500K DL | Fridge-based AI suggestions | Ingredient-first, no skill-up concept |
| Oishii Kenko | Freemium | — | Disease-specific nutrition | Medical focus, no repertoire growth path |
| Asken | Freemium | — | Nutrition analysis | Post-hoc analysis only, no new dish motivation |
| Mirai Kondate (Ajinomoto) | — | — | Corporate AI meals | **Shut down 2026-04**. Proves simple meal AI isn't enough |

### Indirect Competitors (Recipe Search / Video)

| App | Pricing | Users | Weakness vs Tonari |
|-----|---------|-------|--------------------|
| Kurashiru | Freemium | 44M DL | Passive search. No "next step for you" |
| Delish Kitchen | Freemium | 10M SNS followers | Generic, no personalization |
| Cookpad | Freemium | 40M MAU | Too many choices. No rut-escape path |
| ChatGPT | Free/$20 | — | Requires prompt each time. No records. No habit |

### Market Gap

No existing app combines: nearby-dish recommendation + diff visualization + made-tracking for growth. All competitors are either "search" or "meal plan generation". The Ajinomoto shutdown proves simple meal planning isn't differentiating enough.

## Risk Assessment

| Axis | Score | Reason |
|------|-------|--------|
| Need Strength | 4/5 | "Cooking rut" is widely recognized. me:new/pecco weakness reviews confirm. But not life-critical pain |
| Differentiation | 4/5 | Nearness x Diff x Record combination is completely unexplored. ChatGPT is theoretical substitute |
| Feasibility | 4/5 | Phase 0 MVP live. Goals 012-017 implemented. Simple tech stack. But dish data + photos require manual labor |
| Revenue Potential | 2/5 | Cooking app monetization historically weak. Cookpad premium <10% at peak. "Rut" may not be pay-worthy. Near-zero ops cost is saving grace |

## Verdict

**Conditional Go (14/20)**

The idea is strong: unique market position, real problem, proven feasibility. The critical risk is monetization — cooking apps struggle with willingness to pay, and ChatGPT is a free alternative.

## Next Steps

1. Complete Phase 0 MVP friend testing to validate core experience reaction
2. Measure `click_want_to_make` rate as quantitative proof of need depth
3. Explore lock-in based monetization: accumulated history/growth data is hard to migrate
4. Use ads for initial validation; defer subscription until retention is confirmed
5. Run `/spec-alignment` to solidify v2.8 implementation plan

## Key Insight from This Validation

The biggest shift from v2.5 era: the value isn't in "AI meal suggestions" (Ajinomoto proved that's not enough) — it's in the **combination of nearness + diff + growth tracking**. This trinity is the moat. Any implementation plan should protect all three pillars, not sacrifice one for speed.
