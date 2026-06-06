import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { DrawingElement, DrawingToolType, LayerId, MapSession, UnitTemplate } from '../../lib/types';
import { DEFAULT_LAYERS } from '../../constants/layers';
import { loadAllSessions, saveSession } from '../../lib/storage';
import { getMapSvgPath } from '../../lib/mapLoader';
import MapCanvas from '../../components/MapCanvas';
import DrawingToolbar from '../../components/DrawingToolbar';
import LayerPanel from '../../components/LayerPanel';
import TemplateChecklist from '../../components/TemplateChecklist';

const TEMPLATE_MAP: Record<string, UnitTemplate> = {
  orient: require('../../data/templates/orient.json'),
  islam: require('../../data/templates/islam.json'),
  mongol: require('../../data/templates/mongol.json'),
  exploration: require('../../data/templates/exploration.json'),
};

export default function MapScreen() {
  const { id, mapRegionId, unitId } = useLocalSearchParams<{
    id: string;
    mapRegionId?: string;
    unitId?: string;
  }>();

  const [session, setSession] = useState<MapSession | null>(null);
  const [activeTool, setActiveTool] = useState<DrawingToolType>('pen');
  const [activeLayer, setActiveLayer] = useState<LayerId>('cities');
  const [activeColor, setActiveColor] = useState('#E53E3E');
  const [reviewMode, setReviewMode] = useState(false);

  useEffect(() => {
    async function init() {
      const all = await loadAllSessions();
      const existing = all.find((s) => s.id === id);
      if (existing) {
        setSession(existing);
      } else {
        const newSession: MapSession = {
          id,
          title: '新しい地図',
          mapRegionId: mapRegionId ?? 'west-asia',
          unitId,
          checkedItems: [],
          elements: [],
          layers: [...DEFAULT_LAYERS],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setSession(newSession);
        await saveSession(newSession);
      }
    }
    init();
  }, [id]);

  async function handleElementAdded(el: DrawingElement) {
    if (!session) return;
    const updated: MapSession = {
      ...session,
      elements: [...session.elements, el],
      updatedAt: new Date().toISOString(),
    };
    setSession(updated);
    await saveSession(updated);
  }

  async function handleElementRemoved(id: string) {
    if (!session) return;
    const updated: MapSession = {
      ...session,
      elements: session.elements.filter((e) => e.id !== id),
      updatedAt: new Date().toISOString(),
    };
    setSession(updated);
    await saveSession(updated);
  }

  async function handleToggleLayer(layerId: LayerId) {
    if (!session) return;
    const updated: MapSession = {
      ...session,
      layers: session.layers.map((l) =>
        l.id === layerId ? { ...l, visible: !l.visible } : l
      ),
      updatedAt: new Date().toISOString(),
    };
    setSession(updated);
    await saveSession(updated);
  }

  async function handleToggleItem(itemId: string) {
    if (!session) return;
    const checkedItems = session.checkedItems ?? [];
    const updated: MapSession = {
      ...session,
      checkedItems: checkedItems.includes(itemId)
        ? checkedItems.filter((id) => id !== itemId)
        : [...checkedItems, itemId],
      updatedAt: new Date().toISOString(),
    };
    setSession(updated);
    await saveSession(updated);
  }

  if (!session) {
    return (
      <View style={styles.loading}>
        <Text>読み込み中...</Text>
      </View>
    );
  }

  const visibleLayers = session.layers.filter((l) => l.visible).map((l) => l.id);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{session.title}</Text>
        <TouchableOpacity
          style={[styles.reviewBtn, reviewMode && styles.reviewBtnActive]}
          onPress={() => setReviewMode((v) => !v)}
        >
          <Text style={styles.reviewBtnText}>{reviewMode ? '復習中' : '復習モード'}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.main}>
        <DrawingToolbar
          activeTool={activeTool}
          activeLayer={activeLayer}
          activeColor={activeColor}
          onToolChange={setActiveTool}
          onColorChange={setActiveColor}
        />
        <MapCanvas
          mapSvgContent={getMapSvgPath(session.mapRegionId)}
          elements={session.elements}
          visibleLayers={visibleLayers}
          activeTool={activeTool}
          activeLayer={activeLayer}
          activeColor={activeColor}
          reviewMode={reviewMode}
          onElementAdded={handleElementAdded}
          onElementRemoved={handleElementRemoved}
        />
        <View style={styles.rightPanel}>
          <LayerPanel
            layers={session.layers}
            activeLayer={activeLayer}
            onToggleLayer={handleToggleLayer}
            onSetActiveLayer={setActiveLayer}
          />
          {session.unitId && TEMPLATE_MAP[session.unitId] && (
            <TemplateChecklist
              template={TEMPLATE_MAP[session.unitId]}
              checkedItems={session.checkedItems ?? []}
              onToggleItem={handleToggleItem}
            />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FAFC' },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  title: { fontSize: 16, fontWeight: '600', color: '#1A202C' },
  reviewBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 6, backgroundColor: '#EDF2F7' },
  reviewBtnActive: { backgroundColor: '#FC8181' },
  reviewBtnText: { fontSize: 13, fontWeight: '600', color: '#2D3748' },
  main: { flex: 1, flexDirection: 'row' },
  rightPanel: { width: 200, padding: 8, gap: 8 },
});
