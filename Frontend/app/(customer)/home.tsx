import React, { useEffect, useState,useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";



import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { API_URL } from "../../config/api";
export default function Home() {
  const [user, setUser] = useState<any>(null);
  const socket = useRef<WebSocket | null>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [showEmployees, setShowEmployees] = useState(false);
  const [activeTicket, setActiveTicket] = useState<any>(null);
  const [ticketLoading, setTicketLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [ticketRaised, setTicketRaised] = useState(false);

  const [ticketId, setTicketId] = useState<number | null>(null);

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);

  // comments + quantity
  const [comments, setComments] = useState<{ [key: number]: string }>({});
  const [qty, setQty] = useState<{ [key: number]: number }>({});
  const insets = useSafeAreaInsets();


  // =========================
  // LOAD DATA
  // =========================
  useEffect(() => {
    loadAll();
  }, []);
  useEffect(() => {

    // Create websocket connection
    socket.current = new WebSocket(
      API_URL.replace("http", "ws") + "/ws/tickets"
    );

    socket.current.onopen = () => {
      console.log("✅ WebSocket Connected");
    };

    socket.current.onmessage = (event) => {
      console.log("📩 WS Message:", event.data);

      // Refresh dashboard data whenever backend sends an event
      fetchActiveTicket(user.id);
    };

    socket.current.onerror = (error) => {
      console.log("❌ WebSocket Error:", error);
    };

    socket.current.onclose = () => {
      console.log("🔌 WebSocket Closed");
    };

    return () => {
      socket.current?.close();
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

      const [pRes, eRes] = await Promise.all([
        fetch(`${API_URL}/products`),
        fetch(`${API_URL}/employees`),
      ]);

      const pData = await pRes.json();
      const eData = await eRes.json();

      setProducts(Array.isArray(pData) ? pData : []);
      setEmployees(Array.isArray(eData) ? eData : []);

      const initialQty: any = {};

      (pData || []).forEach(
        (p: any) => (initialQty[p.id] = 1)
      );

      setQty(initialQty);

      if (userData) {
        await fetchActiveTicket(userData.id);
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

  // =========================
  // EMPLOYEE TOGGLE
  // =========================
  const handleCallEmployee = async () => {
    if (showEmployees) {
      setShowEmployees(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/employees`);

      if (!res.ok) {
        throw new Error();
      }

      const data = await res.json();
      console.log("Fetched employees:", data);

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
      console.log("Fetched tickets for active check:", data);

      const active = data.find(
        (t: any) =>
          t.customer_id === customerId &&
          (
            t.status === "OPEN" ||
            t.status === "ACCEPTED"
          )
      );

      if (active) {
        setActiveTicket(active);
        setTicketRaised(true);
        setTicketId(active.id);

        setSelectedEmployee({
          id: active.requested_employee_id,
          full_name:
            active.requested_employee_name,
        });
      } else {
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

  // =========================
  // LOADING
  // =========================
  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#2D8CFF" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingBottom: insets.bottom + 120 }
      ]}
      showsVerticalScrollIndicator={false}
    >

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.welcome}>👋 Welcome Back</Text>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.sub}>What would you like today?</Text>
      </View>

      {/* CALL EMPLOYEE */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.callBtn}
          onPress={handleCallEmployee}
        >
          <Text style={styles.callText}>📞 Call Employee</Text>
        </TouchableOpacity>

        {showEmployees && (
          <View style={{ marginTop: 15 }}>
            <Text style={styles.sectionTitle}>
              Available Employees
            </Text>

            {employees.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.empSub}>
                  No employees available
                </Text>
              </View>
            ) : (
              employees.map((emp) => (
                <TouchableOpacity
                  key={emp.id}
                  style={[
                    styles.empCard,
                    selectedEmployee?.id === emp.id &&
                    styles.empActive,
                  ]}
                  onPress={() => raiseTicket(emp)}
                >
                  <Text style={styles.empName}>
                    👤 {emp.full_name}
                  </Text>

                  <Text style={styles.empSub}>
                    Employee ID : {emp.employee_id}
                  </Text>

                  <Text style={styles.empSub}>
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
              ))
            )}
          </View>
        )}
      </View>
      {activeTicket && (
        <View style={styles.ticketCard}>
          <Text style={styles.ticketTitle}>
            🎫 Active Support Ticket
          </Text>

          <Text style={styles.ticketText}>
            Requested Employee:
          </Text>

          <Text style={styles.ticketValue}>
            {selectedEmployee?.full_name}
          </Text>

          <Text style={styles.ticketText}>
            Status:
          </Text>

          <View
            style={[
              styles.waitingBadge,
              activeTicket?.status === "ACCEPTED"
                ? styles.acceptedBadge
                : activeTicket?.status === "OPEN"
                  ? styles.waitingBadge
                  : styles.rejectedBadge,
            ]}
          >
            <Text style={styles.waitingText}>
              {activeTicket?.status === "ACCEPTED"
                ? "✅ Accepted"
                : activeTicket?.status === "REJECTED"
                  ? "❌ Rejected"
                  : "⏳ Waiting for response"}
            </Text>
          </View>
          {activeTicket?.status === "ACCEPTED" && (
            <>
              <Text style={styles.ticketText}>
                Accepted By:
              </Text>

              <Text style={styles.ticketValue}>
                {activeTicket.accepted_employee_name}
              </Text>
            </>
          )}
          {/* Show Cancel button only while ticket is OPEN */}
          {activeTicket?.status === "OPEN" && (
            <>
              <TouchableOpacity
                style={[
                  styles.cancelButton,
                  actionLoading &&
                  styles.disabledButton,
                ]}
                disabled={actionLoading}
                onPress={cancelTicket}
              >
                <Text style={styles.cancelButtonText}>
                  {actionLoading
                    ? "Cancelling..."
                    : "Cancel Ticket"}
                </Text>
              </TouchableOpacity>

              <Text style={styles.ticketHint}>
                If rejected, another employee can
                accept your request.
              </Text>
            </>
          )}

          {/* Show accepted message */}
          {activeTicket?.status === "ACCEPTED" && (
            <Text
              style={[
                styles.ticketHint,
                {
                  color: "#4CAF50",
                  fontWeight: "700",
                },
              ]}
            >
              ✅ Your request has been accepted.
              An employee is on the way.
            </Text>
          )}

        </View>
      )}

      {/* PRODUCTS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🍔 Menu</Text>

        <View style={styles.grid}>
          {products.map((item) => (
            <View key={item.id} style={styles.card}>

              <Text style={styles.productName}>{item.name}</Text>

              {/* QUANTITY */}
              <View style={styles.qtyRow}>
                <TouchableOpacity
                  onPress={() =>
                    setQty((p) => ({
                      ...p,
                      [item.id]: Math.max(1, (p[item.id] || 1) - 1),
                    }))
                  }
                  style={styles.qtyBtn}
                >
                  <Text style={styles.qtyText}>-</Text>
                </TouchableOpacity>

                <Text style={styles.qtyNum}>
                  {qty[item.id] || 1}
                </Text>

                <TouchableOpacity
                  onPress={() =>
                    setQty((p) => ({
                      ...p,
                      [item.id]: (p[item.id] || 1) + 1,
                    }))
                  }
                  style={styles.qtyBtn}
                >
                  <Text style={styles.qtyText}>+</Text>
                </TouchableOpacity>
              </View>

              {/* COMMENT */}
              <TextInput
                placeholder="Extra sugar, less ice..."
                placeholderTextColor="#7F8C9A"
                style={styles.input}
                value={comments[item.id] || ""}
                onChangeText={(text) =>
                  setComments((p) => ({ ...p, [item.id]: text }))
                }
              />

              {/* ORDER BTN */}
              <TouchableOpacity
                style={styles.orderBtn}
                onPress={() => placeOrder(item)}
              >
                <Text style={styles.orderText}>Order</Text>
              </TouchableOpacity>

            </View>
          ))}
        </View>
      </View>

    </ScrollView>
  );
}

// =========================
// STYLES (MODERN UI)
// =========================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#07111F",
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#07111F",
  },

  header: {
    padding: 20,
    margin: 15,
    backgroundColor: "#101E2D",
    borderRadius: 16,
  },

  welcome: {
    color: "#64B5F6",
    fontWeight: "700",
  },

  name: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "900",
    marginTop: 5,
  },

  sub: {
    color: "#A8B9C8",
    marginTop: 5,
  },

  section: {
    marginHorizontal: 15,
    marginTop: 10,
  },

  callBtn: {
    backgroundColor: "#2D8CFF",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },

  callText: {
    color: "#fff",
    fontWeight: "800",
  },

  empCard: {
    backgroundColor: "#16293D",
    padding: 12,
    borderRadius: 12,
    marginRight: 10,
    marginTop: 10,
    width: 140,
  },

  empActive: {
    borderWidth: 2,
    borderColor: "#2D8CFF",
  },

  empName: {
    color: "#fff",
    fontWeight: "800",
  },

  empSub: {
    color: "#A8B9C8",
    fontSize: 12,
  },

  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900",
    marginVertical: 10,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  card: {
    width: "48%",
    backgroundColor: "#101E2D",
    padding: 12,
    borderRadius: 14,
    marginBottom: 12,
  },

  productName: {
    color: "#fff",
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
    backgroundColor: "#16293D",
    padding: 6,
    borderRadius: 8,
    width: 28,
    alignItems: "center",
  },

  qtyText: {
    color: "#fff",
    fontWeight: "900",
  },

  qtyNum: {
    color: "#fff",
    marginHorizontal: 10,
    fontWeight: "800",
  },

  input: {
    backgroundColor: "#16293D",
    color: "#fff",
    padding: 8,
    borderRadius: 10,
    fontSize: 12,
  },

  orderBtn: {
    backgroundColor: "#2D8CFF",
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
    alignItems: "center",
  },

  orderText: {
    color: "#fff",
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

  ticketCard: {
    backgroundColor: "#101E2D",
    marginHorizontal: 15,
    marginTop: 15,
    padding: 18,
    borderRadius: 16,
  },

  ticketTitle: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 15,
  },

  ticketText: {
    color: "#A8B9C8",
    marginTop: 8,
  },

  ticketValue: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "800",
  },

  waitingBadge: {
    marginTop: 10,
    backgroundColor: "#FFA726",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    alignSelf: "flex-start",
  },

  waitingText: {
    color: "#FFF",
    fontWeight: "800",
  },

  ticketHint: {
    color: "#64B5F6",
    marginTop: 15,
    lineHeight: 20,
  },
  emptyCard: {
    backgroundColor: "#101E2D",
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
  },
  cancelBtn: {
    backgroundColor: "#E53935",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 15,
  },

  cancelText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 15,
  },
  cancelButton: {
    backgroundColor: "#E53935",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
  },

  cancelButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },

  disabledButton: {
    opacity: 0.6,
  },
  acceptedBadge: {
    marginTop: 10,
    backgroundColor: "#43A047",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    alignSelf: "flex-start",
  },

  rejectedBadge: {
    marginTop: 10,
    backgroundColor: "#E53935",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
});