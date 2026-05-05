/**
 * WordFeedbackCard
 *
 * Displays per-word pronunciation feedback for a mispronounced word:
 *   - The word itself (highlighted red)
 *   - IPA transcription  (e.g. /noʊdz/)
 *   - Simplified pronunciation guide (e.g. "nohdz")
 *   - Audio button that plays the correct TTS pronunciation
 *
 * Only rendered for incorrect words — callers should filter before use.
 */
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import { COLORS } from '../../constants/theme';
import { getFontFamily } from '../../../styles/fonts';
import { getPronunciation } from '../../utils/pronunciationUtils';
interface PhonemeResult {
  phoneme: string;
  accuracyScore: number;
}

interface WordFeedbackCardProps {
  word: string;
  phonemes?: PhonemeResult[];
  accuracyScore?: number;
}

export function WordFeedbackCard({ word, phonemes, accuracyScore }: WordFeedbackCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const { ipa, simplified, fromDictionary } = getPronunciation(word);

  // Phonemes that scored below 70 — these are the sounds the student got wrong
  const badPhonemes = phonemes?.filter(p => p.accuracyScore < 70) ?? [];

  const handlePlay = useCallback(async () => {
    if (isPlaying) return;

    // Brief press animation
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.88, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();

    setIsPlaying(true);
    try { Speech.stop(); } catch { /* ignore: nothing playing on Android */ }

    // Force speaker output before every TTS call — recording mode leaves iOS
    // audio routed through the earpiece (very quiet) until explicitly reset.
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: false,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: false,
      });
    } catch (err) { console.warn('[WordFeedbackCard] audio mode setup failed:', err); }

    Speech.speak(word, {
      language: 'en-US',
      pitch: 1.0,
      rate: 0.72,
      volume: 1.0,
      onDone: () => setIsPlaying(false),
      onStopped: () => setIsPlaying(false),
      onError: () => setIsPlaying(false),
    });
  }, [word, isPlaying, scaleAnim]);

  return (
    <View style={styles.card}>
      {/* Left: word + pronunciation guide + phoneme breakdown */}
      <View style={styles.textBlock}>
        <View style={styles.wordRow}>
          <Text style={styles.word}>{word}</Text>
          {accuracyScore !== undefined && (
            <Text style={[styles.wordScore, { color: accuracyScore >= 80 ? '#FF9800' : '#FF5252' }]}>
              {accuracyScore}%
            </Text>
          )}
        </View>

        {fromDictionary && (
          <View style={styles.guideRow}>
            <Text style={styles.ipaLabel}>IPA </Text>
            <Text style={styles.ipaText}>{ipa}</Text>
          </View>
        )}

        <View style={styles.guideRow}>
          <Text style={styles.simplifiedLabel}>Say </Text>
          <Text style={styles.simplifiedText}>"{simplified}"</Text>
        </View>

        {badPhonemes.length > 0 && (
          <View style={styles.phonemeRow}>
            <Text style={styles.phonemeLabel}>Hard sounds: </Text>
            {badPhonemes.map((p, i) => (
              <View key={i} style={styles.phonemeBadge}>
                <Text style={styles.phonemeText}>/{p.phoneme}/</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Right: audio button */}
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          style={[styles.audioButton, isPlaying && styles.audioButtonActive]}
          onPress={handlePlay}
          activeOpacity={0.8}
          accessibilityLabel={`Tap to hear pronunciation of ${word}`}
          accessibilityRole="button"
        >
          <Ionicons
            name={isPlaying ? 'volume-high' : 'volume-medium-outline'}
            size={20}
            color={isPlaying ? COLORS.white : COLORS.primary}
          />
          {!isPlaying && (
            <Text style={styles.tapHint}>Tap to hear</Text>
          )}
          {isPlaying && (
            <Text style={[styles.tapHint, styles.tapHintActive]}>Playing…</Text>
          )}
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 82, 82, 0.25)',
  },
  textBlock: {
    flex: 1,
    marginRight: 12,
  },
  wordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  word: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF5252',
    fontFamily: getFontFamily('bold'),
  },
  wordScore: {
    fontSize: 13,
    fontFamily: getFontFamily('semibold'),
  },
  phonemeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 4,
    gap: 4,
  },
  phonemeLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    fontFamily: getFontFamily('regular'),
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  phonemeBadge: {
    backgroundColor: 'rgba(255, 82, 82, 0.2)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 82, 82, 0.4)',
  },
  phonemeText: {
    fontSize: 12,
    color: '#FF8A80',
    fontFamily: getFontFamily('regular'),
  },
  guideRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  ipaLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    fontFamily: getFontFamily('regular'),
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  ipaText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
    fontFamily: getFontFamily('regular'),
    // IPA symbols render best in a monospace/serif-friendly font; fallback is fine
  },
  simplifiedLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    fontFamily: getFontFamily('regular'),
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  simplifiedText: {
    fontSize: 14,
    color: '#FFD54F',
    fontFamily: getFontFamily('semibold'),
  },
  audioButton: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.white,
    gap: 2,
  },
  audioButtonActive: {
    backgroundColor: COLORS.primary,
  },
  tapHint: {
    fontSize: 9,
    color: COLORS.primary,
    fontFamily: getFontFamily('regular'),
    textAlign: 'center',
    lineHeight: 11,
  },
  tapHintActive: {
    color: COLORS.white,
  },
});
