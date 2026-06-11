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
  TextInput,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../config/api";
import { useRef } from "react";

// =====================
// TYPES
// =====================
type Order = {
  id: number;
  status: string;
  customer_id: number;
  customer_name?: string;
  display_name?: string;
  custom_item_name?: string;
  quantity?: number;
  custom_message?: string;
};

type Ticket = {
  id: number;
  message: string;
  status: string;

  customer_name?: string;

  requested_employee_name?: string;

  accepted_by_name?: string;

  rejected_by_name?: string;

  rejection_reason?: string;
};

// =====================
// MAIN DASHBOARD
// =====================
export default function EmployeeDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const socket = useRef<WebSocket | null>( null );

  const [rejectingTicket, setRejectingTicket] =
    useState<number | null>(null);

  const [rejectReason, setRejectReason] = useState("");

  const [actionLoading, setActionLoading] = useState(false);

  // =====================
  // LOAD DATA
  // =====================

useEffect(() => {
  initialize();

  socket.current = new WebSocket(
    API_URL.replace("http", "ws") + "/ws/tickets"
  );

  socket.current.onopen = () => {
    console.log("WebSocket Connected");
    socket.current?.send("connected");
  };

  socket.current.onmessage = (event) => {
    console.log("Received:", event.data);

    try {
      const ticket = JSON.parse(event.data);

      setTickets((prev) => {
        const exists = prev.find(
          (t) => t.id === ticket.id
        );

        if (exists) {
          return prev.map((t) =>
            t.id === ticket.id ? ticket : t
          );
        }

        return [ticket, ...prev];
      });
    } catch (err) {
      console.log(
        "Invalid websocket data",
        err
      );
    }
  };

  socket.current.onerror = (error) => {
    console.log(
      "WebSocket Error:",
      error
    );
  };

  socket.current.onclose = () => {
    console.log(
      "WebSocket Closed"
    );
  };

  return () => {
    socket.current?.close();
  };
}, []);

  const initialize = async () => {
    await loadUser();
    await fetchData();
  };

  const loadUser = async () => {
    const data = await AsyncStorage.getItem("user");

    if (data) {
      setUser(JSON.parse(data));
    }
  };
  const acceptTicket = async (ticketId: number) => {
    try {
      setActionLoading(true);

      const res = await fetch(
        `${API_URL}/tickets/${ticketId}/accept`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            employee_id: user?.id,
          }),
        }
      );

      if (!res.ok) {
        throw new Error();
      }

      Alert.alert(
        "Success",
        "Ticket accepted successfully."
      );

      fetchData();
    } catch {
      Alert.alert(
        "Error",
        "Unable to accept ticket."
      );
    } finally {
      setActionLoading(false);
    }
  };
  const rejectTicket = async (
    ticketId: number
  ) => {
    if (!rejectReason.trim()) {
      Alert.alert(
        "Validation",
        "Please enter a rejection reason."
      );
      return;
    }

    try {
      setActionLoading(true);

      const res = await fetch(
        `${API_URL}/tickets/${ticketId}/reject`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            employee_id: user.id,
            reason: rejectReason,
          }),
        }
      );

      if (!res.ok) {
        throw new Error();
      }

      setRejectReason("");
      setRejectingTicket(null);

      Alert.alert(
        "Success",
        "Ticket rejected."
      );

      fetchData();
    } catch {
      Alert.alert(
        "Error",
        "Unable to reject ticket."
      );
    } finally {
      setActionLoading(false);
    }
  };
  const fetchData = async () => {
    try {
      setLoading(true);

      const [orderRes, ticketRes] = await Promise.all([
        fetch(`${API_URL}/orders`),
        fetch(`${API_URL}/tickets`),
      ]);

      const ordersData = await orderRes.json();
      const ticketsData = await ticketRes.json();
      console.log("Fetched orders:", ordersData);

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

      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#2D8CFF" />
        <Text style={styles.loaderText}>Loading dashboard...</Text>
      </View>

    );
  }

  return (

    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingBottom: 120,
      }}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>
          Employee Dashboard
        </Text>

        <Text style={styles.subtitle}>
          Monitor orders and support requests
        </Text>
      </View>

      {/* STATS */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {orders.length}
          </Text>
          <Text style={styles.statLabel}>
            Orders
          </Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {
              tickets.filter(
                (x) =>
                  x.status === "OPEN" ||
                  x.status === "ASSIGNED"
              ).length
            }
          </Text>
          <Text style={styles.statLabel}>
            Tickets
          </Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {
              orders.filter(
                (x) => x.status === "PENDING"
              ).length
            }
          </Text>
          <Text style={styles.statLabel}>
            Pending
          </Text>
        </View>
      </View>

      {/* ACTIVE TICKETS */}

      <Text style={styles.sectionTitle}>
        🎫 Active Tickets
      </Text>

      {tickets.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>
            No active tickets
          </Text>
        </View>
      ) : (
        tickets.slice(0, 5).map((ticket) => (
          <View
            key={ticket.id}
            style={styles.ticketCard}
          >
            <Text style={styles.ticketTitle}>
              {ticket.customer_name}
            </Text>

            <Text style={styles.ticketItem}>
              Requested :
              {" "}
              {ticket.requested_employee_name}
            </Text>

            <Text style={styles.ticketItem}>
              Accepted :
              {" "}
              {ticket.accepted_by_name || "-"}
            </Text>

            <Text style={styles.ticketItem}>
              Rejected :
              {" "}
              {ticket.rejected_by_name || "-"}
            </Text>

            {ticket.rejection_reason ? (
              <Text style={styles.rejectReason}>
                Reason :
                {" "}
                {ticket.rejection_reason}
              </Text>
            ) : null}

            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {ticket.status}
              </Text>
            </View>

            {ticket.status === "OPEN" && (
              <>
                <TouchableOpacity
                  style={styles.acceptBtn}
                  disabled={actionLoading}
                  onPress={() =>
                    acceptTicket(ticket.id)
                  }
                >
                  <Text style={styles.actionText}>
                    ✅ Accept
                  </Text>
                </TouchableOpacity>

                {rejectingTicket === ticket.id ? (
                  <>
                    <TextInput
                      placeholder="Enter rejection reason"
                      placeholderTextColor="#999"
                      style={styles.rejectInput}
                      value={rejectReason}
                      onChangeText={setRejectReason}
                    />

                    <TouchableOpacity
                      style={styles.rejectBtn}
                      disabled={actionLoading}
                      onPress={() =>
                        rejectTicket(ticket.id)
                      }
                    >
                      <Text style={styles.actionText}>
                        Submit Rejection
                      </Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <TouchableOpacity
                    style={styles.rejectBtn}
                    onPress={() =>
                      setRejectingTicket(ticket.id)
                    }
                  >
                    <Text style={styles.actionText}>
                      ❌ Reject
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        ))
      )}

      {/* ORDERS */}

      <Text style={styles.sectionTitle}>
        📦 Latest Orders
      </Text>

      {orders.slice(0, 8).map((order) => (
        <View
          key={order.id}
          style={styles.orderCard}
        >
          <Text style={styles.orderTitle}>
            {order.display_name ||
              order.custom_item_name}
          </Text>

          <Text style={styles.orderItem}>
            Customer :
            {" "}
            {order.customer_name}
          </Text>

          <Text style={styles.orderItem}>
            Quantity :
            {" "}
            {order.quantity}
          </Text>

          {order.custom_message ? (
            <Text style={styles.orderItem}>
              Note :
              {" "}
              {order.custom_message}
            </Text>
          ) : null}

          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {order.status}
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>

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





  statNum: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "900",
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
  header: {
    margin: 15,
    padding: 20,
    backgroundColor: "#101E2D",
    borderRadius: 18,
  },

  title: {
    color: "#FFF",
    fontSize: 28,
    fontWeight: "900",
  },

  subtitle: {
    color: "#9DB1C7",
    marginTop: 5,
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 15,
  },

  statCard: {
    flex: 1,
    backgroundColor: "#101E2D",
    marginHorizontal: 5,
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
  },

  statNumber: {
    color: "#2D8CFF",
    fontSize: 24,
    fontWeight: "900",
  },

  statLabel: {
    color: "#9DB1C7",
    marginTop: 5,
  },

  sectionTitle: {
    color: "#FFF",
    fontSize: 22,
    fontWeight: "900",
    marginHorizontal: 15,
    marginTop: 25,
    marginBottom: 10,
  },

  ticketCard: {
    backgroundColor: "#101E2D",
    marginHorizontal: 15,
    marginBottom: 12,
    padding: 15,
    borderRadius: 16,
  },

  orderCard: {
    backgroundColor: "#101E2D",
    marginHorizontal: 15,
    marginBottom: 12,
    padding: 15,
    borderRadius: 16,
  },

  ticketTitle: {
    color: "#FFF",
    fontWeight: "900",
    fontSize: 17,
  },

  orderTitle: {
    color: "#FFF",
    fontWeight: "900",
    fontSize: 17,
  },

  ticketItem: {
    color: "#B8C5D4",
    marginTop: 5,
  },

  orderItem: {
    color: "#B8C5D4",
    marginTop: 5,
  },

  badge: {
    marginTop: 12,
    backgroundColor: "#2D8CFF",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },

  badgeText: {
    color: "#FFF",
    fontWeight: "800",
  },

  rejectReason: {
    color: "#FF8A80",
    marginTop: 8,
  },

  emptyCard: {
    backgroundColor: "#101E2D",
    marginHorizontal: 15,
    padding: 20,
    borderRadius: 16,
  },

  emptyText: {
    color: "#9DB1C7",
    textAlign: "center",
  },
  acceptBtn: {
    backgroundColor: "#43A047",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 15,
  },

  rejectBtn: {
    backgroundColor: "#E53935",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },



  rejectInput: {
    backgroundColor: "#16293D",
    color: "#FFF",
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
  },
});