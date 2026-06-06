import { MapRegion } from './types';
import { MAP_SVG_STRINGS } from './mapSvgStrings';

export function getMapSvgPath(regionId: string): string {
  return MAP_SVG_STRINGS[regionId] ?? '';
}

export const MAP_REGION_DEFS: Omit<MapRegion, 'svgAsset'>[] = [
  { id: 'west-asia', title: '西アジア・地中海', viewBox: '0 0 1200 800' },
  { id: 'east-asia', title: '東アジア',         viewBox: '0 0 1200 800' },
  { id: 'eurasia',   title: 'ユーラシア',        viewBox: '0 0 1600 900' },
  { id: 'world',     title: '世界全体',          viewBox: '0 0 1800 900' },
];
