import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { db } from "../../services/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, GRADIENTS } from "../../constants/theme";
import { getFontFamily } from "../../../styles/fonts";

interface Student {
  id: string;
  playerName: string;
  readerLevel: number;
  macroLevel: number;
  userId: string;
  joinedAt?: any;
}

export default function RoomStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  
  const { roomId, roomName, roomCode } = route.params;

  useEffect(() => {
    if (!roomCode) return;

    // Query StudentProgress collection for students in this room
    const q = query(
      collection(db, "StudentProgress"),
      where("roomCode", "==", roomCode)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedStudents = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          playerName: data.playerName || "Unknown Player",
          readerLevel: data.readerLevel || 1,
          macroLevel: data.macroLevel || 1,
          userId: data.userId || "",
          joinedAt: data.joinedAt || null,
        };
      });
      
      // Sort by reader level (highest first), then by macro level
      fetchedStudents.sort((a, b) => {
        if (b.readerLevel !== a.readerLevel) {
          return b.readerLevel - a.readerLevel;
        }
        return b.macroLevel - a.macroLevel;
      });

      setStudents(fetchedStudents);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [roomCode]);

  const getReaderLevelLabel = (level: number) => {
    return `Reader Level ${level}`;
  };

  const getMacroLevelLabel = (level: number) => {
    return `Macro Level ${level}`;
  };

  const getLevelColor = (readerLevel: number) => {
    const colors = {
      1: "#4CAF50", // Green
      2: "#2196F3", // Blue
      3: "#FF9800", // Orange
      4: "#9C27B0", // Purple
    };
    return colors[readerLevel as keyof typeof colors] || "#666";
  };

  const renderStudent = ({ item, index }: { item: Student; index: number }) => (
    <View style={styles.studentCard}>
      <View
        style={styles.studentCardGradient}
      >
        <View style={styles.studentHeader}>
          <View style={styles.rankContainer}>
            <Text style={styles.rankNumber}>#{index + 1}</Text>
          </View>
          <View style={styles.studentInfo}>
            <Text style={styles.studentName} numberOfLines={1}>
              {item.playerName}
            </Text>
            <View style={styles.levelContainer}>
              <View style={[styles.levelBadge, { backgroundColor: getLevelColor(item.readerLevel) }]}>
                <Ionicons name="book" size={14} color="white" />
                <Text style={styles.levelText}>
                  {getReaderLevelLabel(item.readerLevel)}
                </Text>
              </View>
              <View style={styles.macroLevelBadge}>
                <Ionicons name="layers" size={14} color="rgba(255,255,255,0.8)" />
                <Text style={styles.macroLevelText}>
                  {getMacroLevelLabel(item.macroLevel)}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <LinearGradient colors={GRADIENTS.primary} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.title}>Students in Room</Text>
            <Text style={styles.subtitle}>{roomName}</Text>
          </View>
          <View style={styles.placeholder} />
        </View>

        {/* Room Info */}
        <View style={styles.roomInfoCard}>
          <View style={styles.roomInfoItem}>
            <Ionicons name="key" size={20} color="rgba(255,255,255,0.7)" />
            <Text style={styles.roomInfoText}>Code: {roomCode}</Text>
          </View>
          <View style={styles.roomInfoItem}>
            <Ionicons name="people" size={20} color="rgba(255,255,255,0.7)" />
            <Text style={styles.roomInfoText}>
              {students.length} Student{students.length !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>

        {/* Students List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="white" />
            <Text style={styles.loadingText}>Loading students...</Text>
          </View>
        ) : students.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="people-outline" size={80} color="rgba(255,255,255,0.6)" />
            </View>
            <Text style={styles.emptyTitle}>No Students Yet</Text>
            <Text style={styles.emptySubtitle}>
              Students will appear here once they join the room using the room code
            </Text>
          </View>
        ) : (
          <FlatList
            data={students}
            renderItem={renderStudent}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  title: {
    fontSize: 20,
    fontFamily: getFontFamily('bold'),
    color: 'white',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: getFontFamily('medium'),
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  placeholder: {
    width: 40,
  },
  roomInfoCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  roomInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roomInfoText: {
    fontSize: 14,
    fontFamily: getFontFamily('semibold'),
    color: 'rgba(255,255,255,0.9)',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  studentCard: {
    marginBottom: 12,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  studentCardGradient: {
    padding: 16,
    
  },
  studentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  rankContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  rankNumber: {
    fontSize: 18,
    fontFamily: getFontFamily('bold'),
    color: 'white',
  },
  studentInfo: {
    flex: 1,
    gap: 8,
  },
  studentName: {
    fontSize: 18,
    fontFamily: getFontFamily('bold'),
    color: 'white',
    letterSpacing: 0.3,
  },
  levelContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  levelText: {
    fontSize: 12,
    fontFamily: getFontFamily('semibold'),
    color: 'white',
  },
  macroLevelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    gap: 6,
  },
  macroLevelText: {
    fontSize: 12,
    fontFamily: getFontFamily('semibold'),
    color: 'rgba(255,255,255,0.9)',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: getFontFamily('medium'),
    color: 'rgba(255,255,255,0.8)',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontFamily: getFontFamily('bold'),
    color: 'white',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    fontFamily: getFontFamily('regular'),
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 24,
  },
});
