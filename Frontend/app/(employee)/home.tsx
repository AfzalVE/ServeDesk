import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Vibration } from "react-native";
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
import { RefreshControl } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../config/api";
import { useRef } from "react";
import { colors } from "../../constants/theme";
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

  accepted_employee_name?: string;

  rejected_employee_name?: string;

  reject_reason?: string;
};

// =====================
// MAIN DASHBOARD
// =====================
export default function EmployeeDashboard() {

  const [refreshing, setRefreshing] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const socket = useRef<WebSocket | null>(null);

  const [rejectingTicket, setRejectingTicket] =
    useState<number | null>(null);

  const [rejectReason, setRejectReason] = useState("");

  const [actionLoading, setActionLoading] = useState(false);
  const ticketSocket = useRef<WebSocket | null>(null);
  const orderSocket = useRef<WebSocket | null>(null);

  // =====================
  // LOAD DATA
  // =====================

  const ringPhone = () => {
    // Vibrate immediately
    Vibration.vibrate(1000);

    // Vibrate every 2 seconds
    const interval = setInterval(() => {
      Vibration.vibrate(1000);
    }, 2000);

    // Stop after 1 minute
    setTimeout(() => {
      clearInterval(interval);
      Vibration.cancel(); // stop any ongoing vibration
    }, 60000);
  };
  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    // =====================
    // TICKET SOCKET
    // =====================
    ticketSocket.current = new WebSocket(
      API_URL.replace(/^http/, "ws") + "/ws/tickets"
    );

    ticketSocket.current.onopen = () => {
      console.log("✅ Ticket WS Connected");
    };

    ticketSocket.current.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);

        console.log("🎫 Ticket WS:", parsed);

        if (
          parsed.event === "ticket_created" &&
          parsed.ticket?.requested_employee_id === user.id
        ) {
          ringPhone();
        }

        fetchData();

      } catch (err) {
        console.log("Ticket WS Parse Error:", err);
      }
    };

    ticketSocket.current.onerror = (error) => {
      console.log("Ticket WS Error:", error);
    };

    ticketSocket.current.onclose = () => {
      console.log("Ticket WS Closed");
    };


    // =====================
    // ORDER SOCKET
    // =====================
    orderSocket.current = new WebSocket(
      API_URL.replace(/^http/, "ws") + "/ws/orders"

    );
    console.log(API_URL.replace(/^http/, "ws") + "/ws/orders")
    orderSocket.current.onopen = () => {
      console.log("✅ Order WS Connected Employee");
    };

    orderSocket.current.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);

        console.log("📦 Order WS:", parsed);

        if (parsed.type === "order_created") {

          Vibration.vibrate(500);

          Alert.alert(
            "New Order",
            `Order #${parsed.order?.id} received`
          );
        }

        fetchData();

      } catch (err) {
        console.log("Order WS Parse Error:", err);
      }
    };


    orderSocket.current.onerror = (error) => {
      console.log("Order WS Error:", error);
    };


    orderSocket.current.onclose = () => {
      console.log("Employee Order WS Closed");
    };


    // =====================
    // CLEANUP
    // =====================
    return () => {

      if (ticketSocket.current) {
        ticketSocket.current.close();
        ticketSocket.current = null;
      }

      if (orderSocket.current) {
        orderSocket.current.close();
        orderSocket.current = null;
      }

    };

  }, [user?.id]);
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
            employee_id: user?.id,
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
        fetch(`${API_URL}/orders/pending/today`),
        fetch(`${API_URL}/tickets/active`),
      ]);

      const ordersData = await orderRes.json();
      const ticketsData = await ticketRes.json();
      // console.log(ticketsData)
      // console.log("Fetched orders:", ordersData);

      setOrders(Array.isArray(ordersData) ? ordersData : []);
      setTickets(Array.isArray(ticketsData) ? ticketsData : []);
    } catch (err) {
      Alert.alert("Error", "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await fetchData();
    } finally {
      setRefreshing(false);
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
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#2D8CFF"]}
          tintColor="#2D8CFF"
        />
      }
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
        <View style={styles.emptyAlert}>
          <Text style={styles.emptyIcon}>🛡️</Text>
          <Text style={styles.emptyTitle}>
            No Active Support Requests
          </Text>
        </View>
      ) : (
        tickets.slice(0, 5).map((ticket) => {
          const isAccepted =
            ticket.status === "ACCEPTED";

          const cardColor = isAccepted
            ? "#1A2A1A"
            : "#1A0F0F";

          const borderColor = isAccepted
            ? "#43A047"
            : "#E53935";

          const shadowColor = isAccepted
            ? "#43A047"
            : "#E53935";

          const badgeColor = isAccepted
            ? "#2E7D32"
            : "#B71C1C";

          const titleColor = isAccepted
            ? "#66BB6A"
            : "#FF6B6B";

          return (
            <View
              key={ticket.id}
              style={[
                styles.alertCard,
                {
                  backgroundColor: cardColor,
                  borderColor: borderColor,
                  shadowColor: shadowColor,
                },
              ]}
            >
              {/* HEADER */}
              <View style={styles.alertHeader}>
                <Text style={styles.alertIcon}>
                  {isAccepted ? "✅" : "🚨"}
                </Text>

                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.alertTitle,
                      { color: titleColor },
                    ]}
                  >
                    {isAccepted
                      ? "SUPPORT ACCEPTED"
                      : "SUPPORT REQUEST"}
                  </Text>

                  <Text style={styles.customerName}>
                    {ticket.customer_name}
                  </Text>
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: badgeColor,
                    },
                  ]}
                >
                  <Text style={styles.statusText}>
                    {ticket.status}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              {/* DETAILS */}

              <Text style={styles.infoText}>
                👤 Requested :
                <Text style={styles.infoValue}>
                  {" "}
                  {ticket.requested_employee_name ||
                    "-"}
                </Text>
              </Text>

              <Text style={styles.infoText}>
                ✅ Accepted :
                <Text style={styles.infoValue}>
                  {" "}
                  {ticket.accepted_employee_name ||
                    "-"}
                </Text>
              </Text>

              {ticket.rejected_employee_name && (
                <Text style={styles.infoText}>
                  ❌ Rejected :
                  <Text style={styles.infoValue}>
                    {" "}
                    {ticket.rejected_employee_name}
                  </Text>
                </Text>
              )}

              {ticket.reject_reason ? (
                <View
                  style={[
                    styles.reasonBox,
                    {
                      backgroundColor:
                        isAccepted
                          ? "#203320"
                          : "#311515",
                      borderLeftColor:
                        isAccepted
                          ? "#43A047"
                          : "#FF5252",
                    },
                  ]}
                >
                  <Text style={styles.reasonTitle}>
                    REJECTION REASON
                  </Text>

                  <Text style={styles.reasonText}>
                    {ticket.reject_reason}
                  </Text>
                </View>
              ) : null}

              {/* ACTIONS */}

              {ticket.status === "OPEN" && (
                <>
                  <View style={styles.buttonRow}>
                    <TouchableOpacity
                      style={styles.acceptBtn}
                      disabled={actionLoading}
                      onPress={() =>
                        acceptTicket(ticket.id)
                      }
                    >
                      <Text style={styles.actionText}>
                        ACCEPT
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.rejectBtn}
                      disabled={actionLoading}
                      onPress={() =>
                        setRejectingTicket(ticket.id)
                      }
                    >
                      <Text style={styles.actionText}>
                        REJECT
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {rejectingTicket ===
                    ticket.id && (
                      <>
                        <TextInput
                          placeholder="Enter rejection reason..."
                          placeholderTextColor="#999"
                          style={styles.rejectInput}
                          value={rejectReason}
                          onChangeText={
                            setRejectReason
                          }
                        />

                        <TouchableOpacity
                          style={
                            styles.submitRejectBtn
                          }
                          disabled={
                            actionLoading
                          }
                          onPress={() =>
                            rejectTicket(
                              ticket.id
                            )
                          }
                        >
                          <Text
                            style={
                              styles.actionText
                            }
                          >
                            SUBMIT REJECTION
                          </Text>
                        </TouchableOpacity>
                      </>
                    )}
                </>
              )}
            </View>
          );
        })
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
    backgroundColor: colors.background,
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



  emptyAlert: {
    backgroundColor: "#2A1111",
    borderWidth: 2,
    borderColor: "#E53935",
    borderRadius: 18,
    padding: 25,
    alignItems: "center",
    marginVertical: 10,
  },

  emptyIcon: {
    fontSize: 42,
  },

  emptyTitle: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "900",
    marginTop: 10,
  },

  alertCard: {
    backgroundColor: "#1A0F0F",
    borderWidth: 2,
    borderColor: "#E53935",
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
    shadowColor: "#E53935",
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },

  alertHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  alertIcon: {
    fontSize: 32,
    marginRight: 12,
  },

  alertTitle: {
    color: "#FF6B6B",
    fontWeight: "900",
    fontSize: 13,
  },

  customerName: {
    color: "#FFF",
    fontSize: 22,
    fontWeight: "900",
  },

  statusBadge: {
    backgroundColor: "#B71C1C",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },

  statusText: {
    color: "#FFF",
    fontWeight: "900",
    fontSize: 12,
  },

  divider: {
    height: 1,
    backgroundColor: "#5A2020",
    marginVertical: 15,
  },

  infoText: {
    color: "#FFCACA",
    marginTop: 6,
    fontSize: 14,
  },

  infoValue: {
    color: "#FFF",
    fontWeight: "800",
  },

  reasonBox: {
    marginTop: 15,
    backgroundColor: "#311515",
    borderLeftWidth: 4,
    borderLeftColor: "#FF5252",
    padding: 12,
    borderRadius: 10,
  },

  reasonTitle: {
    color: "#FF6B6B",
    fontWeight: "900",
    marginBottom: 4,
  },

  reasonText: {
    color: "#FFF",
  },

  buttonRow: {
    flexDirection: "row",
    marginTop: 18,
    gap: 10,
  },

  acceptBtn: {
    flex: 1,
    backgroundColor: "#2E7D32",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },

  rejectBtn: {
    flex: 1,
    backgroundColor: "#C62828",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },

  submitRejectBtn: {
    backgroundColor: "#8B0000",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },

  actionText: {
    color: "#FFF",
    fontWeight: "900",
    letterSpacing: 1,
  },

  rejectInput: {
    backgroundColor: "#2B1B1B",
    color: "#FFF",
    borderWidth: 1,
    borderColor: "#E53935",
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
});