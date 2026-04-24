import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../services/supabase";
import { COLORS } from "../../constants/theme";
import { ScreenLayout } from "../../components/ScreenLayout";
import { getFontFamily } from "../../../styles/fonts";

export default function CreateGameRoom({ navigation }: any) {
  const [roomName, setRoomName] = useState("");
  const [creatorName, setCreatorName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [quizId, setQuizId] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const fetchTeacherName = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user ?? null;
      if (!user) return;

      try {
        const { data: teacherRow } = await supabase
          .from('teacher_accounts')
          .select('name')
          .eq('id', user.id)
          .single();
        setCreatorName(teacherRow?.name || user.email || "Unknown Teacher");
      } catch (err) {
        setCreatorName(user.email || "Unknown Teacher");
      }
    };

    fetchTeacherName();
  }, []);

  const generateCode = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    try {
      const generateRandom = () => Math.random().toString(36).substring(2, 8).toUpperCase();
      let code = '';
      let unique = false;

      for (let attempts = 0; attempts < 5; attempts++) {
        const candidate = generateRandom();
        const { data: existing } = await supabase
          .from('game_rooms')
          .select('id')
          .eq('room_code', candidate);
        if (!existing || existing.length === 0) {
          code = candidate;
          unique = true;
          break;
        }
      }

      if (!unique) {
        Alert.alert('Error', 'Could not generate a unique room code. Please try again.');
        return;
      }

      const generatedQuizId = Math.random().toString(36).substring(2, 10);
      setRoomCode(code);
      setQuizId(generatedQuizId);
    } catch (err) {
      Alert.alert('Error', 'Could not generate a room code. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const saveRoom = async () => {
    if (!roomName || !creatorName || !roomCode || !quizId) {
      Alert.alert("Error", "Please fill in all fields and generate a code.");
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user ?? null;
      if (!user) {
        Alert.alert("Error", "You must be logged in.");
        return;
      }

      const { data: teacherRow } = await supabase
        .from('teacher_accounts')
        .select('id')
        .eq('id', user.id)
        .single();
      if (!teacherRow) {
        Alert.alert("Access Denied", "Only teachers can create rooms.");
        return;
      }

      const { data: newRoom, error: insertError } = await supabase
        .from('game_rooms')
        .insert({
          room_name: roomName,
          creator_name: creatorName,
          room_code: roomCode,
          quiz_id: quizId,
          created_by: user.id,
          creator_email: user.email,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      Alert.alert(
        "Success",
        `Room "${roomName}" created successfully!`,
        [
          {
            text: "OK",
            onPress: () => {
              navigation.navigate("Room", {
                roomId: newRoom?.id,
                roomName,
                creatorName,
                roomCode,
                quizId,
              });
            },
          },
        ]
      );

      setRoomName("");
      setRoomCode("");
      setQuizId("");
    } catch (err: any) {
      Alert.alert("Error", "Could not save room. Try again.");
    }
  };

  return (
    <ScreenLayout noPadding>
      {/* Gradient Header */}
      <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Room</Text>
        <View style={styles.headerSpacer} />
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Icon + Title */}
        <View style={styles.formHeader}>
          <View style={styles.iconContainer}>
            <LinearGradient colors={[COLORS.primary, COLORS.secondary]} style={styles.iconGradient}>
              <Ionicons name="home" size={30} color="white" />
            </LinearGradient>
          </View>
          <Text style={styles.formTitle}>New Pronunciation Room</Text>
          <Text style={styles.formSubtitle}>Create a space for students to practice their pronunciation</Text>
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          {/* Room Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Room Name</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="text-outline" size={20} color={COLORS.primary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="e.g. Grade 3 – Section A"
                placeholderTextColor="#9CA3AF"
                value={roomName}
                onChangeText={setRoomName}
              />
            </View>
          </View>

          {/* Created By */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Created By</Text>
            <View style={[styles.inputWrapper, styles.inputDisabled]}>
              <Ionicons name="person-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.inputTextDisabled]}
                value={creatorName}
                editable={false}
              />
              <Ionicons name="lock-closed-outline" size={16} color="#D1D5DB" />
            </View>
          </View>

          {/* Room Code */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Room Code</Text>
            <View style={styles.codeRow}>
              <View style={styles.codeDisplay}>
                <Ionicons name="key-outline" size={20} color={roomCode ? COLORS.primary : '#9CA3AF'} />
                <Text style={[styles.codeText, !roomCode && styles.codeTextPlaceholder]}>
                  {roomCode || '——————'}
                </Text>
              </View>
              <TouchableOpacity style={styles.generateButton} onPress={generateCode} disabled={isGenerating}>
                <Ionicons name="refresh" size={18} color="white" />
                <Text style={styles.generateButtonText}>Generate</Text>
              </TouchableOpacity>
            </View>
            {roomCode ? (
              <View style={styles.codeHint}>
                <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                <Text style={styles.codeHintText}>Code generated — share this with students</Text>
              </View>
            ) : (
              <Text style={styles.codeHintText}>Tap Generate to create a unique room code</Text>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <TouchableOpacity style={styles.saveButton} onPress={saveRoom}>
          <Ionicons name="checkmark-circle" size={22} color="white" />
          <Text style={styles.saveButtonText}>Create Room</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate("Room")}>
          <Ionicons name="list-outline" size={20} color="#374151" />
          <Text style={styles.secondaryButtonText}>View All Rooms</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: getFontFamily('bold'),
    color: 'white',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 40,
  },
  formHeader: {
    alignItems: 'center',
    marginBottom: 28,
  },
  iconContainer: {
    marginBottom: 16,
  },
  iconGradient: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formTitle: {
    fontSize: 22,
    fontFamily: getFontFamily('bold'),
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  formSubtitle: {
    fontSize: 14,
    fontFamily: getFontFamily('regular'),
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  formCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: getFontFamily('semibold'),
    color: '#374151',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  inputDisabled: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: getFontFamily('medium'),
    color: '#111827',
    paddingVertical: 14,
  },
  inputTextDisabled: {
    color: '#9CA3AF',
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  codeDisplay: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  codeText: {
    fontSize: 18,
    fontFamily: getFontFamily('bold'),
    color: '#111827',
    letterSpacing: 3,
  },
  codeTextPlaceholder: {
    color: '#D1D5DB',
    letterSpacing: 4,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 6,
  },
  generateButtonText: {
    fontSize: 14,
    fontFamily: getFontFamily('semibold'),
    color: 'white',
  },
  codeHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  codeHintText: {
    fontSize: 12,
    fontFamily: getFontFamily('regular'),
    color: '#9CA3AF',
    marginTop: 4,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 16,
    paddingVertical: 16,
    gap: 10,
    marginBottom: 12,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonText: {
    fontSize: 17,
    fontFamily: getFontFamily('bold'),
    color: 'white',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    paddingVertical: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  secondaryButtonText: {
    fontSize: 15,
    fontFamily: getFontFamily('medium'),
    color: '#374151',
  },
});
