import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface AssessmentIntroProps {
  onStartAssessment: () => void;
}

export default function AssessmentIntro({ onStartAssessment }: AssessmentIntroProps) {
  return (
    <View style={styles.assessmentIntro}>
      <Ionicons name="school" size={64} color="rgba(255, 255, 255, 0.8)" />
      <Text style={styles.assessmentTitle}>Reader Level Assessment</Text>
      <Text style={styles.assessmentDescription}>
        We'll help you find your Reader Level by having you read four passages 
        of increasing difficulty. Each passage represents a different level of vocabulary and complexity. 
        This assessment helps us customize your learning experience.
      </Text>
      
      <View style={styles.assessmentFeatures}>
        <View style={styles.featureItem}>
          <Ionicons name="library" size={20} color="#ffffff" />
          <Text style={styles.featureText}>4 passages to read</Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="trending-up" size={20} color="#ffffff" />
          <Text style={styles.featureText}>Determines Reader Level 1-4</Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
          <Text style={styles.featureText}>Customizes content difficulty</Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="school" size={20} color="#ffffff" />
          <Text style={styles.featureText}>40 points total scoring</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.startAssessmentButton} onPress={onStartAssessment}>
        <LinearGradient colors={['#4CAF50', '#66BB6A']} style={styles.buttonGradient}>
          <Text style={styles.startAssessmentText}>Start Assessment</Text>
          <Ionicons name="arrow-forward" size={20} color="#ffffff" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  assessmentIntro: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  assessmentTitle: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: "#ffffff",
    marginTop: 24,
    marginBottom: 16,
    textAlign: "center" as const,
  },
  assessmentDescription: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center" as const,
    lineHeight: 24,
    marginBottom: 40,
  },
  assessmentFeatures: {
    marginBottom: 40,
  },
  featureItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginBottom: 12,
  },
  featureText: {
    fontSize: 16,
    color: "#ffffff",
    marginLeft: 12,
  },
  startAssessmentButton: {
    borderRadius: 25,
    overflow: "hidden" as const,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonGradient: {
    borderRadius: 25,
    paddingVertical: 16,
    paddingHorizontal: 32,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  startAssessmentText: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#ffffff",
    marginRight: 12,
  },
});