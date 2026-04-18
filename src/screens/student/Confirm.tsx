// src/screens/Confirm.tsx
import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal } from "react-native";
import { useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../constants/theme";
import { getFontFamily } from "../../../styles/fonts";

const Confirm = ({ navigation }: any) => {
  const route = useRoute<any>();
  const { roomcode, roomID, roomname, name, playername, email, words, word, difficulty, teacherId, createdBy } = route.params || {};
  const [modalVisible, setModalVisible] = useState(true);

  const handlePlay = () => {
    // Navigate before closing the modal so the transparent background
    // never flashes — the modal close is invisible during the transition.
    navigation.replace("PronunciationRoom", {
      roomData: {
        roomCode: roomcode,
        roomID: roomID,
        roomName: roomname,
        name,
        playername,
        email,
        words,
        word,
        difficulty: difficulty || "easy",
        teacherId: teacherId || createdBy || "",
        createdBy: teacherId || createdBy || "",
      },
    });
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.iconContainer}>
              <Ionicons name="enter-outline" size={36} color={COLORS.primary} />
            </View>

            <Text style={styles.modalTitle}>Confirm Room</Text>
            <Text style={styles.modalSubtitle}>Are you sure you want to enter this room?</Text>

            <View style={styles.roomInfoCard}>
              <View style={styles.roomInfoRow}>
                <Text style={styles.roomInfoLabel}>Room Name</Text>
                <Text style={styles.roomInfoValue}>{roomname}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.roomInfoRow}>
                <Text style={styles.roomInfoLabel}>Room Code</Text>
                <Text style={styles.roomInfoCode}>{roomcode}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.playButton} onPress={handlePlay}>
              <Ionicons name="play-circle" size={20} color={COLORS.white} />
              <Text style={styles.playText}>Enter Room</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Confirm;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: 24,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 24,
    width: "100%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: `${COLORS.primary}15`,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: getFontFamily('bold'),
    color: COLORS.primary,
    marginBottom: 8,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 14,
    fontFamily: getFontFamily('regular'),
    color: COLORS.gray[600],
    marginBottom: 20,
    textAlign: "center",
  },
  roomInfoCard: {
    width: "100%",
    backgroundColor: COLORS.gray[50],
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  roomInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.gray[200],
  },
  roomInfoLabel: {
    fontSize: 14,
    fontFamily: getFontFamily('regular'),
    color: COLORS.gray[500],
  },
  roomInfoValue: {
    fontSize: 14,
    fontFamily: getFontFamily('semibold'),
    color: COLORS.black,
    flex: 1,
    textAlign: "right",
  },
  roomInfoCode: {
    fontSize: 16,
    fontFamily: getFontFamily('bold'),
    color: COLORS.primary,
    letterSpacing: 2,
  },
  playButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    width: "100%",
    gap: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  playText: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: getFontFamily('semibold'),
  },
  cancelButton: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  cancelText: {
    color: COLORS.gray[500],
    fontSize: 14,
    fontFamily: getFontFamily('medium'),
    textDecorationLine: "underline",
  },
});
