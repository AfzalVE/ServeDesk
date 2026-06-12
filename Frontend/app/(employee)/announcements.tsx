import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { API_URL } from "../../config/api";
import { router } from "expo-router";
import { colors } from "../../constants/theme";

export default function AnnouncementsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/announcements`);
      const json = await res.json();

      setData(Array.isArray(json) ? json : []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnnouncements();
    setRefreshing(false);
  };
  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#2D8CFF" />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={{
        padding: 16,
        paddingBottom: 100,
        flexGrow: 1,
      }}
      data={[...data].sort(
        (a, b) => b.id - a.id
      )}
      keyExtractor={(item) =>
        item.id.toString()
      }
      refreshing={refreshing}
      onRefresh={onRefresh}
      showsVerticalScrollIndicator={
        false
      }
      ListHeaderComponent={
        <>
          <View style={styles.header}>
            <Text style={styles.title}>
              📢 Announcements
            </Text>

            <TouchableOpacity
              onPress={() =>
                router.back()
              }
            >
              <Text style={styles.back}>
                Back
              </Text>
            </TouchableOpacity>
          </View>

        
          <Text
            style={
              styles.sectionTitle
            }
          >
            Recent Announcements
          </Text>
        </>
      }
      ListEmptyComponent={
        <Text style={styles.empty}>
          No announcements found
        </Text>
      }
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View
            style={styles.cardTop}
          >
            <View
              style={
                styles.iconCircle
              }
            >
              <Text
                style={
                  styles.iconText
                }
              >
                📢
              </Text>
            </View>

            <View
              style={{ flex: 1 }}
            >
              <Text
                style={
                  styles.announcementTitle
                }
              >
                {item.title}
              </Text>

              <Text
                style={
                  styles.message
                }
              >
                {item.message}
              </Text>

              <Text
                style={
                  styles.meta
                }
              >
                Announcement ID :
                {" "}
                {item.id}
              </Text>
            </View>
          </View>
        </View>
      )}
    />
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 15,
  },

  loader: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "900",
  },
  createCard: {
    backgroundColor: "#101E2D",
    padding: 18,
    borderRadius: 18,
    marginBottom: 20,
  },

  createTitle: {
    color: "#FFF",
    fontWeight: "900",
    fontSize: 18,
    marginBottom: 15,
  },

  input: {
    backgroundColor: "#16293D",
    color: "#FFF",
    borderRadius: 12,
    padding: 15,
    minHeight: 110,
    textAlignVertical: "top",
  },

  publishBtn: {
    backgroundColor: "#2D8CFF",
    marginTop: 15,
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },

  publishText: {
    color: "#FFF",
    fontWeight: "900",
  },

  sectionTitle: {
    color: "#7F93A8",
    fontWeight: "900",
    marginBottom: 15,
    letterSpacing: 1,
  },

  cardTop: {
    flexDirection: "row",
  },

  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#163A63",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },

  iconText: {
    fontSize: 22,
  },



  card: {
    backgroundColor: "#101E2D",
    padding: 18,
    borderRadius: 18,
    marginBottom: 15,
    borderLeftWidth: 5,
    borderLeftColor: "#FFC107",
  },

  message: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },

  meta: {
    color: "#64B5F6",
    marginTop: 12,
    fontWeight: "800",
    fontSize: 12,
  },

  empty: {
    color: "#AAA",
    textAlign: "center",
    marginTop: 50,
  },
  back: {
    color: "#2D8CFF",
    fontWeight: "700",
  },
  titleInput: {
    backgroundColor: "#16293D",
    color: "#FFF",
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
  },

  announcementTitle: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 8,
  },

});