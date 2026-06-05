import { Layer } from '../lib/types';

export const DEFAULT_LAYERS: Layer[] = [
  { id: 'cities',    label: '都市',         color: '#E53E3E', visible: true },
  { id: 'dynasties', label: '王朝・帝国',   color: '#3182CE', visible: true },
  { id: 'trade',     label: '交易路・移動', color: '#38A169', visible: true },
  { id: 'notes',     label: 'メモ',         color: '#805AD5', visible: true },
];

export const MAP_REGION_LIST = [
  { id: 'west-asia', title: '西アジア・地中海' },
  { id: 'east-asia', title: '東アジア' },
  { id: 'eurasia',   title: 'ユーラシア' },
  { id: 'world',     title: '世界全体' },
] as const;
