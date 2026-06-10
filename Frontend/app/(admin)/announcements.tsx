import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { API_URL } from "../../config/api";
import { router } from "expo-router";

export default function AnnouncementsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#2D8CFF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>📢 Announcements</Text>

        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>⬅ Back</Text>
        </TouchableOpacity>
      </View>

      {/* LIST */}
      <FlatList
        data={data}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.message}>{item.message}</Text>

            <Text style={styles.meta}>
              Posted by Admin #{item.created_by}
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#07111F",
    padding: 15,
  },

  loader: {
    flex: 1,
    backgroundColor: "#07111F",
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

  back: {
    color: "#2D8CFF",
    fontWeight: "700",
  },

  card: {
    backgroundColor: "#101E2D",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },

  message: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  meta: {
    color: "#9DB1C7",
    marginTop: 8,
    fontSize: 12,
  },
});