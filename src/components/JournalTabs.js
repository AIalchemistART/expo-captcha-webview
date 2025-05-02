import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

const JournalTabs = ({ activeTab, setActiveTab }) => {
  return (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'bookmarks' && styles.activeTab]}
        onPress={() => setActiveTab('bookmarks')}
        accessibilityLabel="Bookmarks Tab"
      >
        <Text style={[styles.tabText, activeTab === 'bookmarks' && styles.activeTabText]}>Bookmarks</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'notes' && styles.activeTab]}
        onPress={() => setActiveTab('notes')}
        accessibilityLabel="Notes Tab"
      >
        <Text style={[styles.tabText, activeTab === 'notes' && styles.activeTabText]}>Notes</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 0,
    marginBottom: 12,
    backgroundColor: 'rgba(44,0,80,0.6)',
    borderRadius: 16,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    backgroundColor: 'transparent',
  },
  activeTab: {
    backgroundColor: '#ffe066',
    shadowColor: '#3D0066',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  tabText: {
    fontSize: 18,
    color: '#ffe066',
    fontFamily: 'serif',
    fontWeight: 'bold',
  },
  activeTabText: {
    color: '#3D0066',
  },
});

export default JournalTabs;
