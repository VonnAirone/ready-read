import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { supabase, auth } from "../../services/supabase";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../constants/theme";
import { ScreenLayout } from "../../components/ScreenLayout";
import { getFontFamily } from "../../../styles/fonts";

const MAX_PLAYER_NAME_LENGTH = 30;

export default function SetupPlayerProfile({ navigation }: any) {
  const [playerName, setPlayerName] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [isExisting, setIsExisting] = useState(false);
  const [loading, setLoading] = useState(true);
  const navTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const user = session?.user ?? null;
      if (user) {
        setUserId(user.id);
        setEmail(user.email ?? null);

        try {
          const { data: playerRow } = await supabase
            .from('player_names')
            .select('player_name')
            .eq('id', user.id)
            .single();

          if (playerRow?.player_name) {
            setPlayerName(playerRow.player_name);
            setIsExisting(true);
            navTimeoutRef.current = setTimeout(() => {
              navigation.replace("StudentTabs");
            }, 1000);
            return;
          }
        } catch (err) {
          console.warn('[SetupPlayerProfile] failed to check existing player name:', err);
        }

        setLoading(false);
      } else {
        setUserId(null);
        setEmail(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
      if (navTimeoutRef.current) clearTimeout(navTimeoutRef.current);
    };
  }, [navigation]);

  const handleSave = async () => {
    const trimmed = playerName.trim();
    if (!trimmed) {
      Alert.alert("Error", "Please enter a valid player name.");
      return;
    }
    if (trimmed.length > MAX_PLAYER_NAME_LENGTH) {
      Alert.alert("Error", `Player name must be ${MAX_PLAYER_NAME_LENGTH} characters or fewer.`);
      return;
    }
    if (!userId || !email) return;

    setSaving(true);
    try {
      const { error: nameError } = await supabase.from('player_names').upsert({
        id: userId,
        player_name: trimmed,
        email,
      });
      if (nameError) throw nameError;

      try {
        const { error: accountError } = await supabase.from('student_accounts').upsert({
          id: userId,
          role: 'student',
          player_name: trimmed,
          email,
        });
        if (accountError) throw accountError;
      } catch (_roleError: any) {
        Alert.alert("Error", "Failed to create your account. Please try again.");
        return;
      }

      navigation.replace("StudentTabs");
    } catch (error: any) {
      Alert.alert("Error", "Failed to save player name. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleBackToLogin = async () => {
    try {
      await supabase.auth.signOut();
      navigation.replace("Login");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const handleEdit = () => {
    setIsExisting(false); // ✅ allow editing again
  };

  return (
    <ScreenLayout>
        {loading ? (
          // Loading state while checking for existing player name
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Checking player profile...</Text>
          </View>
        ) : (
          <>
            <View style={styles.topBar}>
              <TouchableOpacity onPress={handleBackToLogin} style={styles.backButton}>
                <Ionicons name="arrow-back" size={15} style={styles.backButtonIcon}/>
                <Text style={styles.backButtonText}>Back to Login</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.content}>
              <View style={styles.modalPanel}>
                <Text style={styles.title}>
                  {isExisting ? "Enter Name" : "Create Your Player Name"}
                </Text>

                <TextInput
                  style={[
                    styles.input,
                    isExisting && { color: "#bbb" },
                  ]}
                  placeholder="Enter player name"
                  placeholderTextColor="#ccc"
                  value={playerName}
                  onChangeText={(text) =>
                    setPlayerName(text.replace(/[^a-zA-Z ]/g, ""))
                  }
                  autoCapitalize="words"
                  editable={!isExisting}
                />

                <TouchableOpacity
                  style={[styles.continueButton, saving && { opacity: 0.7 }]}
                  onPress={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator color="#1c1c1c" />
                  ) : (
                    <Text style={styles.continueText}>Continue</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  topBar: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: '#374151',
    fontSize: 16,
    marginTop: 12,
    fontFamily: getFontFamily('regular'),
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignSelf: "flex-start",
  },
  backButtonIcon: {
    color: '#374151',
  },
  backButtonText: {
    fontSize: 16,
    color: '#374151',
    fontFamily: getFontFamily('medium'),
  },
  modalPanel: {
    width: "100%",
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 1,
  },
  title: {
    fontSize: 22,
    marginBottom: 20,
    textAlign: "center",
    color: COLORS.primary,
    fontFamily: getFontFamily('medium'),
  },
  input: {
    width: "100%",
    fontSize: 16,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: "#fafafa",
    fontFamily: getFontFamily('regular'),
    minHeight: 48,
  },
  continueButton: {
    width: "100%",
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  continueText: { 
    color: "#fff", 
    fontSize: 16, 
    fontFamily: getFontFamily('regular'),
  }
});
