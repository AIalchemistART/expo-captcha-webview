import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, Switch } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Overlay for Divine Inspiration tab: introduces the feature and mystical theme.
 */
export default function DivineInspirationInfoOverlay({
  visible,
  onClose,
  isLoggedIn,
  isPremium,
  onSignIn,
  onUpgrade,
  onGetInspired,
  onPremiumBlock
}) {
  const [dontShowAgain, setDontShowAgain] = useState(false);
  useEffect(() => {
    if (visible) {
      AsyncStorage.getItem('mbc_di_overlay_dismissed_v1').then(val => {
        setDontShowAgain(val === 'true');
      });
    }
  }, [visible]);

  const handleToggle = async () => {
    const newVal = !dontShowAgain;
    setDontShowAgain(newVal);
    await AsyncStorage.setItem('mbc_di_overlay_dismissed_v1', newVal ? 'true' : 'false');
  };

  const handleGetInspired = () => {
    if (!isPremium && typeof onPremiumBlock === 'function') {
      onPremiumBlock();
      return;
    }
    if (dontShowAgain) {
      AsyncStorage.setItem('mbc_di_overlay_dismissed_v1', 'true');
    }
    onGetInspired && onGetInspired();
    onClose && onClose();
  };

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
          <MaterialCommunityIcons name="lightbulb-on-outline" size={48} color="#ffe066" style={{ marginBottom: 10 }} />
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
            Divine Inspiration
          </Text>
          <Text style={{
            fontSize: 16,
            color: '#2A004B',
            textAlign: 'center',
            marginBottom: 16,
            fontWeight: '600',
            fontFamily: 'serif',
          }}>
            Discover a random verse, contextually illuminating passage, and mystical interpretation each time you visit. Let the Spirit surprise you—explore, reflect, bookmark, and journal your revelations!
          </Text>
          <View style={{ marginBottom: 18, marginTop: 2, width: '100%' }}>
            <Text style={{ fontSize: 15, color: '#4b3ca7', textAlign: 'left', fontFamily: 'serif', marginBottom: 8 }}>
              • Fresh mystical experience every visit
            </Text>
            <Text style={{ fontSize: 15, color: '#4b3ca7', textAlign: 'left', fontFamily: 'serif', marginBottom: 8 }}>
              • Lovingly curated design for meditation and deep reflection 
            </Text>
            <Text style={{ fontSize: 15, color: '#4b3ca7', textAlign: 'left', fontFamily: 'serif' }}>
              • Bookmark to save favorites to your Journal
            </Text>
          </View>
          <View style={{ width: '100%', marginTop: 8, alignItems: 'center' }}>
            {/* Auth gating buttons */}
            {!isLoggedIn && (
              <TouchableOpacity
                style={{ backgroundColor: '#ffe066', borderRadius: 8, paddingVertical: 12, paddingHorizontal: 28, borderWidth: 1, borderColor: '#bfae66', elevation: 2, marginBottom: 12, minWidth: 180, alignItems: 'center' }}
                onPress={onSignIn}
              >
                <Text style={{ color: '#2A004B', fontWeight: 'bold', fontSize: 17, fontFamily: 'serif', textAlign: 'center' }}>Sign In / Sign Up</Text>
              </TouchableOpacity>
            )}
            {isLoggedIn && !isPremium && (
              <TouchableOpacity
                style={{ backgroundColor: '#ffe066', borderRadius: 8, paddingVertical: 12, paddingHorizontal: 28, borderWidth: 1, borderColor: '#bfae66', elevation: 2, marginBottom: 12, minWidth: 180, alignItems: 'center' }}
                onPress={onUpgrade}
              >
                <Text style={{ color: '#2A004B', fontWeight: 'bold', fontSize: 17, fontFamily: 'serif', textAlign: 'center' }}>Upgrade to Premium</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={{ backgroundColor: '#eee7d7', borderRadius: 8, paddingVertical: 12, paddingHorizontal: 28, borderWidth: 1, borderColor: '#bfae66', minWidth: 180, alignItems: 'center' }}
              onPress={handleGetInspired}
            >
              <Text style={{ color: '#7d5fff', fontWeight: 'bold', fontSize: 17, fontFamily: 'serif', textAlign: 'center' }}>Maybe Later</Text>
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 18 }}>
              <Switch
                value={dontShowAgain}
                onValueChange={handleToggle}
                trackColor={{ false: '#ccc', true: '#bfae66' }}
                thumbColor={dontShowAgain ? '#ffe066' : '#fff'}
              />
              <Text style={{ marginLeft: 8, color: '#4b3ca7', fontSize: 15, fontFamily: 'serif' }}>Don't show this again</Text>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
