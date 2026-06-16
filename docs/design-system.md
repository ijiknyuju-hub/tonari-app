# Tonari Gohan Design System

## Brand

Warm, inviting food app. Earthy tones with orange accent.
Think: home cooking, not restaurant. Friendly, not corporate.

## Colors

| Token | Hex | Use |
|-------|-----|-----|
| --tn-bg | #faf6ef | Page background (cream) |
| --tn-surface | #ffffff | Card background |
| --tn-surface-soft | #f7f0e6 | Muted surface (input bg, section bg) |
| --tn-text | #2b2520 | Primary text (dark brown) |
| --tn-text-sub | #8a8178 | Secondary text (warm gray) |
| --tn-accent | #e8702a | Primary accent (orange) |
| --tn-accent-soft | #fdebdd | Accent background (pale orange) |
| --tn-border | #ede5da | Card borders, dividers |

### Difficulty Labels

| Level | Background | Text | Style |
|-------|-----------|------|-------|
| かんたん (easy) | #e5f2dc | #4e7c36 | Pill with colored bg |
| 少し広げる (stretch) | #fbe9c8 | #9a6b1f | Pill with colored bg |
| しっかり作る (full) | #fde0d5 | #b14a22 | Pill with colored bg |

## Typography

- Body: system-ui, sans-serif
- Dish name (featured): 22px, weight 800
- Dish name (compact): 14px, weight 700
- Body text: 13px, weight 400
- Sub text: 12px, weight 400, color --tn-text-sub
- Label/tag: 12px, weight 800

## Spacing

- Page padding: 20px horizontal
- Card padding: 16px
- Card gap: 12px
- Section gap: 24px
- Card border-radius: 20px (1.25rem)
- Button border-radius: 16px (1rem)
- Tag border-radius: 9999px (pill)

## Shadows

- Card: 0 6px 18px rgba(43, 37, 32, 0.06)
- CTA button: 0 16px 34px rgba(232, 97, 26, 0.28)

## Components

### Card (tn-card)
- White background, 1px --tn-border, 20px radius, soft shadow
- No gradient, no heavy shadow

### CTA Button (primary)
- Background: --tn-accent
- Color: white
- Min height: 60px, radius 16px
- Orange glow shadow

### Pill Button (secondary)
- Border: 1px --tn-accent
- Background: white (default) or --tn-accent-soft (selected)
- Color: --tn-accent
- Radius: 9999px

### Tag (difficulty label)
- Pill shape, 28px height, 12px horizontal padding
- Background and text color from difficulty table above

### Bookmark Icon
- Outline style (not filled) when inactive
- Filled when active
- 24x24px, placed on card top-right

## Anti-Patterns (DO NOT)

- No gradients on cards
- No drop-shadow heavier than the defined soft shadow
- No border-radius > 20px except pills (9999px)
- No pure black text — use --tn-text (#2b2520)
- No pure white background — use --tn-bg (#faf6ef) for page
- No blue or purple — this is an orange/earth-tone app
- No generic placeholder images — use emoji on colored bg
- No complex animations — simple opacity transitions only
