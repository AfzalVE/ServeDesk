import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { API_URL } from "../../config/api";

type Ticket = {
  id: number;
  message: string;
  status: string;
};

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await fetch(`${API_URL}/tickets`);
      const data = await res.json();
      setTickets(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color="#2D8CFF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>Support Tickets</Text>

        {tickets.map((t) => (
          <View key={t.id} style={styles.card}>
            <Text style={styles.text}>🚨 {t.message}</Text>
            <Text style={styles.sub}>Status: {t.status || "OPEN"}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#07111F" },
  loader: { flex: 1, justifyContent: "center" },

  title: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "900",
    margin: 20,
  },

  card: {
    backgroundColor: "#16293D",
    margin: 15,
    padding: 15,
    borderRadius: 14,
  },

  text: { color: "#fff" },
  sub: { color: "#9DB1C7", marginTop: 5 },
});