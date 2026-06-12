import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../config/api";
import { colors } from "../../constants/theme";

export default function ActiveTickets() {
  const socket = useRef<WebSocket | null>(null);

  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const userRef = useRef<any>(null);

  // ======================
  // STATUS UI
  // ======================
  const getStatus = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return { label: "✅ Accepted", color: "#66BB6A" };
      case "OPEN":
        return { label: "⏳ Waiting", color: "#FFA726" };
      case "REJECTED":
        return { label: "❌ Rejected", color: "#EF5350" };
      default:
        return { label: status, color: "#64B5F6" };
    }
  };

  // ======================
  // FETCH TICKETS
  // ======================
  const fetchTickets = useCallback(async () => {
    try {
      const user = await AsyncStorage.getItem("user");
      if (!user) return;

      const userData = JSON.parse(user);
      userRef.current = userData;

      const res = await fetch(
        `${API_URL}/tickets/customer/${userData.id}`
      );

      if (!res.ok) return;

      const data = await res.json();
      setTickets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log("Fetch error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // ======================
  // INITIAL LOAD
  // ======================
  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // ======================
  // WEBSOCKET SETUP
  // ======================
  useEffect(() => {
    const initWS = async () => {
      const user = await AsyncStorage.getItem("user");
      if (!user) return;

      const userData = JSON.parse(user);

      socket.current = new WebSocket(
        API_URL.replace("http", "ws") + "/ws/tickets"
      );

      socket.current.onopen = () => {
        console.log("✅ WebSocket Connected");
      };

      socket.current.onmessage = (event) => {
        console.log("📩 WS Update:", event.data);

        // Refresh tickets whenever backend sends update
        fetchTickets();
      };

      socket.current.onerror = (err) => {
        console.log("❌ WS Error:", err);
      };

      socket.current.onclose = () => {
        console.log("🔌 WS Closed");
      };
    };

    initWS();

    return () => {
      socket.current?.close();
    };
  }, [fetchTickets]);

  // ======================
  // PULL TO REFRESH
  // ======================
  const onRefresh = () => {
    setRefreshing(true);
    fetchTickets();
  };

  // ======================
  // CANCEL TICKET
  // ======================
  const cancelTicket = async (id: number) => {
    try {
      setCancellingId(id);

      const res = await fetch(
        `${API_URL}/tickets/${id}/cancel`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) throw new Error();

      Alert.alert("Success", "Ticket cancelled");

      fetchTickets();
    } catch (err) {
      Alert.alert("Error", "Failed to cancel ticket");
    } finally {
      setCancellingId(null);
    }
  };

  // ======================
  // CARD UI
  // ======================
  const renderItem = ({ item }: any) => {
    const statusUI = getStatus(item.status);

    return (
      <View style={styles.card}>
        {/* HEADER */}
        <View style={styles.headerRow}>
          <Text style={styles.title}>
            🎫 Ticket #{item.id}
          </Text>

          <View
            style={[
              styles.badge,
              { backgroundColor: statusUI.color },
            ]}
          >
            <Text style={styles.badgeText}>
              {statusUI.label}
            </Text>
          </View>
        </View>

        {/* DETAILS */}
        <Text style={styles.label}>Requested Employee</Text>
        <Text style={styles.value}>
          {item.requested_employee_name}
        </Text>

        {item.accepted_employee_name && (
          <>
            <Text style={styles.label}>Accepted By</Text>
            <Text style={[styles.value, { color: "#66BB6A" }]}>
              {item.accepted_employee_name}
            </Text>
          </>
        )}

        {item.rejected_employee_name && (
          <>
            <Text style={styles.label}>Rejected By</Text>
            <Text style={[styles.value, { color: "#EF5350" }]}>
              {item.rejected_employee_name}
            </Text>
          </>
        )}

        {item.reject_reason && (
          <>
            <Text style={styles.label}>Reason</Text>
            <Text style={[styles.value, { color: "#FFB74D" }]}>
              {item.reject_reason}
            </Text>
          </>
        )}

        {/* CANCEL BUTTON */}
        {item.status === "OPEN" && (
          <TouchableOpacity
            style={[
              styles.cancelBtn,
              cancellingId === item.id && styles.disabledBtn,
            ]}
            disabled={cancellingId === item.id}
            onPress={() => cancelTicket(item.id)}
          >
            <Text style={styles.cancelText}>
              {cancellingId === item.id
                ? "Cancelling..."
                : "Cancel Ticket"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // ======================
  // LOADING
  // ======================
  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#2D8CFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>🎫 Active Tickets</Text>

      <FlatList
        data={tickets}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 15 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#2D8CFF"
          />
        }
      />
    </View>
  );
}

// ======================
// STYLES (MATCH HOME UI)
// ======================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },

  pageTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "900",
    margin: 15,
  },

  card: {
    backgroundColor: "#101E2D",
    padding: 18,
    borderRadius: 16,
    marginBottom: 15,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  title: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "900",
  },

  label: {
    color: "#8FA5B8",
    marginTop: 8,
  },

  value: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },

  badgeText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 12,
  },

  cancelBtn: {
    marginTop: 15,
    backgroundColor: "#E53935",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },

  cancelText: {
    color: "#fff",
    fontWeight: "900",
  },

  disabledBtn: {
    opacity: 0.6,
  },
});