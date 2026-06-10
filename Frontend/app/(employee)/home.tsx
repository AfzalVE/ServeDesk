import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { API_URL } from "../../config/api";

// =====================
// TYPES
// =====================
type Order = {
  id: string;
  status: string;
  customer_id: number;
};

type Ticket = {
  id: string;
  message: string;
  status?: string;
};

// =====================
// MAIN DASHBOARD
// =====================
export default function EmployeeDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  // =====================
  // LOAD DATA
  // =====================
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [orderRes, ticketRes] = await Promise.all([
        fetch(`${API_URL}/orders`),
        fetch(`${API_URL}/tickets`),
      ]);

      const ordersData = await orderRes.json();
      const ticketsData = await ticketRes.json();

      setOrders(Array.isArray(ordersData) ? ordersData : []);
      setTickets(Array.isArray(ticketsData) ? ticketsData : []);
    } catch (err) {
      Alert.alert("Error", "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  // =====================
  // LOADER
  // =====================
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#2D8CFF" />
          <Text style={styles.loaderText}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ================= HEADER ================= */}
        <View style={styles.header}>
          <Text style={styles.title}>Employee Dashboard</Text>
          <Text style={styles.subtitle}>
            Manage orders & support requests in real time
          </Text>
        </View>

        {/* ================= STATS ================= */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>{orders.length}</Text>
            <Text style={styles.statLabel}>Orders</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNum}>{tickets.length}</Text>
            <Text style={styles.statLabel}>Tickets</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNum}>
              {orders.filter(o => o.status === "PENDING").length}
            </Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>

        {/* ================= QUICK ACTIONS ================= */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => router.push("/(employee)/orders")}
          >
            <Text style={styles.actionText}>📦 All Orders</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => router.push("/(employee)/tickets")}
          >
            <Text style={styles.actionText}>🚨 Tickets</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => router.push("/(employee)/profile")}
          >
            <Text style={styles.actionText}>👤 Profile</Text>
          </TouchableOpacity>
        </View>

        {/* ================= LIVE ORDERS PREVIEW ================= */}
        <Text style={styles.sectionTitle}>Latest Orders</Text>

        {orders.slice(0, 5).map((order) => (
          <View key={order.id} style={styles.card}>
            <Text style={styles.cardTitle}>
              Order #{order.id}
            </Text>
            <Text style={styles.cardSub}>
              Status: {order.status}
            </Text>
          </View>
        ))}

        {/* ================= TICKET ALERTS ================= */}
        <Text style={styles.sectionTitle}>Recent Tickets</Text>

        {tickets.slice(0, 3).map((t) => (
          <View key={t.id} style={styles.ticketCard}>
            <Text style={styles.ticketText}>
              🚨 {t.message}
            </Text>
          </View>
        ))}

        {/* ================= FOOTER ================= */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            ⚡ Real-time employee control panel
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// =====================
// STYLES
// =====================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#07111F",
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loaderText: {
    color: "#B5C4D4",
    marginTop: 10,
  },

  header: {
    padding: 20,
    paddingTop: 30,
  },

  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "900",
  },

  subtitle: {
    color: "#9DB1C7",
    marginTop: 6,
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    marginTop: 10,
  },

  statCard: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: "#101E2D",
    padding: 18,
    borderRadius: 14,
    alignItems: "center",
  },

  statNum: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "900",
  },

  statLabel: {
    color: "#9DB1C7",
    marginTop: 5,
  },

  sectionTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "900",
    marginLeft: 20,
    marginTop: 25,
    marginBottom: 10,
  },

  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 15,
  },

  actionBtn: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: "#2D8CFF",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },

  actionText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 12,
  },

  card: {
    backgroundColor: "#101E2D",
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 14,
    marginBottom: 10,
  },

  cardTitle: {
    color: "#fff",
    fontWeight: "800",
  },

  cardSub: {
    color: "#9DB1C7",
    marginTop: 5,
  },

  ticketCard: {
    backgroundColor: "#16293D",
    marginHorizontal: 20,
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
  },

  ticketText: {
    color: "#fff",
  },

  footer: {
    margin: 20,
    padding: 20,
    backgroundColor: "#101E2D",
    borderRadius: 14,
    alignItems: "center",
  },

  footerText: {
    color: "#9DB1C7",
  },
});