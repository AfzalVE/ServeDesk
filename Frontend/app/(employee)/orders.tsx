import React, { useEffect, useState } from "react";
import {
  Alert,
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { API_URL } from "../../config/api";

type Order = {
  id: number;
  status: string;
  customer_id: number;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // reject modal
  const [rejectModal, setRejectModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  // =========================
  // FETCH ORDERS
  // =========================
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/orders`);
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      Alert.alert("Error", "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // UPDATE STATUS (BACKEND FIXED)
  // =========================
  const updateStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(
        `${API_URL}/orders/${id}/status?status=${status}`,
        {
          method: "PUT",
        }
      );

      if (!res.ok) throw new Error();

      setOrders((prev) =>
        prev.map((o) =>
          o.id === id ? { ...o, status } : o
        )
      );
    } catch {
      Alert.alert("Error", "Failed to update order");
    }
  };

  // =========================
  // ACTIONS
  // =========================
  const acceptOrder = (id: number) => {
    updateStatus(id, "ACCEPTED");
  };

  const deliverOrder = (id: number) => {
    updateStatus(id, "DELIVERED");
  };

  const openReject = (id: number) => {
    setSelectedOrder(id);
    setRejectReason("");
    setRejectModal(true);
  };

  const confirmReject = async () => {
    if (!rejectReason.trim()) {
      Alert.alert("Required", "Reject reason is required");
      return;
    }

    if (!selectedOrder) return;

    try {
      const res = await fetch(
        `${API_URL}/orders/${selectedOrder}/status?status=REJECTED`,
        {
          method: "PUT",
        }
      );

      if (!res.ok) throw new Error();

      setOrders((prev) =>
        prev.map((o) =>
          o.id === selectedOrder
            ? { ...o, status: "REJECTED" }
            : o
        )
      );

      setRejectModal(false);
      setRejectReason("");
      setSelectedOrder(null);

      Alert.alert("Success", "Order Rejected");
    } catch {
      Alert.alert("Error", "Failed to reject order");
    }
  };

  // =========================
  // LOADING UI
  // =========================
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
        <Text style={styles.title}>All Orders</Text>

        {orders.map((order) => {
          const isLocked =
            order.status === "DELIVERED" ||
            order.status === "REJECTED";

          return (
            <View key={order.id} style={styles.card}>
              <Text style={styles.text}>
                Order #{order.id}
              </Text>

              <Text style={styles.sub}>
                Status: {order.status}
              </Text>

              {!isLocked ? (
                <View style={styles.row}>
                  <TouchableOpacity
                    style={styles.btn}
                    onPress={() =>
                      acceptOrder(order.id)
                    }
                  >
                    <Text style={styles.btnText}>
                      Accept
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.btn,
                      { backgroundColor: "#00C853" },
                    ]}
                    onPress={() =>
                      deliverOrder(order.id)
                    }
                  >
                    <Text style={styles.btnText}>
                      Deliver
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.btn,
                      { backgroundColor: "#E53935" },
                    ]}
                    onPress={() =>
                      openReject(order.id)
                    }
                  >
                    <Text style={styles.btnText}>
                      Reject
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <Text style={styles.doneText}>
                  ✔ Order Completed
                </Text>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* ================= REJECT MODAL ================= */}
      <Modal visible={rejectModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              Reject Order
            </Text>

            <TextInput
              placeholder="Enter reason..."
              placeholderTextColor="#888"
              value={rejectReason}
              onChangeText={setRejectReason}
              style={styles.input}
              multiline
            />

            <View style={styles.modalRow}>
              <TouchableOpacity
                style={[
                  styles.btn,
                  { backgroundColor: "#E53935" },
                ]}
                onPress={confirmReject}
              >
                <Text style={styles.btnText}>
                  Confirm
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.btn}
                onPress={() => setRejectModal(false)}
              >
                <Text style={styles.btnText}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#07111F",
  },

  loader: {
    flex: 1,
    justifyContent: "center",
  },

  title: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "900",
    margin: 20,
  },

  card: {
    backgroundColor: "#101E2D",
    margin: 15,
    padding: 15,
    borderRadius: 14,
  },

  text: {
    color: "#fff",
    fontWeight: "800",
  },

  sub: {
    color: "#9DB1C7",
    marginTop: 5,
  },

  row: {
    flexDirection: "row",
    marginTop: 12,
    flexWrap: "wrap",
    gap: 10,
  },

  btn: {
    backgroundColor: "#2D8CFF",
    padding: 10,
    borderRadius: 10,
  },

  btnText: {
    color: "#fff",
    fontWeight: "800",
  },

  doneText: {
    marginTop: 10,
    color: "#9DB1C7",
    fontWeight: "700",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    padding: 20,
  },

  modalBox: {
    backgroundColor: "#101E2D",
    padding: 20,
    borderRadius: 16,
  },

  modalTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 10,
  },

  input: {
    backgroundColor: "#16293D",
    color: "#fff",
    padding: 12,
    borderRadius: 10,
    minHeight: 80,
    marginBottom: 15,
  },

  modalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});