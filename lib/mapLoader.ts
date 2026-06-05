import { MapRegion } from './types';

const SVG_MAP: Record<string, string> = {
  'west-asia': require('../assets/maps/west-asia.svg'),
  'east-asia': require('../assets/maps/east-asia.svg'),
  'eurasia':   require('../assets/maps/eurasia.svg'),
  'world':     require('../assets/maps/world.svg'),
};

export function getMapSvgPath(regionId: string): string {
  return SVG_MAP[regionId] ?? '';
}

export const MAP_REGION_DEFS: Omit<MapRegion, 'svgAsset'>[] = [
  { id: 'west-asia', title: '西アジア・地中海', viewBox: '0 0 1200 800' },
  { id: 'east-asia', title: '東アジア',         viewBox: '0 0 1200 800' },
  { id: 'eurasia',   title: 'ユーラシア',        viewBox: '0 0 1600 900' },
  { id: 'world',     title: '世界全体',          viewBox: '0 0 1800 900' },
];
