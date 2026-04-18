// src/teacher/ModifyPronunciation.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  Alert,
  TouchableOpacity,
  Modal,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useRoute } from "@react-navigation/native";
import { supabase, auth } from "../../services/supabase";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../constants/theme";
import { ScreenLayout } from "../../components/ScreenLayout";
import { getFontFamily } from "../../../styles/fonts";

export default function ModifyPronunciation() {
  const route = useRoute<any>();
  const { roomId } = route.params;

  const [pronunciations, setPronunciations] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [updatedWord, setUpdatedWord] = useState("");
  const [updatedDifficulty, setUpdatedDifficulty] = useState("easy");

  const [filter, setFilter] = useState<string | null>(null);
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const loadWords = async () => {
      let query = supabase
        .from('pronunciation_words')
        .select('*')
        .eq('room_id', roomId)
        .eq('created_by', user.id);
      if (filter) query = query.eq('difficulty', filter);
      const { data } = await query;
      setPronunciations(data ?? []);
    };
    loadWords();

    const channel = supabase
      .channel('pronunciation_words_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pronunciation_words', filter: `room_id=eq.${roomId}` }, loadWords)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [roomId, filter]);

  const handleUpdate = async () => {
    if (!updatedWord || !updatedDifficulty) {
      Alert.alert("Error", "Please fill in both fields.");
      return;
    }
    try {
      await supabase
        .from('pronunciation_words')
        .update({ word: updatedWord, difficulty: updatedDifficulty })
        .eq('id', editingId!);
      Alert.alert("Updated", "Word updated successfully.");
      setEditingId(null);
    } catch (err) {
      Alert.alert("Error", "Failed to update word. Please check your connection and try again.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await supabase.from('pronunciation_words').delete().eq('id', id);
      Alert.alert("Deleted", "Word deleted successfully.");
    } catch (err) {
      Alert.alert("Error", "Failed to delete word. Please check your connection and try again.");
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    if (difficulty === "easy") return "#4CAF50";
    if (difficulty === "medium") return "#FF9800";
    return "#F44336";
  };

  return (
    <ScreenLayout>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Pronunciation Words</Text>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilter(!showFilter)}
        >
          <Ionicons name="filter" size={20} color="#374151" />
          <Text style={styles.filterButtonText}>
            {filter ? filter.charAt(0).toUpperCase() + filter.slice(1) : "All"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filter Dropdown */}
      {showFilter && (
        <View style={styles.filterContainer}>
          <Picker
            selectedValue={filter}
            onValueChange={(value) => {
              setFilter(value);
              setShowFilter(false);
            }}
            style={styles.picker}
          >
            <Picker.Item label="All" value={null} />
            <Picker.Item label="Easy" value="easy" />
            <Picker.Item label="Medium" value="medium" />
            <Picker.Item label="Hard" value="hard" />
          </Picker>
        </View>
      )}

      <FlatList
        data={pronunciations}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardContent}>
              <Text style={styles.word}>{item.word}</Text>
              <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(item.difficulty) }]}>
                <Text style={styles.difficultyText}>{item.difficulty}</Text>
              </View>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => {
                  setEditingId(item.id);
                  setUpdatedWord(item.word);
                  setUpdatedDifficulty(item.difficulty);
                }}
              >
                <Ionicons name="pencil" size={16} color="white" />
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDelete(item.id)}
              >
                <Ionicons name="trash" size={16} color="white" />
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="mic-off-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyText}>No words added yet</Text>
          </View>
        }
      />

      {/* Edit Modal */}
      <Modal
        visible={editingId !== null}
        animationType="slide"
        transparent
        onRequestClose={() => setEditingId(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Pronunciation</Text>
              <TouchableOpacity onPress={() => setEditingId(null)}>
                <Ionicons name="close" size={24} color={COLORS.primary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Word</Text>
            <TextInput
              style={[styles.input, { fontFamily: getFontFamily('regular') }]}
              value={updatedWord}
              onChangeText={setUpdatedWord}
              placeholder="Word to pronounce"
            />

            <Text style={styles.inputLabel}>Difficulty</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={updatedDifficulty}
                onValueChange={(value) => setUpdatedDifficulty(value)}
              >
                <Picker.Item label="Easy" value="easy" />
                <Picker.Item label="Medium" value="medium" />
                <Picker.Item label="Hard" value="hard" />
              </Picker>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.saveButton} onPress={handleUpdate}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setEditingId(null)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 20,
  },
  title: {
    fontSize: 20,
    fontFamily: getFontFamily('semibold'),
    color: "#111827",
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterButtonText: {
    fontSize: 14,
    fontFamily: getFontFamily('medium'),
    color: "#111827",
  },
  filterContainer: {
    marginHorizontal: 20,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
  },
  picker: {
    color: "#111827",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 12,
  },
  card: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  word: {
    fontSize: 18,
    fontFamily: getFontFamily('semibold'),
    color: "#111827",
    flex: 1,
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginLeft: 12,
  },
  difficultyText: {
    fontSize: 12,
    fontFamily: getFontFamily('semibold'),
    color: "white",
    textTransform: "capitalize",
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.tertiary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  editButtonText: {
    fontSize: 13,
    fontFamily: getFontFamily('medium'),
    color: "white",
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F44336",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  deleteButtonText: {
    fontSize: 13,
    fontFamily: getFontFamily('medium'),
    color: "white",
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: "center",
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: getFontFamily('medium'),
    color: "#9CA3AF",
    textAlign: "center",
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    width: "100%",
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: getFontFamily('bold'),
    color: COLORS.primary,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: getFontFamily('medium'),
    color: COLORS.gray[700],
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
    color: COLORS.black,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    borderRadius: 10,
    marginBottom: 20,
    overflow: "hidden",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  saveButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    fontSize: 15,
    fontFamily: getFontFamily('semibold'),
    color: "white",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: COLORS.gray[200],
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    fontSize: 15,
    fontFamily: getFontFamily('semibold'),
    color: COLORS.gray[700],
  },
});
