import React from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import VignetteBackground from './VignetteBackground';
import ScrollWornEdges from './ScrollWornEdges';
import GoldBubbleBackground from './GoldBubbleBackground';

/**
 * CustomPickerModal
 * Props:
 * - visible: boolean
 * - onRequestClose: function
 * - options: array of { label, value, [enabled] }
 * - selectedValue: any
 * - onValueChange: function(value)
 * - title: string (optional)
 */
export default function CustomPickerModal({
  visible,
  onRequestClose,
  options,
  selectedValue,
  onValueChange,
  title = 'Select Option',
}) {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onRequestClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <VignetteBackground borderRadius={18} />
          <ScrollWornEdges style={{ position: 'absolute', left: 20, top: 0, width: '100%', height: '100%', zIndex: 0 }} width={320} height={610} />
          <Text style={styles.title}>{title}</Text>
          <ScrollView style={styles.optionsList}>
            {options.map((opt, idx) => (
              <TouchableOpacity
                key={opt.value ?? opt.label ?? idx}
                style={[
                  styles.option,
                  selectedValue === opt.value && styles.selectedOption,
                  opt.enabled === false && styles.disabledOption,
                ]}
                onPress={() => {
                  if (opt.enabled === false) return;
                  onValueChange(opt.value);
                  onRequestClose();
                }}
                disabled={opt.enabled === false}
                accessibilityLabel={opt.label}
                activeOpacity={0.75}
              >
                <Text
                  style={[
                    styles.optionLabel,
                    selectedValue === opt.value && styles.selectedOptionLabel,
                    opt.enabled === false && styles.disabledOptionLabel,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onRequestClose}
            accessibilityLabel="Close picker"
            activeOpacity={0.85}
          >
            <GoldBubbleBackground width={140} height={48} borderRadius={24} style={{ position: 'absolute', left: 0, top: 0, zIndex: 0 }} />
            <View style={{ position: 'absolute', left: 0, top: 0, width: 140, height: 48, alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
              <Text style={styles.closeButtonText}>Close</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(34, 18, 66, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    height: '95%',
    borderRadius: 18,
    backgroundColor: '#f8f3e2',
    padding: 16,
    alignItems: 'center',
    elevation: 10,
    overflow: 'hidden',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4b3ca7',
    marginBottom: 12,
    textAlign: 'center',
  },
  optionsList: {
    alignSelf: 'stretch',
    maxHeight: 670,
    marginBottom: 16,
  },
  option: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginVertical: 2,
    backgroundColor: 'transparent',
  },
  selectedOption: {
    backgroundColor: '#e8e0c4',
  },
  disabledOption: {
    opacity: 0.5,
  },
  optionLabel: {
    fontSize: 18,
    color: '#42370c',
    textAlign: 'center',
  },
  selectedOptionLabel: {
    color: '#4b3ca7',
    fontWeight: 'bold',
  },
  disabledOptionLabel: {
    color: '#aaa',
  },
  closeButton: {
    width: 140,
    height: 48,
    marginBottom: 20,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  closeButtonText: {
    color: '#7a6334',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
    letterSpacing: 0.5,
    textShadowColor: '#bfae66',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
});
