import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import CustomPickerModal from './CustomPickerModal';

const SORT_OPTIONS = [
  { key: 'created_desc', label: 'Newest First' },
  { key: 'created_asc', label: 'Oldest First' },
  { key: 'alpha_asc', label: 'A-Z' },
  { key: 'alpha_desc', label: 'Z-A' },
];

export default function BookmarkSortDropdown({ sortKey, setSortKey }) {
  const [showSortModal, setShowSortModal] = useState(false);
  return (
    <View style={styles.sortDropdownContainer}>
      <TouchableOpacity
        style={styles.sortDropdown}
        onPress={() => setShowSortModal(true)}
        activeOpacity={0.85}
      >
        <Text style={styles.sortDropdownText}>{SORT_OPTIONS.find(opt => opt.key === sortKey)?.label || 'Sort Bookmarks'}</Text>
      </TouchableOpacity>
      <CustomPickerModal
        visible={showSortModal}
        onRequestClose={() => setShowSortModal(false)}
        options={SORT_OPTIONS.map(opt => ({ label: opt.label, value: opt.key }))}
        selectedValue={sortKey}
        onValueChange={key => {
          setSortKey(key);
          setShowSortModal(false);
        }}
        title="Sort Bookmarks"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  sortDropdownContainer: {
    marginBottom: 8,
    alignItems: 'center',
    width: '100%',
  },
  sortDropdown: {
    backgroundColor: '#ffe066',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 18,
    alignItems: 'center',
    marginBottom: 4,
    shadowColor: '#3D0066',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.11,
    shadowRadius: 5,
    elevation: 2,
  },
  sortDropdownText: {
    color: '#3D0066',
    fontFamily: 'serif',
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 0.2,
  },
});
