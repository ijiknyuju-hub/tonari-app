import { Layer, MapRegion } from '../lib/types';

export const DEFAULT_LAYERS: Layer[] = [
  { id: 'cities',    label: '都市',         color: '#E53E3E', visible: true },
  { id: 'dynasties', label: '王朝・帝国',   color: '#3182CE', visible: true },
  { id: 'trade',     label: '交易路・移動', color: '#38A169', visible: true },
  { id: 'notes',     label: 'メモ',         color: '#805AD5', visible: true },
];

export const MAP_REGIONS: MapRegion[] = [
  {
    id: 'west-asia',
    title: '西アジア・地中海',
    svgAsset: require('../assets/maps/west-asia.svg'),
    viewBox: '0 0 1200 800',
  },
  {
    id: 'east-asia',
    title: '東アジア',
    svgAsset: require('../assets/maps/east-asia.svg'),
    viewBox: '0 0 1200 800',
  },
  {
    id: 'eurasia',
    title: 'ユーラシア',
    svgAsset: require('../assets/maps/eurasia.svg'),
    viewBox: '0 0 1600 900',
  },
  {
    id: 'world',
    title: '世界全体',
    svgAsset: require('../assets/maps/world.svg'),
    viewBox: '0 0 1800 900',
  },
];
