import AsyncStorage from '@react-native-async-storage/async-storage';
import { MapSession } from './types';

const SESSIONS_KEY = 'sekaishi_sessions';

export async function loadAllSessions(): Promise<MapSession[]> {
  const raw = await AsyncStorage.getItem(SESSIONS_KEY);
  return raw ? (JSON.parse(raw) as MapSession[]) : [];
}

export async function saveSession(session: MapSession): Promise<void> {
  const all = await loadAllSessions();
  const idx = all.findIndex((s) => s.id === session.id);
  if (idx >= 0) {
    all[idx] = session;
  } else {
    all.push(session);
  }
  await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(all));
}

export async function deleteSession(id: string): Promise<void> {
  const all = await loadAllSessions();
  await AsyncStorage.setItem(
    SESSIONS_KEY,
    JSON.stringify(all.filter((s) => s.id !== id))
  );
}
