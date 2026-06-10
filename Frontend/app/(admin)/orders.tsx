import React, { useEffect, useState } from "react";
import {
  Alert,
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { API_URL } from "../../config/api";

// ==========================
// STATUS COLORS
// ==========================
const STATUS_COLORS: any = {
  PENDING: "#FFC107",
  ACCEPTED: "#2D8CFF",
  COMPLETED: "#4CAF50",
  CANCELLED: "#E53935",
};

export default function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // ==========================
  // LOAD ORDERS
  // ==========================
  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/orders`);
      const data = await res.json();

      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      Alert.alert("Error", "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  // ==========================
  // UPDATE STATUS
  // ==========================
  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`${API_URL}/orders/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();

      if (!res.ok) {
        Alert.alert("Error", data.detail || "Update failed");
        return;
      }

      setOrders((prev) =>
        prev.map((o) =>
          o.id === id ? { ...o, status } : o
        )
      );
    } catch {
      Alert.alert("Error", "Server error");
    }
  };

  // ==========================
  // FILTER ORDERS
  // ==========================
  const filtered = orders.filter((o) =>
    `${o.id} ${o.status} ${o.customer_name || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // ==========================
  // LOADING
  // ==========================
  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#2D8CFF" />
        <Text style={styles.loaderText}>Loading orders...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Orders</Text>
      <Text style={styles.subTitle}>
        Manage all customer requests
      </Text>

      {/* SEARCH */}
      <TextInput
        placeholder="Search orders..."
        placeholderTextColor="#777"
        value={search}
        onChangeText={setSearch}
        style={styles.search}
      />

      {/* LIST */}
      {filtered.length === 0 ? (
        <Text style={styles.empty}>No orders found</Text>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>

              {/* LEFT INFO */}
              <View style={{ flex: 1 }}>
                <Text style={styles.orderId}>
                  Order #{item.id}
                </Text>

                <Text style={styles.subText}>
                  Product: {item.product_name || "N/A"}
                </Text>

                <Text style={styles.subText}>
                  Customer: {item.customer_name || "Unknown"}
                </Text>

                {/* STATUS */}
                <Text
                  style={[
                    styles.status,
                    {
                      color:
                        STATUS_COLORS[item.status] ||
                        "#fff",
                    },
                  ]}
                >
                  {item.status}
                </Text>
              </View>

              {/* ACTIONS */}
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.btn}
                  onPress={() =>
                    updateStatus(item.id, "ACCEPTED")
                  }
                >
                  <Text style={styles.btnText}>Accept</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.btn,
                    { backgroundColor: "#4CAF50" },
                  ]}
                  onPress={() =>
                    updateStatus(item.id, "COMPLETED")
                  }
                >
                  <Text style={styles.btnText}>Done</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.btn,
                    { backgroundColor: "#E53935" },
                  ]}
                  onPress={() =>
                    updateStatus(item.id, "CANCELLED")
                  }
                >
                  <Text style={styles.btnText}>Cancel</Text>
                </TouchableOpacity>
              </View>

            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

// ==========================
// STYLES
// ==========================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#07111F",
    padding: 15,
  },

  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "900",
  },

  subTitle: {
    color: "#aaa",
    marginBottom: 15,
  },

  search: {
    backgroundColor: "#16293D",
    color: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#07111F",
  },

  loaderText: {
    marginTop: 10,
    color: "#aaa",
  },

  empty: {
    color: "#aaa",
    textAlign: "center",
    marginTop: 20,
  },

  card: {
    backgroundColor: "#101E2D",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  orderId: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },

  subText: {
    color: "#aaa",
    marginTop: 4,
  },

  status: {
    marginTop: 8,
    fontWeight: "900",
  },

  actions: {
    marginLeft: 10,
    alignItems: "flex-end",
  },

  btn: {
    backgroundColor: "#2D8CFF",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 5,
  },

  btnText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "800",
  },
});