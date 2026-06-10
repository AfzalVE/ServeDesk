import React, { useEffect, useState } from "react";
import { router } from "expo-router";
import {
  Alert,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../config/api";

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    employees: 0,
    tickets: 0,
  });
  const [loading, setLoading] = useState(true);
  const [announcement, setAnnouncement] = useState(
    "Welcome to ServeDesk Admin Panel"
  );

  // =========================
  // LOAD DASHBOARD DATA
  // =========================
  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);

      const stored = await AsyncStorage.getItem("user");
      if (stored) setUser(JSON.parse(stored));

      // fetch all stats from backend
      const [productsRes, ordersRes, employeesRes, ticketsRes] =
        await Promise.all([
          fetch(`${API_URL}/products`),
          fetch(`${API_URL}/orders`),
          fetch(`${API_URL}/employees`),
          fetch(`${API_URL}/tickets`),
        ]);

      const products = await productsRes.json();
      const orders = await ordersRes.json();
      const employees = await employeesRes.json();
      const tickets = await ticketsRes.json();

      setStats({
        products: Array.isArray(products) ? products.length : 0,
        orders: Array.isArray(orders) ? orders.length : 0,
        employees: Array.isArray(employees) ? employees.length : 0,
        tickets: Array.isArray(tickets) ? tickets.length : 0,
      });
    } catch (err) {
      Alert.alert("Error", "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // LOGOUT
  // =========================
  const logout = async () => {
    Alert.alert("Logout", "Do you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        onPress: async () => {
          await AsyncStorage.removeItem("user");
          router.replace("/(auth)/sign-in");
        },
      },
    ]);
  };

  // =========================
  // NAVIGATION
  // =========================
  const go = (path: string) => {
    router.push(path as any);
  };
  // inside AdminDashboard component
const [announcementText, setAnnouncementText] = useState("");
const [posting, setPosting] = useState(false);

// POST announcement to backend
const postAnnouncement = async () => {
  try {
    if (!announcementText.trim()) {
      Alert.alert("Error", "Write an announcement first");
      return;
    }

    setPosting(true);

    const res = await fetch(`${API_URL}/announcements`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: announcementText,
        created_by: user?.id,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      Alert.alert("Error", data.detail || "Failed to post");
      return;
    }

    Alert.alert("Success", "Announcement posted");
    setAnnouncementText("");
  } catch (err) {
    Alert.alert("Error", "Server error");
  } finally {
    setPosting(false);
  }
};

  // =========================
  // LOADER
  // =========================
  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#2D8CFF" />
        <Text style={{ color: "#fff", marginTop: 10 }}>
          Loading Admin Dashboard...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* ================= HEADER ================= */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Admin Dashboard</Text>
          <Text style={styles.subTitle}>
            Welcome {user?.full_name || "Admin"}
          </Text>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* ================= NAV BUTTONS ================= */}
      <View style={styles.navRow}>
        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => go("/(admin)/employees")}
        >
          <Text style={styles.navText}>Employees</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => go("/(admin)/products")}
        >
          <Text style={styles.navText}>Products</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => go("/(admin)/orders")}
        >
          <Text style={styles.navText}>Orders</Text>
        </TouchableOpacity>
      </View>

      {/* ================= OVERVIEW CARDS ================= */}
      <View style={styles.statsRow}>
        <View style={styles.card}>
          <Text style={styles.cardNumber}>{stats.products}</Text>
          <Text style={styles.cardLabel}>Products</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardNumber}>{stats.orders}</Text>
          <Text style={styles.cardLabel}>Orders</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardNumber}>{stats.employees}</Text>
          <Text style={styles.cardLabel}>Employees</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardNumber}>{stats.tickets}</Text>
          <Text style={styles.cardLabel}>Tickets</Text>
        </View>
      </View>

      {/* ================= ANNOUNCEMENT ================= */}
<View style={styles.announcementBox}>
  <Text style={styles.sectionTitle}>📢 Create Announcement</Text>

  <TextInput
    style={styles.textArea}
    placeholder="Write announcement for employees/customers..."
    placeholderTextColor="#888"
    multiline
    value={announcementText}
    onChangeText={setAnnouncementText}
  />

  <TouchableOpacity
    style={styles.announceBtn}
    onPress={postAnnouncement}
    disabled={posting}
  >
    <Text style={styles.announceText}>
      {posting ? "Posting..." : "Post Announcement"}
    </Text>
  </TouchableOpacity>

  {/* Navigate to list page */}
  <TouchableOpacity
    style={[styles.announceBtn, { marginTop: 10, backgroundColor: "#1E2A3A" }]}
    onPress={() => router.push("/(admin)/announcements")}
  >
    <Text style={styles.announceText}>View All Announcements</Text>
  </TouchableOpacity>
</View>
      {/* ================= QUICK ACTIONS ================= */}
      <View style={styles.quickBox}>
        <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => go("/(admin)/products")}
        >
          <Text style={styles.actionText}>➕ Add Products</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => go("/(admin)/employees")}
        >
          <Text style={styles.actionText}>👨‍💼 Manage Employees</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => go("/(admin)/orders")}
        >
          <Text style={styles.actionText}>📦 View Orders</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

/* ================= STYLES ================= */
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
    alignItems: "center",
  },

  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#fff",
  },

  subTitle: {
    color: "#9DB1C7",
    marginTop: 5,
  },

  logoutBtn: {
    backgroundColor: "#E53935",
    padding: 10,
    borderRadius: 10,
  },

  logoutText: {
    color: "#fff",
    fontWeight: "800",
  },

  navRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  navBtn: {
    backgroundColor: "#16293D",
    padding: 12,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 5,
    alignItems: "center",
  },

  navText: {
    color: "#fff",
    fontWeight: "700",
  },

  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  card: {
    width: "48%",
    backgroundColor: "#101E2D",
    padding: 20,
    borderRadius: 15,
    marginBottom: 10,
  },

  cardNumber: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "900",
  },

  cardLabel: {
    color: "#9DB1C7",
    marginTop: 5,
  },

  announcementBox: {
    backgroundColor: "#101E2D",
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
  },

  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 10,
  },

  announcementText: {
    color: "#B5C4D4",
    marginBottom: 15,
  },

  announceBtn: {
    backgroundColor: "#2D8CFF",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  announceText: {
    color: "#fff",
    fontWeight: "700",
  },

  quickBox: {
    backgroundColor: "#101E2D",
    padding: 20,
    borderRadius: 15,
    marginBottom: 30,
  },

  actionBtn: {
    backgroundColor: "#16293D",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },

  actionText: {
    color: "#fff",
    fontWeight: "700",
  },
  textArea: {
  backgroundColor: "#16293D",
  color: "#fff",
  padding: 15,
  borderRadius: 12,
  height: 120,
  textAlignVertical: "top",
  marginBottom: 15,
},
});