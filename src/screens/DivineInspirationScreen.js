import React from 'react';
import { useRandomPassageCommentary } from '../hooks/useRandomPassageCommentary';
import { StatusBar } from 'expo-status-bar';
import MysticalHomeBackground from '../components/MysticalHomeBackground';
import ScrollWornEdgesCommentary from '../components/ScrollWornEdgesCommentary';
import GoldBubbleBackground from '../components/GoldBubbleBackground';
import { SafeAreaView, Text, StyleSheet, View, ActivityIndicator, ScrollView, TouchableOpacity, Modal } from 'react-native';
import GetInspiredRadioButton from '../components/GetInspiredRadioButton';
import apiConfig from '../config/api';
import { BIBLE_STRUCTURE } from '../utils/bibleStructure';
import { getVerse, getChapter } from '../utils/bibleText';

function getRandomPassage() {
  // Pick random book
  const books = Object.keys(BIBLE_STRUCTURE);
  const book = books[Math.floor(Math.random() * books.length)];
  const { chapters, verses } = BIBLE_STRUCTURE[book];
  // Pick random chapter
  const chapterIdx = Math.floor(Math.random() * chapters);
  const chapter = chapterIdx + 1;
  const numVerses = verses[chapterIdx];
  // Pick random starting verse (so that at least 3–5 verses fit)
  const passageLength = Math.floor(Math.random() * 3) + 3; // 3–5 verses
  const maxStart = Math.max(1, numVerses - passageLength + 1);
  const startVerse = Math.floor(Math.random() * maxStart) + 1;
  const endVerse = Math.min(startVerse + passageLength - 1, numVerses);
  return { book, chapter, startVerse, endVerse };
}

const DivineInspirationScreen = ({ navigation }) => {
  const {
    passage,
    getNewPassage,
    commentary,
    commentaryLoading,
    commentaryError,
    showReasoning,
    setShowReasoning,
    showCommentaryModal,
    setShowCommentaryModal,
    refresh,
    refreshFromGlobal,
  } = useRandomPassageCommentary();

  // Defensive: get commentary string for rendering
  const commentaryText = commentary && commentary.commentary ? commentary.commentary : null;

  return (
    <SafeAreaView style={styles.container}>
      <MysticalHomeBackground />
      <StatusBar style="light" backgroundColor="transparent" translucent={true} />
      
      {!passage && (
        <View style={{ marginTop: -30, alignItems: 'center', width: '100%' }}>
          <Text style={styles.subtitle}>Tap below for a random, contextually cohesive passage:</Text>
        </View>
      )}
      {passage && (
        <View style={[styles.invocationCard, styles.contentSpacing]}>
          <ScrollView style={styles.invocationContentScroll} contentContainerStyle={{alignItems: 'center'}}>
            <Text style={styles.inspirationLabel}>Inspiration Verse</Text>
            <Text style={styles.invocationRef}>
              {passage.book} {passage.chapter}:{passage.anchorVerse}
            </Text>
            <Text style={styles.invocationText}>{passage.anchorVerseText}</Text>
            {commentaryError && <Text style={styles.error}>{commentaryError}</Text>}
            
          </ScrollView>
        </View>
      )}
      <View style={[{ marginTop: 0, width: '100%', alignItems: 'center' }, styles.contentSpacing]}>
        <GetInspiredRadioButton
          selected={!passage && !commentary && !commentaryLoading}
          onPress={getNewPassage}
          loading={commentaryLoading}
          label="Get Inspired!"
        />
      </View>
      <View style={styles.spacer} />
      {commentaryLoading && <ActivityIndicator size="large" color="#888" />}
      <>

        {passage && (
          <View style={[styles.illuminationCard, styles.contentSpacing]}>
            <ScrollView style={styles.illuminationContentScroll}>
              <Text style={styles.illuminationLabel}>Contextual Illumination</Text>
              {Array.isArray(passage.verses) && passage.verses.length > 0 ? (
                <>
                  <Text style={styles.illuminationRef}>
                    {passage.book} {passage.chapter}:{passage.verses[0]?.num}
                    {passage.verses.length > 1 ? `-${passage.verses[passage.verses.length-1]?.num}` : ''}
                  </Text>
                  {passage.verses.map((v, idx) => (
                    <Text key={idx} style={styles.illuminationText}>
                      <Text style={{fontWeight: 'bold'}}>{v.num} </Text>{v.text}
                    </Text>
                  ))}
                </>
              ) : commentaryLoading ? (
                <ActivityIndicator size="small" color="#888" style={{marginTop: 12}} />
              ) : (
                <Text style={styles.illuminationText}>Loading passage...</Text>
              )}
              {/* Reasoning/Reflection is not present in the new hook, but you can add it if available in commentary */}
              {/* Example: {commentary && commentary.reasoning && (
                <TouchableOpacity onPress={() => setShowReasoning(r => !r)}>
                  <Text style={styles.reflectionToggle}>{showReasoning ? 'Hide Reflection' : 'Show Reflection'}</Text>
                </TouchableOpacity>
              )} */}
            </ScrollView>
          </View>
        )}
        {passage && commentary && (
          <TouchableOpacity
            style={styles.mysticalTextButton}
            onPress={() => setShowCommentaryModal(true)}
            accessibilityRole="button"
            accessibilityLabel="Get Mystical Interpretation"
          >
            <Text style={styles.mysticalTextButtonText}>Get Mystical Interpretation</Text>
          </TouchableOpacity>
        )}
        
        <Modal
          animationType="slide"
          transparent={true}
          visible={showCommentaryModal}
          onRequestClose={() => setShowCommentaryModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, {flexDirection: 'column', justifyContent: 'space-between'}]}>
              <ScrollWornEdgesCommentary style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', zIndex: 0 }} width={340} height={510} />
              <ScrollView contentContainerStyle={{paddingVertical: 24, flexGrow: 1}} style={{width: '100%', zIndex: 1}}>
                <Text style={[styles.illuminationLabel, {fontSize: 20, textAlign: 'center', marginBottom: 8}]}>Mystical Interpretation</Text>
                <Text style={[styles.illuminationRef, {fontSize: 16, textAlign: 'center', marginBottom: 12, color: '#4b3ca7', fontWeight: 'bold'}]}>
  {passage && passage.book} {passage && passage.chapter}
  {passage && passage.startVerse && passage.endVerse && passage.startVerse !== passage.endVerse
    ? `:${passage.startVerse}-${passage.endVerse} (Focus: ${passage.anchorVerse})`
    : passage && passage.anchorVerse
      ? `:${passage.anchorVerse}`
      : ''}
</Text>
                <Text style={[styles.illuminationText, {fontSize: 22, lineHeight: 32, textAlign: 'center', marginVertical: 16}]}> 
                  {commentaryText}
                </Text>
              </ScrollView>
              <View style={{ alignItems: 'center', justifyContent: 'center', width: '100%', marginTop: 20, marginBottom: -10 }}>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowCommentaryModal(false)}
                  accessibilityLabel="Close commentary overlay"
                  activeOpacity={0.85}
                >
                  <GoldBubbleBackground width={140} height={48} borderRadius={24} style={{ position: 'absolute', left: 0, top: 0, zIndex: 0 }} />
                  <View style={{ position: 'absolute', left: 0, top: 0, width: 140, height: 48, alignItems: 'center', justifyContent: 'center', zIndex: 1, marginBottom: 10 }}>
                    <Text style={{
                      color: '#7a6334',
                      fontWeight: 'bold',
                      fontSize: 18,
                      textAlign: 'center',
                      letterSpacing: 0.5
                    }}>Close</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  invocationCard: {
    backgroundColor: 'rgba(60,0,80,0.72)', // Deep purple overlay
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'gold',
    padding: 20,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: 'gold',
    shadowOpacity: 0.13,
    shadowRadius: 10,
    elevation: 3,
    height: '33%', // Fixed height for top third
    minHeight: 180,
    maxHeight: 270,
    width: '100%',
    overflow: 'hidden',
  },
  invocationContentScroll: {
    flex: 1,
    width: '100%',
  },
  inspirationLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'gold',
    letterSpacing: 1,
    marginBottom: 6,
    fontFamily: 'serif',
  },
  invocationRef: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fffbe6',
    marginBottom: 4,
    fontFamily: 'serif',
  },
  invocationText: {
    fontSize: 20,
    color: '#ffe066',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 2,
    marginTop: 4,
    fontFamily: 'serif',
  },
  illuminationCard: {
    backgroundColor: 'rgba(255,251,230,0.97)', // Soft gold parchment
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'gold',
    padding: 16,
    marginBottom: 5,
    marginTop: 8,
    shadowColor: '#A889FF',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
    height: '67%', // Fixed height for bottom two-thirds
    minHeight: 220,
    maxHeight: 380,
    width: '100%',
    overflow: 'hidden',
  },
  illuminationContentScroll: {
    flex: 1,
    width: '100%',
  },
  illuminationLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#A889FF',
    marginBottom: 4,
    fontFamily: 'serif',
  },
  illuminationRef: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3D0066',
    marginBottom: 4,
    fontFamily: 'serif',
  },
  illuminationText: {
    fontSize: 16,
    color: '#3D0066',
    lineHeight: 23,
    marginBottom: 2,
    fontFamily: 'serif',
  },
  reflectionToggle: {
    color: '#6c63ff',
    fontWeight: 'bold',
    fontSize: 15,
    marginTop: 10,
    marginBottom: 2,
    textAlign: 'center',
  },
  reflectionText: {
    fontSize: 15,
    color: '#4a4a4a',
    fontStyle: 'italic',
    marginTop: 6,
    marginBottom: 2,
    textAlign: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2A004B', // Dark mystical purple
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    color: 'gold',
    fontFamily: 'serif', // Use Cardo/Spectral if available
    textShadowColor: '#3D0066',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#ffe066',
    textAlign: 'center',
    paddingHorizontal: 24,
    marginBottom: 12,
    fontFamily: 'serif',
  },
  spacer: {
    height: 16,
  },
  passageBox: {
    marginTop: 10,
    backgroundColor: 'rgba(255,251,230,0.97)', // Soft gold parchment
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'gold',
    width: '100%',
    flex: 1,
    minHeight: 300,
    maxHeight: 450,
    shadowColor: '#A889FF',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  passageReference: {
    fontWeight: 'bold',
    fontSize: 17,
    marginBottom: 8,
    color: 'gold',
    fontFamily: 'serif',
  },
  passageText: {
    fontSize: 17,
    color: '#3D0066',
    lineHeight: 24,
    fontFamily: 'serif',
  },
  error: {
    color: 'red',
    marginTop: 16,
    fontSize: 16,
  },
  mysticalButton: {
    backgroundColor: 'gold',
    borderRadius: 28,
    paddingVertical: 18,
    paddingHorizontal: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
    shadowColor: '#3D0066',
    shadowOpacity: 0.22,
    shadowRadius: 13,
    shadowOffset: { width: 0, height: 4 },
    elevation: 7,
  },
  mysticalButtonText: {
    color: '#3D0066',
    fontWeight: 'bold',
    fontSize: 20,
    letterSpacing: 1,
    textShadowColor: '#fffbe6',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    textAlign: 'center',
    fontFamily: 'serif',
  },
  mysticalTextButton: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  mysticalTextButtonText: {
    color: '#ffe066',
    fontWeight: 'bold',
    fontSize: 20,
    textAlign: 'center',
    fontFamily: 'serif',
    textShadowColor: '#3D0066',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    letterSpacing: 0.5,
  },
  contentSpacing: {
    marginTop: 0,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10,10,20,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#f5e4c3', // darker parchment base (matches Bible tab)
    borderRadius: 22,
    padding: 28,
    width: '92%',
    height: '95%',
    elevation: 10,
    borderWidth: 2,
    borderColor: '#8a6d3b', // deep brown edge
    shadowColor: '#3a1d00',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.38,
    shadowRadius: 18,
    alignSelf: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
});

export default DivineInspirationScreen;
