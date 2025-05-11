import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const DownloadInfoOverlay = ({ visible, onClose, onShare, canShare }) => {
  if (!visible) return null;
  return (
    <View style={styles.overlayBg}>
      <View style={styles.modalContent}>
        <Ionicons name="information-circle" size={40} color="#FFD700" style={{ marginBottom: 10 }} />
        <Text style={styles.title}>Download Information</Text>
        <Text style={styles.infoText}>
          Downloaded audio files are saved in the app's private storage. This means you cannot access them directly from your device's Files or Downloads app. To use the audio outside the app, please use the Share feature below.
        </Text>
        <Text style={styles.infoText}>
          The Clear Downloads button allows you to free up storage by deleting all downloaded tracks. Since the files are not visible in your device's file manager, this is the only way to remove them without uninstalling the app.
        </Text>
        <TouchableOpacity style={styles.shareBtn} onPress={onShare} disabled={!canShare}>
          <Ionicons name="share-social" size={24} color="#fff" />
          <Text style={styles.shareText}>{canShare ? 'Share Last Download' : 'Share Unavailable'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Text style={styles.closeText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlayBg: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(30, 0, 40, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  modalContent: {
    backgroundColor: '#2A004B',
    borderRadius: 18,
    padding: 26,
    alignItems: 'center',
    width: '90%',
    maxWidth: 400,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    color: '#FFD700',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 0.4,
  },
  infoText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5A189A',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginBottom: 14,
  },
  shareText: {
    color: '#fff',
    fontSize: 17,
    marginLeft: 8,
    fontWeight: 'bold',
  },
  closeBtn: {
    marginTop: 2,
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: '#FFD700',
  },
  closeText: {
    color: '#2A004B',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default DownloadInfoOverlay;
