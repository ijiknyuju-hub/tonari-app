import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { UnitTemplate } from '../lib/types';

interface Props {
  template: UnitTemplate;
  checkedItems: string[];
  onToggleItem: (id: string) => void;
}

export default function TemplateChecklist({ template, checkedItems, onToggleItem }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{template.title}</Text>
      <Text style={styles.desc}>{template.description}</Text>
      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {template.items.map((item) => {
          const checked = checkedItems.includes(item.id);
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.item, checked && styles.itemChecked]}
              onPress={() => onToggleItem(item.id)}
            >
              <Text style={styles.checkbox}>{checked ? '✅' : '⬜'}</Text>
              <View style={styles.itemContent}>
                <Text style={[styles.itemText, checked && styles.itemTextChecked]}>
                  {item.text}
                </Text>
                {item.hint && <Text style={styles.hint}>{item.hint}</Text>}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <Text style={styles.progress}>
        {checkedItems.length} / {template.items.length} 完了
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 260,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: { fontSize: 16, fontWeight: '700', color: '#1A202C', marginBottom: 4 },
  desc: { fontSize: 12, color: '#718096', marginBottom: 12 },
  list: { flex: 1 },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F7FAFC',
  },
  itemChecked: { opacity: 0.6 },
  checkbox: { fontSize: 16 },
  itemContent: { flex: 1 },
  itemText: { fontSize: 14, color: '#2D3748', fontWeight: '500' },
  itemTextChecked: { textDecorationLine: 'line-through', color: '#A0AEC0' },
  hint: { fontSize: 11, color: '#718096', marginTop: 2 },
  progress: { marginTop: 12, textAlign: 'center', fontSize: 13, color: '#4A5568', fontWeight: '600' },
});
