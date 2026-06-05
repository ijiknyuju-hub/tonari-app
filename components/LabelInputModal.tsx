import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Point } from '../lib/types';

interface Props {
  visible: boolean;
  position: Point;
  color: string;
  onConfirm: (text: string) => void;
  onCancel: () => void;
}

export default function LabelInputModal({ visible, color, onConfirm, onCancel }: Props) {
  const [text, setText] = useState('');

  function handleConfirm() {
    if (text.trim()) {
      onConfirm(text.trim());
      setText('');
    }
  }

  function handleCancel() {
    setText('');
    onCancel();
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.dialog}>
          <Text style={styles.heading}>ラベルを入力</Text>
          <TextInput
            style={[styles.input, { borderColor: color }]}
            value={text}
            onChangeText={setText}
            placeholder="都市名・王朝名など"
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleConfirm}
          />
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
              <Text style={styles.cancelText}>キャンセル</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmBtn, { backgroundColor: color }]}
              onPress={handleConfirm}
            >
              <Text style={styles.confirmText}>配置</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialog: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    width: 320,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  heading: { fontSize: 16, fontWeight: '700', color: '#1A202C', marginBottom: 16 },
  input: {
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#1A202C',
    marginBottom: 16,
  },
  actions: { flexDirection: 'row', gap: 12, justifyContent: 'flex-end' },
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 10 },
  cancelText: { fontSize: 14, color: '#718096' },
  confirmBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  confirmText: { fontSize: 14, fontWeight: '600', color: '#FFF' },
});
