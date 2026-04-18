/**
 * ReaderLevelPanel
 *
 * Slide-in side panel that shows all reader levels with their status.
 * Students can navigate to any completed or current reader level.
 *
 * Status rules:
 *   locked      — above current level (gray, disabled)
 *   in_progress — current active level (blue, tappable)
 *   completed   — below current level (green, tappable — can revisit)
 */
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  ScrollView,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { getFontFamily } from '../../../styles/fonts';

// Re-exported so RegularRoom doesn't need to change its import line
export type MacroLevelStatus = 'locked' | 'in_progress' | 'completed';
export interface MacroLevelRecord {
  status: MacroLevelStatus;
  bestScore: number;
  microBestScores: Record<number, number>;
  completedAt?: string;
}

interface MacroLevelPanelProps {
  visible: boolean;
  onClose: () => void;
  /** Highest reader level ever reached — controls which levels are unlocked. */
  studentLevel: number;
  /** The reader level currently being practiced (may be lower than studentLevel). */
  activeLevel?: number;
  onNavigateReaderLevel: (readerLevel: number) => void;
}

const READER_LEVEL_LABELS: Record<number, string> = {
  1: 'Foundation',
  2: 'Developing',
  3: 'Proficient',
  4: 'Advanced',
};

const READER_LEVEL_COLORS: Record<number, string> = {
  1: '#4CAF50',
  2: '#2196F3',
  3: '#FF9800',
  4: '#9C27B0',
};

export function MacroLevelPanel({
  visible,
  onClose,
  studentLevel,
  activeLevel,
  onNavigateReaderLevel,
}: MacroLevelPanelProps) {
  const currentLevel = activeLevel ?? studentLevel;
  const slideAnim = useRef(new Animated.Value(-320)).current;

  useEffect(() => {
    slideAnim.stopAnimation();
    Animated.timing(slideAnim, {
      toValue: visible ? 0 : -320,
      duration: 280,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  const handleNavigate = (level: number) => {
    if (level > studentLevel) return; // locked
    onNavigateReaderLevel(level);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <Pressable style={styles.backdrop} onPress={onClose} />

      {/* Panel */}
      <Animated.View style={[styles.panel, { transform: [{ translateX: slideAnim }] }]}>
        {/* Header */}
        <View style={styles.panelHeader}>
          <Text style={styles.panelTitle}>Reader Levels</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} accessibilityLabel="Close panel">
            <Ionicons name="close" size={22} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        <Text style={styles.subtext}>Tap a completed level to revisit and improve your score.</Text>

        <ScrollView style={styles.levelList} showsVerticalScrollIndicator={false}>
          {[1, 2, 3, 4].map((level) => {
            const isCurrent = level === currentLevel;
            // "Done" only when the next level has been unlocked (proved completion)
            const isDone = level < studentLevel;
            // "In Progress" when it's the furthest reached but the next level is still locked
            const isHighest = level === studentLevel && level !== currentLevel;
            const isLocked = level > studentLevel;
            const color = READER_LEVEL_COLORS[level];

            return (
              <TouchableOpacity
                key={level}
                style={[
                  styles.levelCard,
                  isCurrent && styles.levelCardCurrent,
                  isDone && styles.levelCardCompleted,
                  isHighest && styles.levelCardCurrent,
                  isLocked && styles.levelCardLocked,
                ]}
                onPress={() => handleNavigate(level)}
                disabled={isLocked}
                activeOpacity={isLocked ? 1 : 0.75}
              >
                {/* Color accent bar */}
                <View style={[styles.accentBar, { backgroundColor: isLocked ? 'rgba(255,255,255,0.1)' : color }]} />

                {/* Status icon */}
                <View style={[
                  styles.statusIcon,
                  isDone && { backgroundColor: '#4CAF50' },
                  (isCurrent || isHighest) && { backgroundColor: COLORS.primary },
                  isLocked && styles.statusIconLocked,
                ]}>
                  {isDone ? (
                    <Ionicons name="checkmark" size={16} color={COLORS.white} />
                  ) : isLocked ? (
                    <Ionicons name="lock-closed" size={13} color="rgba(255,255,255,0.35)" />
                  ) : (
                    <Ionicons name="play" size={14} color={COLORS.white} />
                  )}
                </View>

                {/* Level info */}
                <View style={styles.levelInfo}>
                  <View style={styles.levelTitleRow}>
                    <Text style={[styles.levelName, isLocked && styles.textDim]}>
                      Reader Level {level}
                    </Text>
                    {isCurrent && (
                      <View style={[styles.badge, { backgroundColor: COLORS.primary }]}>
                        <Text style={styles.badgeText}>Current</Text>
                      </View>
                    )}
                    {isHighest && (
                      <View style={[styles.badge, { backgroundColor: COLORS.primary }]}>
                        <Text style={styles.badgeText}>In Progress</Text>
                      </View>
                    )}
                    {isDone && (
                      <View style={[styles.badge, { backgroundColor: '#4CAF50' }]}>
                        <Text style={styles.badgeText}>Done</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.levelLabel, isLocked && styles.textDimmer]}>
                    {READER_LEVEL_LABELS[level]}
                  </Text>
                </View>

                {/* Right indicator */}
                {!isLocked && (
                  <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.4)" />
                )}
                {isLocked && (
                  <Ionicons name="lock-closed-outline" size={18} color="rgba(255,255,255,0.2)" />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.panelFooter}>
          <Text style={styles.footerHint}>
            Complete a reader level to unlock the next one.
          </Text>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  panel: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 300,
    backgroundColor: '#1A0A3E',
    paddingTop: 56,
    paddingBottom: 32,
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 16,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  panelTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
    fontFamily: getFontFamily('bold'),
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtext: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    fontFamily: getFontFamily('regular'),
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  levelList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  levelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  levelCardCurrent: {
    backgroundColor: 'rgba(140,82,255,0.22)',
    borderColor: COLORS.primary,
  },
  levelCardCompleted: {
    backgroundColor: 'rgba(76,175,80,0.12)',
    borderColor: 'rgba(76,175,80,0.35)',
  },
  levelCardLocked: {
    opacity: 0.4,
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
  },
  statusIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginLeft: 8,
  },
  statusIconLocked: {
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  levelInfo: {
    flex: 1,
  },
  levelTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  levelName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.white,
    fontFamily: getFontFamily('bold'),
  },
  levelLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.55)',
    fontFamily: getFontFamily('regular'),
    marginTop: 2,
  },
  textDim: {
    color: 'rgba(255,255,255,0.4)',
  },
  textDimmer: {
    color: 'rgba(255,255,255,0.22)',
  },
  badge: {
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.white,
    fontFamily: getFontFamily('bold'),
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  panelFooter: {
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  footerHint: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    fontFamily: getFontFamily('regular'),
    textAlign: 'center',
    lineHeight: 18,
  },
});
