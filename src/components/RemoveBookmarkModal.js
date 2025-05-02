import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';

export default function RemoveBookmarkModal({ visible, onCancel, onConfirm, loading }) {
  if (!visible) return null;
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          <Text style={styles.title}>Remove Bookmark?</Text>
          <Text style={styles.message}>Are you sure you want to remove this bookmark? This action cannot be undone.</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onCancel} disabled={loading}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.removeBtn} onPress={onConfirm} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fffbe6" size={22} />
              ) : (
                <Text style={styles.removeText}>Remove</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(33,0,36,0.87)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 10,
  },
  modalBox: {
    backgroundColor: '#fffbe6',
    borderRadius: 18,
    padding: 28,
    alignItems: 'center',
    width: 320,
    maxWidth: '96%',
    elevation: 8,
    borderWidth: 2,
    borderColor: '#ffe066',
  },
  title: {
    color: '#3D0066',
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 10,
    fontFamily: 'serif',
    textAlign: 'center',
  },
  message: {
    color: '#6B1A7A',
    fontSize: 16,
    marginBottom: 24,
    fontFamily: 'serif',
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 18,
  },
  cancelBtn: {
    backgroundColor: '#ffe066',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 24,
    marginRight: 8,
  },
  cancelText: {
    color: '#3D0066',
    fontWeight: 'bold',
    fontSize: 16,
  },
  removeBtn: {
    backgroundColor: '#d7263d',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  removeText: {
    color: '#fffbe6',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
