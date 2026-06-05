// ─── Layer types ────────────────────────────────────────────────────────────

export type LayerId = 'cities' | 'dynasties' | 'trade' | 'notes';

export interface Layer {
  id: LayerId;
  label: string;
  color: string;
  visible: boolean;
}

// ─── Drawing elements ───────────────────────────────────────────────────────

export type DrawingToolType = 'pen' | 'highlighter' | 'arrow' | 'label' | 'eraser';

export interface Point {
  x: number;
  y: number;
}

export interface StrokeElement {
  type: 'stroke';
  id: string;
  layerId: LayerId;
  tool: 'pen' | 'highlighter';
  points: Point[];
  color: string;
  width: number;
  opacity: number;
}

export interface LabelElement {
  type: 'label';
  id: string;
  layerId: LayerId;
  text: string;
  position: Point;
  color: string;
  fontSize: number;
}

export interface ArrowElement {
  type: 'arrow';
  id: string;
  layerId: LayerId;
  from: Point;
  to: Point;
  color: string;
  label?: string;
}

export type DrawingElement = StrokeElement | LabelElement | ArrowElement;

// ─── Map session ────────────────────────────────────────────────────────────

export interface MapSession {
  id: string;
  title: string;
  mapRegionId: string;
  unitId?: string;
  elements: DrawingElement[];
  layers: Layer[];
  era?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Unit templates ─────────────────────────────────────────────────────────

export interface TemplateItem {
  id: string;
  text: string;
  category: LayerId;
  hint?: string;
}

export interface UnitTemplate {
  id: string;
  title: string;
  description: string;
  recommendedMapId: string;
  items: TemplateItem[];
}

// ─── Map regions ────────────────────────────────────────────────────────────

export interface MapRegion {
  id: string;
  title: string;
  svgAsset: string;
  viewBox: string;
}
