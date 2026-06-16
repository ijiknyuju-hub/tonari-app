# ADR-003: Proximity Model v3 — Body-feel manual scoring

Status: Accepted
Date: 2026-06-15

## Context
The original 3-variable equal-weight model (taste × ingredient × method) treated all single-variable changes as equivalent difficulty. In practice, "soy sauce → curry roux" and "chicken breast → chicken thigh" feel completely different to cook. The model couldn't capture this asymmetry.

## Decision
Replace with body-feel-based manual proximity scoring (0.1-1.0). The 3 variables remain as a reference framework, but final scores factor in additional dimensions: added steps, ingredient availability, cleanup cost, and required equipment. Scores map to tabs: easy (0.8-1.0), stretch (0.5-0.8), full (0.2-0.5).

## Rationale
- User-perceived difficulty is asymmetric; equal-weight averaging distorts reality
- Manual scoring + friend testing feedback produces more trustworthy results than formula
- Tab-based UI naturally segments the score range

## Alternatives Considered
- Weighted 3-variable formula: rejected — weight calibration is its own unsolved problem
- Pure AI scoring: rejected — no ground truth to validate against at this scale

## Consequences
- Good: Score accuracy matches user intuition
- Risk: Manual scoring doesn't scale past ~100 pairs without tooling support
