import React, { useEffect, useState } from "react";
import { useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { API_URL } from "../../config/api";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../constants/theme";

export default function Orders() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const socket = useRef<WebSocket | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);
  useEffect(() => {
    const initWS = async () => {
      try {
        const userStr = await AsyncStorage.getItem("user");
        const user = userStr ? JSON.parse(userStr) : null;

        if (!user) return;

        socket.current = new WebSocket(
          API_URL.replace("http", "ws") + "/ws/orders"
        );

        socket.current.onopen = () => {
          console.log("✅ Orders WebSocket Connected");
        };

        socket.current.onmessage = (event) => {
          console.log("📦 Order Update:", event.data);

          // reload orders whenever backend sends update
          loadOrders();
        };

        socket.current.onerror = (error) => {
          console.log("❌ Orders WS Error:", error);
        };

        socket.current.onclose = () => {
          console.log("🔌 Orders WS Closed");
        };
      } catch (err) {
        console.log(err);
      }
    };

    initWS();

    return () => {
      socket.current?.close();
    };
  }, []);
  const loadOrders = async () => {
    try {
      const userStr = await AsyncStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;

      const res = await fetch(
        `${API_URL}/orders/customer/${user.id}`
      );

      const data = await res.json();
      setOrders(
        Array.isArray(data)
          ? [...data].sort((a, b) => {
            // Pending first
            if (
              a.status === "PENDING" &&
              b.status !== "PENDING"
            )
              return -1;

            if (
              a.status !== "PENDING" &&
              b.status === "PENDING"
            )
              return 1;

            // Then latest first
            return (
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
            );
          })
          : []
      );
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };
  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await loadOrders();
    } catch (e) {
      console.log(e);
    } finally {
      setRefreshing(false);
    }
  };
  const cancelOrder = async (id: number) => {
    try {

      const res = await fetch(
        `${API_URL}/orders/${id}/status?status=CANCELLED`,
        {
          method: "PUT",
        }
      );


      if (!res.ok) {
        throw new Error();
      }


      setOrders((prev) =>
        prev.map((order) =>
          order.id === id
            ? {
              ...order,
              status: "CANCELLED",
            }
            : order
        )
      );


    } catch (error) {

      console.log(error);

    }
  };
  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const changeDay = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const onDateChange = (
    event: any,
    date?: Date
  ) => {
    setShowDatePicker(false);

    if (date) {
      setSelectedDate(date);
    }
  };
  const filteredOrders = orders.filter((order) => {
    return (
      formatDate(
        new Date(order.created_at)
      ) === formatDate(selectedDate)
    );
  });
  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#2D8CFF" />
      </View>
    );
  }

  return (

    <FlatList
      style={styles.container}
      data={filteredOrders}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={{
        padding: 15,
        paddingBottom: insets.bottom + 120,
      }}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <>
          <Text style={styles.title}>
            📦 Your Orders
          </Text>

          <View style={styles.dateRow}>
            <TouchableOpacity
              style={styles.dayButton}
              onPress={() => changeDay(-1)}
            >
              <Text style={styles.dayButtonText}>
                ◀
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dateButton}
              onPress={() =>
                setShowDatePicker(true)
              }
            >
              <Text style={styles.dateText}>
                📅 {selectedDate.toDateString()}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dayButton}
              onPress={() => changeDay(1)}
            >
              <Text style={styles.dayButtonText}>
                ▶
              </Text>
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="default"
              onChange={onDateChange}
            />
          )}
        </>
      }
      ListEmptyComponent={
        <Text style={styles.empty}>
          No orders found for selected date
        </Text>
      }

      refreshing={refreshing}
      onRefresh={onRefresh}

      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.orderId}>
            Order #{item.id}
          </Text>

          {item.display_name ? (
            <Text style={styles.line}>
              🍽 Product Name: {item.display_name}
            </Text>
          ) : (
            <Text style={styles.line}>
              🛒 Custom Order: {item.custom_item_name || "N/A"}
            </Text>
          )}

          <Text style={styles.line}>
            🔢 Quantity: {item.quantity}
          </Text>

          {item.custom_message ? (
            <Text style={styles.message}>
              📝 {item.custom_message}
            </Text>
          ) : null}

          <Text style={styles.date}>
            📅 {new Date(item.created_at).toLocaleString()}
          </Text>
          <View
            style={[
              styles.status,
              item.status === "DELIVERED"
                ? styles.delivered
                : item.status === "ACCEPTED"
                  ? styles.accepted
                  : item.status === "PREPARING"
                    ? styles.preparing
                    : item.status === "CANCELLED"
                      ? styles.cancelled
                      : item.status === "REJECTED"
                        ? styles.rejected
                        : styles.pending,
            ]}
          >
            <Text style={styles.statusText}>
              {item.status}
            </Text>
          </View>
          {item.status === "PENDING" && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => cancelOrder(item.id)}
            >
              <Text style={styles.cancelButtonText}>
                Cancel Order
              </Text>
            </TouchableOpacity>
          )}
          {item.reject_reason ? (
            <View style={styles.reasonBox}>
              <Text style={styles.reasonTitle}>
                ❌ Reject Reason
              </Text>

              <Text style={styles.reasonText}>
                {item.reject_reason}
              </Text>
            </View>
          ) : null}
        </View>
      )}
    />
  );

}

// =====================
// STYLES (PRO UI)
// =====================
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },

  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "900",
    margin: 15,
  },

  card: {
    backgroundColor: "#101E2D",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },

  orderId: {
    color: "#2D8CFF",
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 10,
  },

  line: {
    color: "#B5C4D4",
    marginTop: 4,
    fontSize: 13,
  },

  message: {
    color: "#64B5F6",
    marginTop: 8,
    fontStyle: "italic",
  },

  date: {
    color: "#7F8C9A",
    marginTop: 10,
    fontSize: 12,
  },

  status: {
    marginTop: 12,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },

  pending: {
    backgroundColor: "#FFA726",
  },

  accepted: {
    backgroundColor: "#42A5F5",
  },

  preparing: {
    backgroundColor: "#AB47BC",
  },

  delivered: {
    backgroundColor: "#66BB6A",
  },

  cancelled: {
    backgroundColor: "#E53935",
  },

  statusText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
  },
  reasonBox: {
    marginTop: 12,
    backgroundColor: "#2A1620",
    padding: 10,
    borderRadius: 10,
  },

  reasonTitle: {
    color: "#FF8A80",
    fontWeight: "800",
    marginBottom: 5,
  },

  reasonText: {
    color: "#FFFFFF",
    lineHeight: 20,
  },

  rejected: {
    backgroundColor: "#D32F2F",
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 15,
    marginBottom: 20,
  },

  dayButton: {
    backgroundColor: "#101E2D",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },

  dayButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },

  dateButton: {
    flex: 1,
    marginHorizontal: 10,
    backgroundColor: "#101E2D",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  dateText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },

  empty: {
    color: "#AAA",
    textAlign: "center",
    marginTop: 50,
  },
  cancelButton: {
  marginTop: 15,
  backgroundColor: "#D32F2F",
  paddingVertical: 10,
  borderRadius: 10,
  alignItems: "center",
},


cancelButtonText: {
  color: "#FFFFFF",
  fontWeight: "800",
  fontSize: 14,
},
});