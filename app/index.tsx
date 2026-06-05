import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { MapSession } from '../lib/types';
import { loadAllSessions } from '../lib/storage';
import { MAP_REGION_LIST } from '../constants/layers';

export default function HomeScreen() {
  const [sessions, setSessions] = useState<MapSession[]>([]);

  useEffect(() => {
    loadAllSessions().then(setSessions);
  }, []);

  function handleNewSession(mapRegionId: string) {
    const id = Date.now().toString();
    router.push({ pathname: '/map/[id]', params: { id, mapRegionId } });
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
              onPress={() => handleNewSession(region.id)}
            >
              <Text style={styles.regionText}>{region.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
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
});
