/**
 * DrawingToolbar
 *
 * TODO（Codexへ）:
 * - 各ツールボタンを@expo/vector-icons の Ionicons アイコンで実装
 * - カラーパレット（6色）をボタン形式で表示
 * - 選択中ツール・色をハイライト
 */

import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { DrawingToolType, LayerId } from '../lib/types';

const TOOL_COLORS = ['#E53E3E', '#3182CE', '#38A169', '#805AD5', '#DD6B20', '#1A202C'];

interface Props {
  activeTool: DrawingToolType;
  activeLayer: LayerId;
  activeColor: string;
  onToolChange: (tool: DrawingToolType) => void;
  onColorChange: (color: string) => void;
}

export default function DrawingToolbar({
  activeTool,
  activeColor,
  onToolChange,
  onColorChange,
}: Props) {
  const tools: { id: DrawingToolType }[] = [
    { id: 'pen' },
    { id: 'highlighter' },
    { id: 'arrow' },
    { id: 'label' },
    { id: 'eraser' },
  ];

  return (
    <View style={styles.container}>
      {tools.map((t) => (
        <TouchableOpacity
          key={t.id}
          style={[styles.toolBtn, activeTool === t.id && styles.toolBtnActive]}
          onPress={() => onToolChange(t.id)}
        />
      ))}
      <View style={styles.divider} />
      {TOOL_COLORS.map((color) => (
        <TouchableOpacity
          key={color}
          style={[
            styles.colorBtn,
            { backgroundColor: color },
            activeColor === color && styles.colorBtnActive,
          ]}
          onPress={() => onColorChange(color)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 8,
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  toolBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F7FAFC',
  },
  toolBtnActive: {
    backgroundColor: '#2B6CB0',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 4,
  },
  colorBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignSelf: 'center',
  },
  colorBtnActive: {
    borderWidth: 3,
    borderColor: '#2D3748',
  },
});
