import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  TextInput,
  Alert,
  AppState,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { RefreshControl } from "react-native";
import {
  darkTheme,
  lightTheme,
} from "../../constants/theme";

import {
  useColorScheme,
} from "react-native";


import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { API_URL } from "../../config/api";
export default function Home() {

  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [showEmployees, setShowEmployees] = useState(false);
  const [activeTicket, setActiveTicket] = useState<any>(null);
  const [ticketLoading, setTicketLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [ticketRaised, setTicketRaised] = useState(false);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [ticketId, setTicketId] = useState<number | null>(null);
  const [activeTickets, setActiveTickets] = useState<any[]>([]);
  const ticketSocket = useRef<WebSocket | null>(null);
  const orderSocket = useRef<WebSocket | null>(null);

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);

  const [theme, setTheme] = useState("dark");
  const deviceTheme = useColorScheme();

  // comments + quantity
  const [comments, setComments] = useState<{ [key: number]: string }>({});
  const [qty, setQty] = useState<{ [key: number]: number }>({});
  const insets = useSafeAreaInsets();

  const connectSockets = () => {
    if (!user?.id) return;

    console.log("🔄 Reconnecting Customer Sockets");

    // Close existing sockets first
    ticketSocket.current?.close();
    orderSocket.current?.close();

    // =========================
    // TICKET SOCKET
    // =========================

    ticketSocket.current = new WebSocket(
      API_URL.replace("http", "ws") + "/ws/tickets"
    );

    ticketSocket.current.onopen = () => {
      console.log("✅ Customer Ticket WS Connected");
    };

    ticketSocket.current.onmessage = (event) => {
      console.log("📩 Ticket WS:", event.data);

      if (!user?.id) return;

      fetchActiveTicket(user.id);
    };

    ticketSocket.current.onerror = (error) => {
      console.log("❌ Ticket WS Error:", error);
    };

    ticketSocket.current.onclose = () => {
      console.log("🔌 Ticket WS Closed");
    };

    // =========================
    // ORDER SOCKET
    // =========================

    orderSocket.current = new WebSocket(
      API_URL.replace("http", "ws") + "/ws/orders"
    );

    orderSocket.current.onopen = () => {
      console.log("✅ Customer Order WS Connected");
    };

    orderSocket.current.onmessage = async (event) => {
      console.log("📦 Order WS:", event.data);

      try {
        const data = JSON.parse(event.data);

        if (
          data.event === "order_created" ||
          data.event === "order_updated" ||
          data.event === "order_assigned"
        ) {
          await loadTodayAnnouncements();

          if (user?.id) {
            await fetchActiveTicket(user.id);
          }
        }
      } catch (err) {
        console.log(err);
      }
    };

    orderSocket.current.onerror = (error) => {
      console.log("❌ Order WS Error:", error);
    };

    orderSocket.current.onclose = () => {
      console.log("🔌 Order WS Closed");
    };
  };

  // =========================
  // LOAD DATA
  // =========================
  useFocusEffect(
    React.useCallback(() => {
      loadTheme();
    }, [])
  );


  const loadTheme = async () => {

    try {

      const savedTheme =
        await AsyncStorage.getItem(
          "theme"
        );


      if (savedTheme) {
        setTheme(savedTheme);
      }

    }
    catch (error) {
      console.log(error);
    }

  };
  const currentTheme =
    theme === "light"
      ? lightTheme
      : theme === "dark"
        ? darkTheme
        : deviceTheme === "light"
          ? lightTheme
          : darkTheme;
  useEffect(() => {
    loadAll();
  }, []);
  const stylesObj =styles(currentTheme);

  useEffect(() => {
    if (!user?.id) return;

    connectSockets();
  }, [user?.id]);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      (nextState) => {
        console.log("📱 App State:", nextState);

        if (nextState === "active") {
          console.log(
            "🔄 App returned to foreground"
          );

          const ticketClosed =
            !ticketSocket.current ||
            ticketSocket.current.readyState ===
            WebSocket.CLOSED;

          const orderClosed =
            !orderSocket.current ||
            orderSocket.current.readyState ===
            WebSocket.CLOSED;

          console.log(
            "Ticket State:",
            ticketSocket.current?.readyState
          );

          console.log(
            "Order State:",
            orderSocket.current?.readyState
          );

          if (ticketClosed || orderClosed) {
            console.log(
              "♻️ Reconnecting sockets..."
            );

            connectSockets();
          }
        }
      }
    );

    return () => {
      subscription.remove();
    };
  }, [user?.id]);

  useEffect(() => {
    return () => {
      ticketSocket.current?.close();
      orderSocket.current?.close();

      ticketSocket.current = null;
      orderSocket.current = null;
    };
  }, []);
  const loadAll = async () => {
    try {
      setLoading(true);

      const u = await AsyncStorage.getItem("user");

      let userData = null;

      if (u) {
        userData = JSON.parse(u);
        setUser(userData);
      }

      const [pRes, eRes, aRes] = await Promise.all([
        fetch(`${API_URL}/products`),
        fetch(`${API_URL}/employees`),
        fetch(`${API_URL}/announcements/today`),
      ]);

      const pData = await pRes.json();
      const eData = await eRes.json();
      const aData = await aRes.json();

      setProducts(Array.isArray(pData) ? pData : []);
      setEmployees(Array.isArray(eData) ? eData : []);
      setAnnouncements(
        Array.isArray(aData) ? aData : []
      );


      const initialQty: any = {};

      (pData || []).forEach(
        (p: any) => (initialQty[p.id] = 1)
      );

      setQty(initialQty);

      if (userData) {
        const v = await fetchActiveTicket(userData.id);
      }
    } catch {
      Alert.alert(
        "Error",
        "Failed to load data"
      );
    } finally {
      setLoading(false);
    }
  };
  const getTicketStatus = (
    ticket: any,
    theme: any
  ) => {

    switch (ticket?.status) {

      case "ACCEPTED":

        return {
          label: "✅ Accepted",
          color: theme.success,
        };


      case "REJECTED":

        return {
          label: "❌ Rejected",
          color: theme.danger,
        };


      default:

        return {
          label: "⏳ Waiting for response",
          color: theme.warning,
        };

    }

  };
  const statusUI = getTicketStatus(activeTicket, currentTheme);

  // =========================
  // EMPLOYEE TOGGLE
  // =========================
  const handleCallEmployee = async () => {
    if (showEmployees) {
      setShowEmployees(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/active-employees`);

      if (!res.ok) {
        throw new Error();
      }

      const data = await res.json();

      setEmployees(Array.isArray(data) ? data : []);
      setShowEmployees(true);
    } catch {
      Alert.alert("Error", "Failed to load employees");
    }
  };
  const fetchActiveTicket = async (
    customerId: number
  ) => {
    try {
      const res = await fetch(
        `${API_URL}/tickets/customer/${customerId}`
      );

      if (!res.ok) return;

      const data = await res.json();

      const active = data.filter(
        (t: any) =>
          t.customer_id === customerId &&
          (
            t.status === "OPEN" ||
            t.status === "ACCEPTED"
          )
      );

      setActiveTickets(active);

      if (active.length > 0) {
        setActiveTicket(active[0]);
        setTicketRaised(true);
        setTicketId(active[0].id);

        setSelectedEmployee({
          id: active[0].requested_employee_id,
          full_name:
            active[0].requested_employee_name,
        });
      } else {
        setActiveTickets([]);
        setActiveTicket(null);
        setTicketRaised(false);
        setTicketId(null);
        setSelectedEmployee(null);
      }
    } catch (e) {
      console.log(e);
    }
  };
  // =========================
  // RAISE TICKET
  // =========================
  const raiseTicket = async (emp: any) => {
    try {
      console.log(emp);
      setSelectedEmployee(emp);

      const res = await fetch(`${API_URL}/tickets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer_id: user.id,
          employee_id: emp.id,
          message: `Need help from ${emp.full_name}`,
        }),
      });

      if (!res.ok) {
        throw new Error();
      }

      const data = await res.json();

      setTicketRaised(true);
      setTicketId(data.id);
      setActiveTicket(data);

      Alert.alert(
        "Success",
        `Ticket raised for ${emp.full_name}`
      );
    } catch {
      Alert.alert("Error", "Failed to raise ticket");
    }
  };

  const cancelTicket = async () => {
    if (!ticketId) {
      Alert.alert(
        "Error",
        "No active ticket found."
      );
      return;
    }

    try {
      setActionLoading(true);

      const res = await fetch(
        `${API_URL}/tickets/${ticketId}/cancel`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        throw new Error();
      }

      // Reset states
      setTicketRaised(false);
      setTicketId(null);
      setSelectedEmployee(null);
      setActiveTicket(null);
      setMessage("");
      setShowEmployees(false);

      // Reload products + employees
      await loadAll();

      Alert.alert(
        "Success",
        "Ticket cancelled successfully."
      );
    } catch (error) {
      console.log(error);

      Alert.alert(
        "Error",
        "Unable to cancel ticket."
      );
    } finally {
      setActionLoading(false);
    }
  };
  // =========================
  // ORDER
  // =========================
  const placeOrder = async (item: any) => {
    try {
      const res = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: user.id,
          product_id: item.id,
          quantity: qty[item.id] || 1,
          custom_message: comments[item.id] || "",
        }),
      });

      if (!res.ok) throw new Error();

      Alert.alert("Success", `${item.name} ordered`);
      setComments((p) => ({ ...p, [item.id]: "" }));
    } catch {
      Alert.alert("Error", "Order failed");
    }
  };
  const loadTodayAnnouncements = async () => {
    try {
      const res = await fetch(
        `${API_URL}/announcements/today`
      );

      if (!res.ok) return;

      const data = await res.json();

      setAnnouncements(
        Array.isArray(data) ? data : []
      );
    } catch (e) {
      console.log(e);
    }
  };
  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await loadAll();
      if (user?.id) {
        await fetchActiveTicket(user.id);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setRefreshing(false);
    }
  };
  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <View style={stylesObj.loader}>
        <ActivityIndicator size="large" color="#2D8CFF" />
      </View>
    );
  }

  return (
    <ScrollView
      style={stylesObj.container}
      contentContainerStyle={[
        stylesObj.scrollContent,
        { paddingBottom: insets.bottom + 120 }
      ]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#2D8CFF"
        />
      }
    >

      {/* HEADER */}
      <View style={stylesObj.header}>
        <Text style={stylesObj.welcome}>👋 Welcome Back</Text>
        <Text style={stylesObj.name}>{user?.name}</Text>
        <Text style={stylesObj.sub}>What would you like today?</Text>
      </View>
      {/* TODAY ANNOUNCEMENTS */}

      <View style={stylesObj.announcementContainer}>
        <Text style={stylesObj.sectionTitle}>
          📢 Today's Announcements
        </Text>

        {announcements.length === 0 ? (
          <View style={stylesObj.emptyAnnouncement}>
            <Text style={stylesObj.emptyAnnouncementText}>
              No announcements for today
            </Text>
          </View>
        ) : (
          <ScrollView
            style={stylesObj.announcementScroll}
            nestedScrollEnabled
            showsVerticalScrollIndicator={false}
          >
            {announcements.map((item) => (
              <View
                key={item.id}
                style={stylesObj.announcementCard}
              >
                <View
                  style={stylesObj.announcementTop}
                >
                  <View
                    style={
                      stylesObj.announcementIcon
                    }
                  >
                    <Text
                      style={
                        stylesObj.announcementEmoji
                      }
                    >
                      📢
                    </Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text
                      style={
                        stylesObj.announcementTitle
                      }
                    >
                      {item.title}
                    </Text>

                    <Text
                      style={
                        stylesObj.announcementMessage
                      }
                    >
                      {item.message}
                    </Text>

                    <Text
                      style={
                        stylesObj.announcementDate
                      }
                    >
                      {item.created_at
                        ? new Date(
                          item.created_at
                        ).toLocaleString()
                        : ""}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
      {/* CALL EMPLOYEE */}
      <View style={stylesObj.section}>
        <TouchableOpacity
          style={stylesObj.callBtn}
          onPress={handleCallEmployee}
        >
          <Text style={stylesObj.callText}>📞 Call Employee</Text>
        </TouchableOpacity>

        {showEmployees && (
          <View style={{ marginTop: 15 }}>
            <Text style={stylesObj.sectionTitle}>
              Available Employees
            </Text>

            {employees.length === 0 ? (
              <View style={stylesObj.emptyCard}>
                <Text style={stylesObj.empSub}>
                  No employees available
                </Text>
              </View>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={stylesObj.employeeScroll}
              >
                {employees.map((emp) => (
                  <TouchableOpacity
                    key={emp.id}
                    style={[
                      stylesObj.empCard,
                      selectedEmployee?.id === emp.id &&
                      stylesObj.empActive,
                    ]}
                    onPress={() => raiseTicket(emp)}
                  >
                    <Text style={stylesObj.empName}>
                      👤 {emp.full_name}
                    </Text>

                    <Text style={stylesObj.empSub}>
                      Employee ID : {emp.employee_id}
                    </Text>

                    <Text style={stylesObj.empSub}>
                      Status : 🟢 Available
                    </Text>

                    <Text
                      style={{
                        color: "#64B5F6",
                        marginTop: 8,
                        fontWeight: "700",
                      }}
                    >
                      Tap to Raise Ticket
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        )}
      </View>
      {activeTicket && (
        <View style={stylesObj.ticketCard}>
          <Text style={stylesObj.ticketTitle}>
            🎫 Active Support Ticket
          </Text>
          {
            activeTickets.length > 1 && (
              <TouchableOpacity
                style={stylesObj.activeTicketsButton}
                onPress={() =>
                  router.push("/(customer)/active_tickets")
                }
              >
                <View style={stylesObj.activeTicketsRow}>
                  <Text style={stylesObj.activeTicketsIcon}>
                    🎫
                  </Text>

                  <Text style={stylesObj.activeTicketsText}>
                    View All Active Tickets
                  </Text>

                  <View style={stylesObj.ticketCountBadge}>
                    <Text style={stylesObj.ticketCountText}>
                      {activeTickets.length}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            )
          }

          {/* Requested Employee */}
          <Text style={stylesObj.ticketText}>
            Requested Employee:
          </Text>

          <Text style={stylesObj.ticketValue}>
            {activeTicket.requested_employee_name}
          </Text>

          {/* Status */}
          <Text style={stylesObj.ticketText}>
            Status:
          </Text>

          <View
            style={[
              stylesObj.badge,
              {
                backgroundColor: statusUI.color,
              },
            ]}
          >
            <Text style={stylesObj.badgeText}>
              {statusUI.label}
            </Text>
          </View>

          {/* Rejected Employee */}
          {activeTicket?.rejected_employee_name && (
            <>
              <Text style={stylesObj.ticketText}>
                Rejected By:
              </Text>

              <Text
                style={[
                  stylesObj.ticketValue,
                  { color: "#FF8A80" },
                ]}
              >
                {activeTicket.rejected_employee_name}
              </Text>
            </>
          )}

          {/* Reject Reason */}
          {activeTicket?.reject_reason && (
            <>
              <Text style={stylesObj.ticketText}>
                Rejection Reason:
              </Text>

              <Text
                style={[
                  stylesObj.ticketValue,
                  {
                    color: "#FFB74D",
                  },
                ]}
              >
                {activeTicket.reject_reason}
              </Text>
            </>
          )}

          {/* Accepted Employee */}
          {activeTicket?.accepted_employee_name && (
            <>
              <Text style={stylesObj.ticketText}>
                Accepted By:
              </Text>

              <Text
                style={[
                  stylesObj.ticketValue,
                  { color: "#66BB6A" },
                ]}
              >
                {activeTicket.accepted_employee_name}
              </Text>
            </>
          )}

          {/* Someone rejected but another accepted */}
          {activeTicket?.accepted_employee_name &&
            activeTicket?.rejected_employee_name && (
              <View
                style={{
                  marginTop: 12,
                  padding: 12,
                  backgroundColor: "#1B2A1F",
                  borderRadius: 10,
                }}
              >
                <Text
                  style={{
                    color: "#81C784",
                    fontWeight: "700",
                    lineHeight: 20,
                  }}
                >
                  ✅ {activeTicket.rejected_employee_name} could
                  not take your request.
                </Text>

                <Text
                  style={{
                    color: "#81C784",
                    marginTop: 4,
                    lineHeight: 20,
                  }}
                >
                  {activeTicket.accepted_employee_name} has
                  accepted your ticket and is on the way.
                </Text>
              </View>
            )}

          {/* OPEN */}
          {activeTicket?.status === "OPEN" && (
            <>
              <TouchableOpacity
                style={[
                  stylesObj.cancelButton,
                  actionLoading &&
                  stylesObj.disabledButton,
                ]}
                disabled={actionLoading}
                onPress={cancelTicket}
              >
                <Text
                  style={stylesObj.cancelButtonText}
                >
                  {actionLoading
                    ? "Cancelling..."
                    : "Cancel Ticket"}
                </Text>
              </TouchableOpacity>

              <Text style={stylesObj.ticketHint}>
                If one employee rejects your
                request, another employee can
                still accept it.
              </Text>
            </>
          )}

          {/* ACCEPTED */}
          {activeTicket?.status === "ACCEPTED" && (
            <View
              style={{
                marginTop: 12,
                padding: 12,
                backgroundColor: "#1B2A1F",
                borderRadius: 10,
              }}
            >
              <Text
                style={{
                  color: "#66BB6A",
                  marginTop: 4,
                }}
              >
                Employee:{" "}
                {
                  activeTicket.accepted_employee_name
                }
              </Text>
            </View>
          )}

          {/* REJECTED */}
          {activeTicket?.status === "REJECTED" && (
            <View
              style={{
                marginTop: 12,
                padding: 12,
                backgroundColor: "#2A1818",
                borderRadius: 10,
              }}
            >
              <Text
                style={{
                  color: "#EF5350",
                  fontWeight: "700",
                }}
              >
                ❌ Your request was rejected.
              </Text>

              <Text
                style={{
                  color: "#EF9A9A",
                  marginTop: 4,
                }}
              >
                Reason: {activeTicket.reject_reason}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* PRODUCTS */}
      <View style={stylesObj.section}>
        <Text style={stylesObj.sectionTitle}>🍔 Menu</Text>

        <View style={stylesObj.grid}>
          {products.map((item) => (
            <View key={item.id} style={stylesObj.card}>

              <Text style={stylesObj.productName}>{item.name}</Text>

              {/* QUANTITY */}
              <View style={stylesObj.qtyRow}>
                <TouchableOpacity
                  onPress={() =>
                    setQty((p) => ({
                      ...p,
                      [item.id]: Math.max(1, (p[item.id] || 1) - 1),
                    }))
                  }
                  style={stylesObj.qtyBtn}
                >
                  <Text style={stylesObj.qtyText}>-</Text>
                </TouchableOpacity>

                <Text style={stylesObj.qtyNum}>
                  {qty[item.id] || 1}
                </Text>

                <TouchableOpacity
                  onPress={() =>
                    setQty((p) => ({
                      ...p,
                      [item.id]: (p[item.id] || 1) + 1,
                    }))
                  }
                  style={stylesObj.qtyBtn}
                >
                  <Text style={stylesObj.qtyText}>+</Text>
                </TouchableOpacity>
              </View>

              {/* COMMENT */}
              <TextInput
                placeholder="Extra sugar, less ice..."
                placeholderTextColor="#7F8C9A"
                style={stylesObj.input}
                value={comments[item.id] || ""}
                onChangeText={(text) =>
                  setComments((p) => ({ ...p, [item.id]: text }))
                }
              />

              {/* ORDER BTN */}
              <TouchableOpacity
                style={stylesObj.orderBtn}
                onPress={() => placeOrder(item)}
              >
                <Text style={stylesObj.orderText}>Order</Text>
              </TouchableOpacity>

            </View>
          ))}
        </View>
      </View>

    </ScrollView>
  );
}

// =========================
// stylesObj (MODERN UI)
const styles = (theme: any) => StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: theme.background,
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.background,
  },


  // HEADER
  header: {
    padding: 20,
    margin: 15,
    backgroundColor: theme.card,
    borderRadius: 16,
  },

  welcome: {
    color: theme.primary,
    fontWeight: "700",
  },

  name: {
    color: theme.text,
    fontSize: 24,
    fontWeight: "900",
    marginTop: 5,
  },

  sub: {
    color: theme.secondaryText,
    marginTop: 5,
  },


  // SECTIONS
  section: {
    marginHorizontal: 15,
    marginTop: 10,
  },

  sectionTitle: {
    color: theme.text,
    fontSize: 18,
    fontWeight: "900",
    marginVertical: 10,
  },


  // EMPLOYEE

  callBtn: {
    backgroundColor: theme.primary,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },

  callText: {
    color: theme.buttonText,
    fontWeight: "800",
  },


  employeeScroll: {
    paddingVertical: 5,
    paddingRight: 15,
  },


  empCard: {
    backgroundColor: theme.cardSecondary,
    padding: 12,
    borderRadius: 12,
    marginRight: 12,
    width: 170,
  },


  empActive: {
    borderWidth: 2,
    borderColor: theme.primary,
  },


  empName: {
    color: theme.text,
    fontWeight: "800",
  },


  empSub: {
    color: theme.secondaryText,
    fontSize: 12,
  },


  // PRODUCTS

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },


  card: {
    width: "48%",
    backgroundColor: theme.card,
    padding: 12,
    borderRadius: 14,
    marginBottom: 12,
  },


  productName: {
    color: theme.text,
    fontWeight: "800",
    marginBottom: 8,
  },


  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },


  qtyBtn: {
    backgroundColor: theme.cardSecondary,
    padding: 6,
    borderRadius: 8,
    width: 28,
    alignItems: "center",
  },


  qtyText: {
    color: theme.text,
    fontWeight: "900",
  },


  qtyNum: {
    color: theme.text,
    marginHorizontal: 10,
    fontWeight: "800",
  },


  input: {
    backgroundColor: theme.cardSecondary,
    color: theme.text,
    padding: 8,
    borderRadius: 10,
    fontSize: 12,
  },


  orderBtn: {
    backgroundColor: theme.primary,
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
    alignItems: "center",
  },


  orderText: {
    color: theme.buttonText,
    fontWeight: "800",
  },


  scrollContent: {
    paddingBottom: 120,
  },


  employeeContainer: {
    marginTop: 15,
  },


  empAvatar: {
    fontSize: 32,
    marginBottom: 8,
  },


  // TICKET

  ticketCard: {
    backgroundColor: theme.card,
    marginHorizontal: 15,
    marginTop: 15,
    padding: 18,
    borderRadius: 16,
    gap: 6,
  },


  ticketTitle: {
    color: theme.text,
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 15,
  },


  ticketText: {
    color: theme.secondaryText,
    marginTop: 8,
  },


  ticketValue: {
    color: theme.text,
    fontSize: 16,
    fontWeight: "800",
  },


  waitingBadge: {
    marginTop: 10,
    backgroundColor: theme.warning,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    alignSelf: "flex-start",
  },


  waitingText: {
    color: theme.white,
    fontWeight: "800",
  },


  ticketHint: {
    color: theme.primary,
    marginTop: 15,
    lineHeight: 20,
  },


  emptyCard: {
    backgroundColor: theme.card,
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
  },


  // CANCEL

  cancelBtn: {
    backgroundColor: theme.danger,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 15,
  },


  cancelText: {
    color: theme.white,
    fontWeight: "800",
    fontSize: 15,
  },


  cancelButton: {
    backgroundColor: theme.danger,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
  },


  cancelButtonText: {
    color: theme.buttonText,
    fontSize: 16,
    fontWeight: "800",
  },


  disabledButton: {
    opacity: 0.6,
  },


  acceptedBadge: {
    marginTop: 10,
    backgroundColor: theme.success,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    alignSelf: "flex-start",
  },


  rejectedBadge: {
    marginTop: 10,
    backgroundColor: theme.danger,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    alignSelf: "flex-start",
  },


  badge: {
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    alignSelf: "flex-start",
  },


  badgeText: {
    color: theme.white,
    fontWeight: "800",
  },


  // ANNOUNCEMENT

  announcementContainer: {
    marginHorizontal: 15,
    marginTop: 15,
  },


  announcementScroll: {
    maxHeight: 280,
  },


  announcementCard: {
    backgroundColor: theme.card,
    padding: 18,
    borderRadius: 18,
    marginBottom: 12,
    borderLeftWidth: 5,
    borderLeftColor: theme.warning,
  },


  announcementTop: {
    flexDirection: "row",
  },


  announcementIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },


  announcementEmoji: {
    fontSize: 22,
  },


  announcementTitle: {
    color: theme.text,
    fontSize: 17,
    fontWeight: "900",
  },


  announcementMessage: {
    color: theme.text,
    marginTop: 8,
    lineHeight: 22,
  },


  announcementDate: {
    color: theme.secondaryText,
    marginTop: 10,
    fontSize: 11,
  },


  emptyAnnouncement: {
    backgroundColor: theme.card,
    padding: 20,
    borderRadius: 16,
  },


  emptyAnnouncementText: {
    color: theme.secondaryText,
    textAlign: "center",
  },


  // ACTIVE TICKETS

  activeTicketsButton: {
    backgroundColor: theme.primary,
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 18,
    elevation: 3,
  },


  activeTicketsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },


  activeTicketsIcon: {
    fontSize: 22,
  },


  activeTicketsText: {
    flex: 1,
    color: theme.buttonText,
    fontSize: 16,
    fontWeight: "800",
    marginLeft: 12,
  },


  ticketCountBadge: {
    backgroundColor: theme.white,
    minWidth: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
  },


  ticketCountText: {
    color: theme.primary,
    fontSize: 14,
    fontWeight: "900",
  },

});