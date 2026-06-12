# Design tokens — shared across all v2.8 screens

Derived from owner's concept design images (2026-06-12). Single source of truth for
colors, radii, spacing feel. Implement once in `app/globals.css` (CSS variables +
component classes) and reuse everywhere. No new styling libraries.

## Colors

| Token | Value | Usage |
|---|---|---|
| `--tn-bg` | `#FAF6EF` | App background (warm cream) |
| `--tn-surface` | `#FFFFFF` | Cards, sheets |
| `--tn-surface-soft` | `#F7F0E6` | Inset blocks (detail rows, suggestion strip) |
| `--tn-text` | `#2B2520` | Primary text (warm near-black) |
| `--tn-text-sub` | `#8A8178` | Secondary text |
| `--tn-accent` | `#E8702A` | Primary accent (orange): active tab, primary button border/text, badges |
| `--tn-accent-soft` | `#FDEBDD` | Accent-tinted backgrounds (selected chip bg, badge bg) |
| `--tn-tag-easy-bg` | `#E5F2DC` / text `#4E7C36` | かんたん tag |
| `--tn-tag-stretch-bg` | `#FBE9C8` / text `#9A6B1F` | 少し広げる / ふつう tag |
| `--tn-tag-full-bg` | `#FDE0D5` / text `#B14A22` | しっかり作る tag |
| `--tn-border` | `#EDE5DA` | Card borders, dividers |

## Shape & elevation

- Card radius: `1.25rem` (20px); chips/pills: full round
- Shadows: very soft (`0 6px 18px rgba(43,37,32,0.06)`); no hard shadows
- Cards have 1px `--tn-border` border + white surface

## Buttons

- Primary action on this design language is an **outlined pill**: white bg, accent border,
  accent text (e.g. 詳しく見る, おすすめ条件)
- Selected state: accent border + `--tn-accent-soft` bg (e.g. mode tab かんたん)
- Keep min tap height >= 44px

## Typography

- Headings: black weight, warm near-black
- Body: 14-16px, relaxed leading
- Detail row labels (変わるところ etc.): small, `--tn-text-sub`, with small icon

## Bottom nav

- Fixed, white surface, top hairline border
- 3 items: icon + label; active = accent color, inactive = `--tn-text-sub`

## Images

- Dish photos: rounded corners (1rem), object-cover
- MVP placeholder: `--tn-surface-soft` block with dish emoji/initial until real photos exist
