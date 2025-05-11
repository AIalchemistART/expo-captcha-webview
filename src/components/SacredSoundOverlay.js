import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

const SacredSoundOverlay = ({ visible, onClose, songTitle, focusVerse, inspirationVerse, verseRange, passage }) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlayBg}>
        <View style={styles.modalContent}>
          {/* Song Title at top */}
          <Text style={styles.songTitle}>{songTitle}</Text>
          {/* Divine Chorus label */}
          <Text style={styles.divineChorusLabel}>Divine Chorus</Text>
          {/* Focus Verse */}
          <Text style={styles.focusVerse}>{focusVerse}</Text>
          {/* Inspiration Verse Text */}
          <Text style={styles.inspirationVerse}>{inspirationVerse}</Text>
          {/* Angelic Verses label */}
          <Text style={styles.angelicVersesLabel}>Angelic Verses</Text>
          {/* Verse Range as secondary heading */}
          <Text style={styles.verseRangeHeading}>{verseRange}</Text>
          {/* Passage block in ScrollView */}
          <ScrollView style={styles.passageScroll} contentContainerStyle={{paddingBottom: 8}} showsVerticalScrollIndicator={true}>
            {passage.split('\n').map((line, idx) => (
              <Text key={idx} style={styles.passageVerse}>{line}</Text>
            ))}
          </ScrollView>
          {/* Close Button */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlayBg: {
    flex: 1,
    backgroundColor: 'rgba(25, 24, 37, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#2A004B',
    borderRadius: 18,
    paddingHorizontal: 32,
    paddingBottom: 32,
    paddingTop: 16,
    alignItems: 'center',
    width: '85%',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  focusVerse: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 10,
    textShadowColor: '#3D0066',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  verseRange: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 28,
    textAlign: 'center',
  },
  verseRangeHeading: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 28,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  inspirationVerse: {
    fontSize: 22,
    color: '#fff',
    fontWeight: '600',
    marginBottom: 18,
    textAlign: 'center',
    lineHeight: 32,
    letterSpacing: 0.2,
  },
  passageScroll: {
    maxHeight: 320,
    width: '100%',
    marginBottom: 22,
    backgroundColor: 'rgba(60,30,90,0.10)',
    borderRadius: 8,
    paddingHorizontal: 6,
  },
  passageVerse: {
    color: '#fff',
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '400',
    paddingVertical: 6,
    textAlign: 'left',
  },
  divineChorusLabel: {
    color: '#FFDFA6',
    fontSize: 16,
    fontStyle: 'italic',
    fontWeight: '600',
    marginBottom: 7,
    letterSpacing: 0.4,
    textAlign: 'center',
    textShadowColor: '#322D6A',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  angelicVersesLabel: {
    color: '#A6C8FF',
    fontSize: 15,
    fontStyle: 'italic',
    fontWeight: '500',
    marginTop: 18,
    marginBottom: 7,
    letterSpacing: 0.3,
    textAlign: 'center',
    textShadowColor: '#2A004B',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  songTitle: {
    color: '#FFD700',
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 14,
    marginTop: 0,
    letterSpacing: 0.5,
    textShadowColor: '#3D0066',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 12,
    textTransform: 'capitalize',
  },
  passage: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 24,
    textAlign: 'left',
    width: '100%',
    lineHeight: 28,
    letterSpacing: 0.1,
    fontWeight: '400',
    paddingLeft: 4,
    paddingRight: 4,
  },
  closeBtn: {
    marginTop: 6,
    paddingVertical: 8,
    paddingHorizontal: 30,
    borderRadius: 8,
    backgroundColor: '#5A189A',
  },
  closeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SacredSoundOverlay;
