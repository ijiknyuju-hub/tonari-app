/**
 * MapCanvas
 *
 * TODO（Codexへ）:
 * 1. SvgXml（react-native-svg）でprops.mapSvgをレンダリング
 * 2. GestureDetector（react-native-gesture-handler）でパンジェスチャーを検知
 *    - activeTool === 'pen' || 'highlighter' → StrokeElementを生成
 *    - activeTool === 'arrow' → タッチ開始点をfromに、終了点をtoにしたArrowElementを生成
 *    - activeTool === 'label' → タップ位置にLabelInputモーダルを表示
 * 3. 完成した要素はonElementAddedコールバックで親に通知
 * 4. reviewModeがtrueのとき、LabelElementをすべて透明にする（隠す）
 */

import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Svg, { Path, Line, Defs } from 'react-native-svg';
import { DrawingElement, DrawingToolType, LayerId, Point, StrokeElement } from '../lib/types';

interface Props {
  mapSvgContent: string;
  elements: DrawingElement[];
  visibleLayers: LayerId[];
  activeTool: DrawingToolType;
  activeLayer: LayerId;
  activeColor: string;
  reviewMode: boolean;
  onElementAdded: (el: DrawingElement) => void;
}

export default function MapCanvas({
  elements,
  visibleLayers,
  activeTool,
  activeLayer,
  activeColor,
  reviewMode,
  onElementAdded,
}: Props) {
  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);

  const panGesture = Gesture.Pan()
    .onStart((e) => {
      if (activeTool === 'pen' || activeTool === 'highlighter') {
        setCurrentStroke([{ x: e.x, y: e.y }]);
      }
    })
    .onUpdate((e) => {
      if (activeTool === 'pen' || activeTool === 'highlighter') {
        setCurrentStroke((prev) => [...prev, { x: e.x, y: e.y }]);
      }
    })
    .onEnd(() => {
      if (currentStroke.length > 1) {
        const stroke: StrokeElement = {
          type: 'stroke',
          id: Date.now().toString(),
          layerId: activeLayer,
          tool: activeTool as 'pen' | 'highlighter',
          points: currentStroke,
          color: activeColor,
          width: activeTool === 'highlighter' ? 12 : 3,
          opacity: activeTool === 'highlighter' ? 0.4 : 1,
        };
        onElementAdded(stroke);
        setCurrentStroke([]);
      }
    });

  function pointsToSvgPath(points: Point[]): string {
    if (points.length === 0) return '';
    const [first, ...rest] = points;
    return `M ${first.x} ${first.y} ` + rest.map((p) => `L ${p.x} ${p.y}`).join(' ');
  }

  const visibleElements = elements.filter((el) => visibleLayers.includes(el.layerId));

  return (
    <GestureDetector gesture={panGesture}>
      <View style={styles.container}>
        {/* TODO: SvgXmlで白地図レンダリング */}
        <Svg style={StyleSheet.absoluteFill}>
          <Defs />
          {visibleElements.map((el) => {
            if (el.type === 'stroke') {
              return (
                <Path
                  key={el.id}
                  d={pointsToSvgPath(el.points)}
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
                <Line
                  key={el.id}
                  x1={el.from.x}
                  y1={el.from.y}
                  x2={el.to.x}
                  y2={el.to.y}
                  stroke={el.color}
                  strokeWidth={2}
                />
              );
            }
            return null;
          })}
          {currentStroke.length > 1 && (
            <Path
              d={pointsToSvgPath(currentStroke)}
              stroke={activeColor}
              strokeWidth={activeTool === 'highlighter' ? 12 : 3}
              strokeOpacity={activeTool === 'highlighter' ? 0.4 : 1}
              fill="none"
              strokeLinecap="round"
            />
          )}
        </Svg>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAF7',
  },
});
