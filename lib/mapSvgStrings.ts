// Placeholder SVG maps — replace with real Natural Earth SVGs later.
// Inline strings are required because React Native's require() returns an
// asset number, not an SVG string, so SvgXml cannot use require() directly.

export const MAP_SVG_STRINGS: Record<string, string> = {
  'west-asia': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"><rect width="1200" height="800" fill="#EBF8FF"/><rect x="20" y="20" width="1160" height="760" fill="none" stroke="#BEE3F8" stroke-width="3"/><text x="600" y="380" text-anchor="middle" dominant-baseline="middle" font-size="52" fill="#2B6CB0" font-family="sans-serif">西アジア・地中海</text><text x="600" y="450" text-anchor="middle" dominant-baseline="middle" font-size="28" fill="#4A90D9" font-family="sans-serif">（地図準備中）</text></svg>`,

  'east-asia': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"><rect width="1200" height="800" fill="#F0FFF4"/><rect x="20" y="20" width="1160" height="760" fill="none" stroke="#9AE6B4" stroke-width="3"/><text x="600" y="380" text-anchor="middle" dominant-baseline="middle" font-size="52" fill="#276749" font-family="sans-serif">東アジア</text><text x="600" y="450" text-anchor="middle" dominant-baseline="middle" font-size="28" fill="#48BB78" font-family="sans-serif">（地図準備中）</text></svg>`,

  'eurasia': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900"><rect width="1600" height="900" fill="#FFFFF0"/><rect x="20" y="20" width="1560" height="860" fill="none" stroke="#FAF089" stroke-width="3"/><text x="800" y="430" text-anchor="middle" dominant-baseline="middle" font-size="52" fill="#744210" font-family="sans-serif">ユーラシア</text><text x="800" y="500" text-anchor="middle" dominant-baseline="middle" font-size="28" fill="#D69E2E" font-family="sans-serif">（地図準備中）</text></svg>`,

  'world': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1800 900"><rect width="1800" height="900" fill="#FAF5FF"/><rect x="20" y="20" width="1760" height="860" fill="none" stroke="#D6BCFA" stroke-width="3"/><text x="900" y="430" text-anchor="middle" dominant-baseline="middle" font-size="52" fill="#553C9A" font-family="sans-serif">世界全体</text><text x="900" y="500" text-anchor="middle" dominant-baseline="middle" font-size="28" fill="#805AD5" font-family="sans-serif">（地図準備中）</text></svg>`,
};
