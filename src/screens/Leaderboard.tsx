import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  limit,
  doc,
  getDocs,
} from "firebase/firestore";
import { db, auth } from "../../firebase";

type Player = {
  id: string;
  name: string;
  score: number;
  difficulty?: string;
};

type LeaderboardProps = {
  route: any;
};

const Leaderboard: React.FC<LeaderboardProps> = ({ route }) => {
const { roomCode, roomName } = route.params || {};
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [difficultyFilter, setDifficultyFilter] = useState<"all" | "easy" | "medium" | "hard">("all");
  const [authorized, setAuthorized] = useState(false);

useEffect(() => {
  const fetchLeaderboard = async () => {
    setLoading(true);
    const user = auth.currentUser;

    if (!user || !roomCode) {
      setAuthorized(false);
      setLoading(false);
      return;
    }

    try {
      // ✅ Query the room document by roomCode and createdBy
      const roomQuery = query(
        collection(db, "GenerateRoom"),
        where("roomCode", "==", roomCode),
        where("createdBy", "==", user.uid) // ensure teacher owns it
      );

      const roomSnap = await getDocs(roomQuery);

      if (roomSnap.empty) {
        setAuthorized(false);
        setLoading(false);
        return;
      }

      setAuthorized(true);

      // ✅ Fetch students results for this room only
      const studentsQuery = query(
        collection(db, "StudentResultJoin"),
        where("roomCode", "==", roomCode),
        orderBy("score", "desc"),
        limit(50)
      );

      const unsubscribe = onSnapshot(studentsQuery, (snapshot) => {
        let data: Player[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name || doc.data().playerName || "Unknown",
          score: doc.data().score || 0,
          difficulty: doc.data().difficulty || "unknown",
        }));

        if (difficultyFilter !== "all") {
          data = data.filter((p) => p.difficulty === difficultyFilter);
        }

        setPlayers(data);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (err) {
      console.error(err);
      setAuthorized(false);
      setLoading(false);
    }
  };

  fetchLeaderboard();
}, [roomCode, difficultyFilter]);


  const renderItem = ({ item, index }: { item: Player; index: number }) => {
    const maxScore = players.length > 0 ? players[0].score : 1;
    const percentage = Math.round((item.score / maxScore) * 100);

    let trophy = "";
    if (index === 0) trophy = "🥇";
    else if (index === 1) trophy = "🥈";
    else if (index === 2) trophy = "🥉";

    return (
      <View style={styles.row}>
        <Text style={styles.rank}>{trophy ? trophy : index + 1}</Text>
        <Text style={styles.name}>{item.name}</Text>
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { width: `${percentage}%` }]} />
        </View>
        <Text style={styles.score}>{item.score}%</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="blue" />
        <Text>Loading leaderboard...</Text>
      </SafeAreaView>
    );
  }

  if (!authorized) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={{ fontSize: 16, color: "red", textAlign: "center" }}>
          You are not authorized to view this leaderboard.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🏆 Room {roomCode} Leaderboard</Text>
        <View style={{ alignItems: "flex-end" }}>
          <TouchableOpacity onPress={() => setShowDropdown((prev) => !prev)}>
            <Ionicons name="filter" size={28} color="black" />
            <Text style={styles.filterLabel}>{difficultyFilter.toUpperCase()}</Text>
          </TouchableOpacity>

          {showDropdown && (
            <View style={styles.dropdown}>
              {["all", "easy", "medium", "hard"].map((level) => (
                <TouchableOpacity
                  key={level}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setDifficultyFilter(level as any);
                    setShowDropdown(false);
                  }}
                >
                  <View style={styles.dropdownRow}>
                    <Ionicons name="options" size={16} color="#333" style={{ marginRight: 6 }} />
                    <Text style={{ fontSize: 16 }}>{level.charAt(0).toUpperCase() + level.slice(1)}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      {players.length > 0 ? (
        <FlatList data={players} keyExtractor={(item) => item.id} renderItem={renderItem} />
      ) : (
        <Text style={styles.empty}>No scores yet.</Text>
      )}
    </SafeAreaView>
  );
};

export default Leaderboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f7f7",
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingTop: 50,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
  },
  filterLabel: {
    fontSize: 12,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 8,
    elevation: 2,
  },
  rank: {
    fontSize: 20,
    fontWeight: "bold",
    width: 40,
    textAlign: "center",
  },
  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
  progressContainer: {
    flex: 2,
    height: 20,
    backgroundColor: "#ddd",
    borderRadius: 12,
    overflow: "hidden",
    marginHorizontal: 8,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#4caf50",
  },
  score: {
    width: 90,
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "right",
  },
  empty: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#555",
  },
  dropdown: {
    position: "absolute",
    top: 40,
    right: 0,
    width: 140, // 👈 force width so text doesn’t wrap vertically
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingVertical: 4,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 1000,
  },
  dropdownItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  dropdownRow: {
    flexDirection: "row",
    alignItems: "center",
  },
});
