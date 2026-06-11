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
  display_name: string;
  customer_name: string;
  created_at: string;
  reject_reason: string | null;

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
      console.log(data)
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
  const updateStatus = async (
  id: number,
  status: string
) => {
  try {
    let url = `${API_URL}/orders/${id}/status?status=${status}`;

    if (
      status === "REJECTED" &&
      rejectReason.trim()
    ) {
      url += `&reject_reason=${encodeURIComponent(
        rejectReason
      )}`;
    }

    const res = await fetch(url, {
      method: "PUT",
    });

    if (!res.ok) {
      const err = await res.text();
      console.log(err);
      throw new Error();
    }

    setOrders((prev) =>
      prev.map((o) =>
        o.id === id
          ? {
              ...o,
              status,
              reject_reason:
                status === "REJECTED"
                  ? rejectReason
                  : o.reject_reason,
            }
          : o
      )
    );
  } catch {
    Alert.alert(
      "Error",
      "Failed to update order"
    );
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
    Alert.alert(
      "Required",
      "Reject reason is required"
    );
    return;
  }

  if (selectedOrder === null) return;

  await updateStatus(
    selectedOrder,
    "REJECTED"
  );

  setRejectModal(false);
  setRejectReason("");
  setSelectedOrder(null);

  Alert.alert(
    "Success",
    "Order Rejected"
  );
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
              <View style={styles.cardHeader}>
                <Text style={styles.orderId}>
                  🧾 Order #{order.id}
                </Text>

                <View
                  style={[
                    styles.statusBadge,
                    order.status === "PENDING" &&
                    styles.pending,
                    order.status === "ACCEPTED" &&
                    styles.accepted,
                    order.status === "DELIVERED" &&
                    styles.delivered,
                    order.status === "REJECTED" &&
                    styles.rejected,
                  ]}
                >
                  <Text style={styles.statusText}>
                    {order.status}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <Text style={styles.label}>
                  🍔 Product
                </Text>

                <Text style={styles.value}>
                  {order.display_name}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.label}>
                  👤 Customer
                </Text>

                <Text style={styles.value}>
                  {order.customer_name}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.label}>
                  🆔 Customer ID
                </Text>

                <Text style={styles.value}>
                  {order.customer_id}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.label}>
                  🕒 Time
                </Text>

                <Text style={styles.value}>
                  {new Date(
                    order.created_at
                  ).toLocaleString()}
                </Text>
              </View>

              {order.status !== "DELIVERED" &&
                order.status !== "REJECTED" && (
                  <View style={styles.buttonRow}>
                    {order.status === "PENDING" && (
                      <TouchableOpacity
                        style={styles.acceptBtn}
                        onPress={() =>
                          acceptOrder(order.id)
                        }
                      >
                        <Text style={styles.buttonText}>
                          Accept
                        </Text>
                      </TouchableOpacity>
                    )}

                    {order.status === "ACCEPTED" && (
                      <TouchableOpacity
                        style={styles.deliverBtn}
                        onPress={() =>
                          deliverOrder(order.id)
                        }
                      >
                        <Text style={styles.buttonText}>
                          Deliver
                        </Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      style={styles.rejectBtn}
                      onPress={() =>
                        openReject(order.id)
                      }
                    >
                      <Text style={styles.buttonText}>
                        Reject
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

              {(order.status === "DELIVERED" ||
                order.status === "REJECTED") && (
                  <Text style={styles.completedText}>
                    ✔ Order processing completed
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
                style={styles.btn}
                onPress={() => setRejectModal(false)}
              >
                <Text style={styles.btnText}>
                  Cancel
                </Text>
              </TouchableOpacity>
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

  left: {
    color: "#90A4AE",
    fontSize: 14,
    fontWeight: "700",
  },

  right: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  card: {
  backgroundColor: "#101E2D",
  marginHorizontal: 16,
  marginVertical: 8,
  padding: 18,
  borderRadius: 18,
},

cardHeader: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
},

orderId: {
  color: "#FFFFFF",
  fontSize: 20,
  fontWeight: "900",
},

divider: {
  height: 1,
  backgroundColor: "#22384F",
  marginVertical: 15,
},

infoRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  marginVertical: 6,
},

label: {
  color: "#90A4AE",
  fontSize: 14,
  fontWeight: "700",
},

value: {
  color: "#FFFFFF",
  fontSize: 14,
  fontWeight: "800",
  maxWidth: "60%",
  textAlign: "right",
},

statusBadge: {
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 10,
},

pending: {
  backgroundColor: "#FB8C00",
},

accepted: {
  backgroundColor: "#1E88E5",
},

delivered: {
  backgroundColor: "#43A047",
},

rejected: {
  backgroundColor: "#E53935",
},

statusText: {
  color: "#FFFFFF",
  fontWeight: "800",
  fontSize: 12,
},

buttonRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  marginTop: 20,
},

acceptBtn: {
  flex: 1,
  backgroundColor: "#1976D2",
  padding: 12,
  borderRadius: 12,
  alignItems: "center",
  marginRight: 8,
},

deliverBtn: {
  flex: 1,
  backgroundColor: "#2E7D32",
  padding: 12,
  borderRadius: 12,
  alignItems: "center",
  marginRight: 8,
},

rejectBtn: {
  flex: 1,
  backgroundColor: "#D32F2F",
  padding: 12,
  borderRadius: 12,
  alignItems: "center",
},

buttonText: {
  color: "#FFFFFF",
  fontWeight: "800",
  fontSize: 15,
},

completedText: {
  color: "#64B5F6",
  textAlign: "center",
  marginTop: 18,
  fontWeight: "700",
},
});