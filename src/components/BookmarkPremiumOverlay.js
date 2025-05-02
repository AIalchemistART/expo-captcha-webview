import React from 'react';
import { View, Text, Modal, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

/**
 * Overlay for authenticated free users attempting to bookmark mystical commentary
 * in Genesis 1 or Matthew 1. Explains that bookmarking is a premium feature.
 */
export default function BookmarkPremiumOverlay({ visible, onUpgrade, onClose }) {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: 'rgba(30, 0, 50, 0.85)', alignItems: 'center', justifyContent: 'center' }}>
        <View style={{
          backgroundColor: '#f5e4c3',
          borderRadius: 22,
          padding: 32,
          maxWidth: 370,
          alignItems: 'center',
          borderWidth: 2,
          borderColor: '#bfae66',
          shadowColor: '#3D0066',
          shadowOpacity: 0.25,
          shadowRadius: 18,
          elevation: 10
        }}>
          <MaterialCommunityIcons name="bookmark-multiple-outline" size={48} color="#bfae66" style={{ marginBottom: 10 }} />
          <Text style={{
            fontSize: 24,
            fontWeight: 'bold',
            color: '#7d5fff',
            marginBottom: 8,
            textAlign: 'center',
            fontFamily: 'serif',
            textShadowColor: '#fffbe6',
            textShadowOffset: { width: 0, height: 2 },
            textShadowRadius: 8
          }}>
            Bookmarking is Premium
          </Text>
          <Text style={{
            fontSize: 16,
            color: '#2A004B',
            textAlign: 'center',
            marginBottom: 16,
            fontWeight: '600',
            fontFamily: 'serif',
          }}>
            Saving bookmarks is a premium feature. Upgrade to unlock unlimited bookmarking and save your favorite mystical insights!
          </Text>
          <View style={{ marginBottom: 18, marginTop: 2, width: '100%' }}>
            <Text style={{ fontSize: 15, color: '#4b3ca7', textAlign: 'left', fontFamily: 'serif', marginBottom: 8 }}>
              • Unlimited bookmarks for all passages
            </Text>
            <Text style={{ fontSize: 15, color: '#4b3ca7', textAlign: 'left', fontFamily: 'serif', marginBottom: 8 }}>
              • Revisit mystical commentary in the Journal tab
            </Text>
            <Text style={{ fontSize: 15, color: '#4b3ca7', textAlign: 'left', fontFamily: 'serif' }}>
              • Sync and privacy protection
            </Text>
          </View>
          <View style={{ width: '100%', marginTop: 8, alignItems: 'center' }}>
            <TouchableOpacity
              style={{ backgroundColor: '#ffe066', borderRadius: 8, paddingVertical: 12, paddingHorizontal: 28, borderWidth: 1, borderColor: '#bfae66', elevation: 2, marginBottom: 14, minWidth: 180, alignItems: 'center' }}
              onPress={onUpgrade}
            >
              <Text style={{ color: '#2A004B', fontWeight: 'bold', fontSize: 17, fontFamily: 'serif', textAlign: 'center' }}>Upgrade Now</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ backgroundColor: '#eee7d7', borderRadius: 8, paddingVertical: 12, paddingHorizontal: 28, borderWidth: 1, borderColor: '#bfae66', minWidth: 180, alignItems: 'center' }}
              onPress={onClose}
            >
              <Text style={{ color: '#7d5fff', fontWeight: 'bold', fontSize: 17, fontFamily: 'serif', textAlign: 'center' }}>Maybe Later</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
