import React, { useState } from 'react';
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { Layer, LayerId } from '../lib/types';

interface Props {
  layers: Layer[];
  activeLayer: LayerId;
  onToggleLayer: (id: LayerId) => void;
  onSetActiveLayer: (id: LayerId) => void;
}

export default function LayerPanel({
  layers,
  activeLayer,
  onToggleLayer,
  onSetActiveLayer,
}: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.header} onPress={() => setExpanded((v) => !v)}>
        <Text style={styles.headerText}>レイヤー {expanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      {expanded && (
        <View style={styles.list}>
          {layers.map((layer) => (
            <TouchableOpacity
              key={layer.id}
              style={[styles.row, activeLayer === layer.id && styles.rowActive]}
              onPress={() => onSetActiveLayer(layer.id)}
            >
              <View style={[styles.colorDot, { backgroundColor: layer.color }]} />
              <Text style={styles.layerLabel}>{layer.label}</Text>
              <Switch
                value={layer.visible}
                onValueChange={() => onToggleLayer(layer.id)}
                trackColor={{ true: layer.color }}
              />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    minWidth: 180,
  },
  header: { padding: 12, backgroundColor: '#EDF2F7' },
  headerText: { fontWeight: '600', fontSize: 14, color: '#2D3748' },
  list: { paddingVertical: 4 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  rowActive: { backgroundColor: '#EBF8FF' },
  colorDot: { width: 10, height: 10, borderRadius: 5 },
  layerLabel: { flex: 1, fontSize: 14, color: '#2D3748' },
});
