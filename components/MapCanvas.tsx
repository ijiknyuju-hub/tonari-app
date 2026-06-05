import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Svg, { Defs, Line, Path, Polygon, Text as SvgText } from 'react-native-svg';
import {
  ArrowElement,
  DrawingElement,
  DrawingToolType,
  LabelElement,
  LayerId,
  Point,
  StrokeElement,
} from '../lib/types';
import LabelInputModal from './LabelInputModal';

interface Props {
  mapSvgContent: string;
  elements: DrawingElement[];
  visibleLayers: LayerId[];
  activeTool: DrawingToolType;
  activeLayer: LayerId;
  activeColor: string;
  reviewMode: boolean;
  onElementAdded: (el: DrawingElement) => void;
  onElementRemoved?: (id: string) => void;
}

const ERASER_RADIUS = 30;

export default function MapCanvas({
  elements,
  visibleLayers,
  activeTool,
  activeLayer,
  activeColor,
  reviewMode,
  onElementAdded,
  onElementRemoved,
}: Props) {
  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);
  const [arrowStart, setArrowStart] = useState<Point | null>(null);
  const [arrowCurrent, setArrowCurrent] = useState<Point | null>(null);
  const [labelPending, setLabelPending] = useState<Point | null>(null);

  const panGesture = Gesture.Pan()
    .runOnJS(true)
    .onStart((e) => {
      const p: Point = { x: e.x, y: e.y };
      if (activeTool === 'pen' || activeTool === 'highlighter') {
        setCurrentStroke([p]);
      } else if (activeTool === 'arrow') {
        setArrowStart(p);
        setArrowCurrent(p);
      }
    })
    .onUpdate((e) => {
      const p: Point = { x: e.x, y: e.y };
      if (activeTool === 'pen' || activeTool === 'highlighter') {
        setCurrentStroke((prev) => [...prev, p]);
      } else if (activeTool === 'arrow') {
        setArrowCurrent(p);
      } else if (activeTool === 'eraser') {
        eraseNear(p);
      }
    })
    .onEnd(() => {
      if ((activeTool === 'pen' || activeTool === 'highlighter') && currentStroke.length > 1) {
        const stroke: StrokeElement = {
          type: 'stroke',
          id: Date.now().toString(),
          layerId: activeLayer,
          tool: activeTool as 'pen' | 'highlighter',
          points: currentStroke,
          color: activeColor,
          width: activeTool === 'highlighter' ? 14 : 3,
          opacity: activeTool === 'highlighter' ? 0.35 : 1,
        };
        onElementAdded(stroke);
      } else if (activeTool === 'arrow' && arrowStart && arrowCurrent) {
        const dx = arrowCurrent.x - arrowStart.x;
        const dy = arrowCurrent.y - arrowStart.y;
        if (Math.sqrt(dx * dx + dy * dy) > 20) {
          const arrow: ArrowElement = {
            type: 'arrow',
            id: Date.now().toString(),
            layerId: activeLayer,
            from: arrowStart,
            to: arrowCurrent,
            color: activeColor,
          };
          onElementAdded(arrow);
        }
      }
      setCurrentStroke([]);
      setArrowStart(null);
      setArrowCurrent(null);
    });

  const tapGesture = Gesture.Tap()
    .runOnJS(true)
    .onEnd((e) => {
      if (activeTool === 'label') {
        setLabelPending({ x: e.x, y: e.y });
      }
    });

  const composedGesture = Gesture.Simultaneous(panGesture, tapGesture);

  function eraseNear(point: Point) {
    if (!onElementRemoved) return;
    const target = elements.find((el) => {
      if (el.type === 'stroke') {
        return el.points.some(
          (p) => Math.hypot(p.x - point.x, p.y - point.y) < ERASER_RADIUS
        );
      }
      if (el.type === 'label') {
        return Math.hypot(el.position.x - point.x, el.position.y - point.y) < ERASER_RADIUS;
      }
      if (el.type === 'arrow') {
        return (
          Math.hypot(el.from.x - point.x, el.from.y - point.y) < ERASER_RADIUS ||
          Math.hypot(el.to.x - point.x, el.to.y - point.y) < ERASER_RADIUS
        );
      }
      return false;
    });
    if (target) onElementRemoved(target.id);
  }

  function pointsToPath(pts: Point[]): string {
    if (pts.length < 2) return '';
    return `M${pts[0].x},${pts[0].y}` + pts.slice(1).map((p) => `L${p.x},${p.y}`).join('');
  }

  function arrowHeadPoints(from: Point, to: Point, size = 10): string {
    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    const a1 = angle + (2.5 * Math.PI) / 4;
    const a2 = angle - (2.5 * Math.PI) / 4;
    const p1x = to.x + size * Math.cos(a1);
    const p1y = to.y + size * Math.sin(a1);
    const p2x = to.x + size * Math.cos(a2);
    const p2y = to.y + size * Math.sin(a2);
    return `${to.x},${to.y} ${p1x},${p1y} ${p2x},${p2y}`;
  }

  const visibleElements = elements.filter((el) => visibleLayers.includes(el.layerId));

  function renderElement(el: DrawingElement) {
    if (el.type === 'stroke') {
      return (
        <Path
          key={el.id}
          d={pointsToPath(el.points)}
          stroke={el.color}
          strokeWidth={el.width}
          strokeOpacity={el.opacity}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      );
    }
    if (el.type === 'arrow') {
      return (
        <React.Fragment key={el.id}>
          <Line
            x1={el.from.x}
            y1={el.from.y}
            x2={el.to.x}
            y2={el.to.y}
            stroke={el.color}
            strokeWidth={2.5}
            strokeLinecap="round"
          />
          <Polygon points={arrowHeadPoints(el.from, el.to)} fill={el.color} />
          {el.label && (
            <SvgText
              x={(el.from.x + el.to.x) / 2}
              y={(el.from.y + el.to.y) / 2 - 8}
              fontSize={12}
              fill={el.color}
              textAnchor="middle"
              fontFamily="sans-serif"
            >
              {el.label}
            </SvgText>
          )}
        </React.Fragment>
      );
    }
    if (el.type === 'label') {
      return (
        <SvgText
          key={el.id}
          x={el.position.x}
          y={el.position.y}
          fontSize={el.fontSize}
          fill={el.color}
          textAnchor="middle"
          fontFamily="sans-serif"
          fontWeight="600"
          opacity={reviewMode ? 0 : 1}
        >
          {el.text}
        </SvgText>
      );
    }
    return null;
  }

  function handleLabelConfirm(text: string) {
    if (!labelPending) return;
    const label: LabelElement = {
      type: 'label',
      id: Date.now().toString(),
      layerId: activeLayer,
      text,
      position: labelPending,
      color: activeColor,
      fontSize: 16,
    };
    onElementAdded(label);
    setLabelPending(null);
  }

  return (
    <View style={styles.container}>
      <GestureDetector gesture={composedGesture}>
        <View style={StyleSheet.absoluteFill}>
          {/* TODO: <SvgXml xml={mapSvgContent} width="100%" height="100%" /> */}
          <Svg style={StyleSheet.absoluteFill}>
            <Defs />
            {visibleElements.map(renderElement)}
            {currentStroke.length > 1 && (
              <Path
                d={pointsToPath(currentStroke)}
                stroke={activeColor}
                strokeWidth={activeTool === 'highlighter' ? 14 : 3}
                strokeOpacity={activeTool === 'highlighter' ? 0.35 : 1}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
            {activeTool === 'arrow' && arrowStart && arrowCurrent && (
              <React.Fragment>
                <Line
                  x1={arrowStart.x}
                  y1={arrowStart.y}
                  x2={arrowCurrent.x}
                  y2={arrowCurrent.y}
                  stroke={activeColor}
                  strokeWidth={2.5}
                  strokeOpacity={0.6}
                  strokeLinecap="round"
                />
                <Polygon
                  points={arrowHeadPoints(arrowStart, arrowCurrent)}
                  fill={activeColor}
                  opacity={0.6}
                />
              </React.Fragment>
            )}
          </Svg>
        </View>
      </GestureDetector>
      <LabelInputModal
        visible={labelPending !== null}
        position={labelPending ?? { x: 0, y: 0 }}
        color={activeColor}
        onConfirm={handleLabelConfirm}
        onCancel={() => setLabelPending(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAF7' },
});
