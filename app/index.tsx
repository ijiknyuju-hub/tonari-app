import React, { useEffect, useState } from 'react';
import { FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { MapSession } from '../lib/types';
import { loadAllSessions } from '../lib/storage';
import { MAP_REGION_LIST } from '../constants/layers';

const UNIT_TEMPLATES = [
  { id: 'orient', title: '古代オリエント', mapId: 'west-asia' },
  { id: 'islam', title: 'イスラーム世界', mapId: 'west-asia' },
  { id: 'mongol', title: 'モンゴル帝国', mapId: 'eurasia' },
  { id: 'exploration', title: '大航海時代', mapId: 'world' },
] as const;

export default function HomeScreen() {
  const [sessions, setSessions] = useState<MapSession[]>([]);
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);

  useEffect(() => {
    loadAllSessions().then(setSessions);
  }, []);

  function handleNewSession(unitId?: string) {
    if (!selectedRegionId) return;
    const id = Date.now().toString();
    const params = unitId
      ? { id, mapRegionId: selectedRegionId, unitId }
      : { id, mapRegionId: selectedRegionId };
    setSelectedRegionId(null);
    router.push({ pathname: '/map/[id]', params });
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={sessions}
        keyExtractor={(s) => s.id}
        ListEmptyComponent={
          <Text style={styles.empty}>まだ地図がありません。下のボタンから始めよう。</Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push({ pathname: '/map/[id]', params: { id: item.id } })}
          >
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardMeta}>{item.era ?? ''} · {item.updatedAt.slice(0, 10)}</Text>
          </TouchableOpacity>
        )}
      />
      <View style={styles.newSection}>
        <Text style={styles.sectionLabel}>新しい地図を作る</Text>
        <View style={styles.regionGrid}>
          {MAP_REGION_LIST.map((region) => (
            <TouchableOpacity
              key={region.id}
              style={styles.regionBtn}
              onPress={() => setSelectedRegionId(region.id)}
            >
              <Text style={styles.regionText}>{region.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <Modal
        transparent
        animationType="fade"
        visible={selectedRegionId !== null}
        onRequestClose={() => setSelectedRegionId(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>単元を選択</Text>
            {UNIT_TEMPLATES.filter((unit) => unit.mapId === selectedRegionId).map((unit) => (
              <TouchableOpacity
                key={unit.id}
                style={styles.unitBtn}
                onPress={() => handleNewSession(unit.id)}
              >
                <Text style={styles.unitText}>{unit.title}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.emptyTemplateBtn} onPress={() => handleNewSession()}>
              <Text style={styles.emptyTemplateText}>テンプレートなし（空の地図）</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setSelectedRegionId(null)}>
              <Text style={styles.cancelText}>キャンセル</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FAFC' },
  empty: { textAlign: 'center', color: '#A0AEC0', marginTop: 60, fontSize: 15 },
  card: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#1A202C' },
  cardMeta: { fontSize: 12, color: '#718096', marginTop: 4 },
  newSection: { padding: 16, borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  sectionLabel: { fontSize: 14, fontWeight: '600', color: '#4A5568', marginBottom: 10 },
  regionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  regionBtn: { backgroundColor: '#2B6CB0', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8 },
  regionText: { color: '#FFF', fontSize: 14, fontWeight: '500' },
  modalBackdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modalContent: { width: 360, borderRadius: 12, padding: 20, backgroundColor: '#FFF' },
  modalTitle: { marginBottom: 12, fontSize: 18, fontWeight: '700', color: '#1A202C' },
  unitBtn: { marginBottom: 8, borderRadius: 8, padding: 14, backgroundColor: '#EBF8FF' },
  unitText: { fontSize: 15, fontWeight: '600', color: '#2B6CB0' },
  emptyTemplateBtn: { marginTop: 4, borderRadius: 8, padding: 14, backgroundColor: '#EDF2F7' },
  emptyTemplateText: { fontSize: 15, fontWeight: '500', color: '#4A5568' },
  cancelBtn: { alignItems: 'center', marginTop: 12, padding: 10 },
  cancelText: { fontSize: 14, color: '#718096' },
});
