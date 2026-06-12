import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../config/api";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../constants/theme";

export default function Orders() {
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const userStr = await AsyncStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;

      const res = await fetch(
        `${API_URL}/orders?customer_id=${user.id}`
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
      data={orders}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={{
        padding: 15,
        paddingBottom: insets.bottom + 120,
      }}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <Text style={styles.title}>📦 Your Orders</Text>
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
});