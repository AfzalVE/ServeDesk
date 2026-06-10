import React, { useEffect, useState } from "react";
import { router } from "expo-router";

import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  TextInput,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../config/api";

// ==========================
// MENU CARD
// ==========================
const MenuCard = ({ item, onOrder, ordering }: any) => {
  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() => onOrder(item)}
      disabled={ordering}
    >
      <Text style={styles.icon}>{item.icon || "🍽️"}</Text>

      <Text style={styles.cardTitle}>{item.name}</Text>

      <View style={styles.orderButton}>
        {ordering ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.orderText}>Order</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

// ==========================
// MAIN SCREEN
// ==========================
export default function CustomerHome() {
  const [user, setUser] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);

  // CUSTOM ORDER STATE
  const [customText, setCustomText] = useState("");
  const [customProductId, setCustomProductId] = useState<number | null>(null);
  const [customLoading, setCustomLoading] = useState(false);

  // ==========================
  // LOAD DATA
  // ==========================
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) setUser(JSON.parse(storedUser));

      const res = await fetch(`${API_URL}/products`);
      const data = await res.json();

      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      Alert.alert("Error", "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // ==========================
  // PLACE ORDER (NORMAL)
  // ==========================
  const placeOrder = async (item: any) => {
    try {
      if (!user?.id) {
        Alert.alert("Error", "User not found. Please login again.");
        return;
      }

      setOrdering(true);

      const res = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: user.id,
          product_id: item.id,
          quantity: 1,
          custom_message: "",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        Alert.alert("Error", data.detail || "Order failed");
        return;
      }

      Alert.alert("Order Created", `${item.name} ordered successfully`);
    } catch (err) {
      Alert.alert("Error", "Failed to place order");
    } finally {
      setOrdering(false);
    }
  };

  // ==========================
  // CUSTOM ORDER
  // ==========================
  const placeCustomOrder = async () => {
    try {
      if (!user?.id) {
        Alert.alert("Error", "User not found");
        return;
      }

      if (!customText.trim()) {
        Alert.alert("Error", "Please write your custom order");
        return;
      }

      setCustomLoading(true);

      const res = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: user.id,
          product_id: customProductId, // optional
          quantity: 1,
          custom_message: customText,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        Alert.alert("Error", data.detail || "Custom order failed");
        return;
      }

      Alert.alert("Success", "Custom order placed!");

      setCustomText("");
      setCustomProductId(null);
    } catch (err) {
      Alert.alert("Error", "Failed to place custom order");
    } finally {
      setCustomLoading(false);
    }
  };

  // ==========================
  // RAISE TICKET
  // ==========================
  const raiseTicket = async () => {
    try {
      if (!user?.id) {
        Alert.alert("Error", "User not found");
        return;
      }

      const res = await fetch(`${API_URL}/tickets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: user.id,
          message: "Need assistance from employee",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        Alert.alert("Error", data.detail || "Ticket failed");
        return;
      }

      Alert.alert("Ticket Raised", "Employee has been notified.");
    } catch (err) {
      Alert.alert("Error", "Failed to raise ticket");
    }
  };

  // ==========================
  // LOGOUT
  // ==========================
  const logout = async () => {
    Alert.alert("Logout", "Do you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        onPress: async () => {
          await AsyncStorage.removeItem("user");
          router.replace("/(auth)/sign-in");
        },
      },
    ]);
  };

  // ==========================
  // LOADING
  // ==========================
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#2D8CFF" />
          <Text style={styles.loaderText}>Loading data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* HEADER */}
        <View style={styles.headerCard}>
          <View>
            <Text style={styles.welcome}>Welcome Back 👋</Text>
            <Text style={styles.userName}>{user?.name || "User"}</Text>
            <Text style={styles.userEmail}>{user?.email || ""}</Text>
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* TICKET */}
        <View style={styles.ticketBox}>
          <Text style={styles.ticketTitle}>🚨 Need Assistance?</Text>
          <Text style={styles.ticketSub}>
            Raise a support request instantly.
          </Text>

          <TouchableOpacity style={styles.ticketButton} onPress={raiseTicket}>
            <Text style={styles.ticketButtonText}>Call Employee</Text>
          </TouchableOpacity>
        </View>

        {/* ==========================
            CUSTOM ORDER SECTION
        ========================== */}
        <View style={styles.customBox}>
          <Text style={styles.customTitle}>📝 Custom Order</Text>

          <TextInput
            style={styles.customInput}
            placeholder="Write your custom request..."
            placeholderTextColor="#7F8C9A"
            value={customText}
            onChangeText={setCustomText}
            multiline
          />

          <Text style={styles.optionalText}>
            Optional: Link to a product (tap below)
          </Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {products.map((p) => (
              <TouchableOpacity
                key={p.id}
                onPress={() => setCustomProductId(p.id)}
                style={[
                  styles.productChip,
                  customProductId === p.id && styles.productChipActive,
                ]}
              >
                <Text style={styles.productChipText}>{p.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity
            style={styles.customButton}
            onPress={placeCustomOrder}
          >
            {customLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.customButtonText}>Submit Custom Order</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* AVAILABLE ITEMS */}
        <Text style={styles.section}>Available Items</Text>

        {products.length === 0 ? (
          <Text style={styles.emptyText}>No products available</Text>
        ) : (
          <View style={styles.grid}>
            {products.map((item) => (
              <MenuCard
                key={item.id}
                item={item}
                onOrder={placeOrder}
                ordering={ordering}
              />
            ))}
          </View>
        )}

        {/* BOTTOM */}
        <View style={styles.bottomCard}>
          <Text style={styles.bottomTitle}>Active Service</Text>
          <Text style={styles.bottomText}>
            ✓ Live tracking{"\n"}
            ✓ Employee notification{"\n"}
            ✓ Custom orders supported
          </Text>
        </View>

      </ScrollView>
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
  },

  headerCard: {
    margin: 20,
    backgroundColor: "#16293D",
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  welcome: {
    color: "#64B5F6",
    fontSize: 16,
    fontWeight: "700",
  },

  userName: {
    color: "#FFF",
    fontSize: 28,
    fontWeight: "900",
    marginTop: 5,
  },

  userEmail: {
    color: "#A8B9C8",
    marginTop: 8,
  },

  logoutButton: {
    backgroundColor: "#E53935",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
  },

  logoutText: {
    color: "#FFF",
    fontWeight: "800",
  },

  ticketBox: {
    marginHorizontal: 20,
    backgroundColor: "#16293D",
    borderRadius: 20,
    padding: 22,
    marginBottom: 25,
  },

  ticketTitle: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "900",
  },

  ticketSub: {
    color: "#B5C4D4",
    marginTop: 10,
    lineHeight: 22,
  },

  ticketButton: {
    marginTop: 20,
    backgroundColor: "#E53935",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
  },

  ticketButtonText: {
    color: "#FFF",
    fontWeight: "800",
    fontSize: 16,
  },

  section: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "900",
    marginLeft: 20,
    marginBottom: 15,
  },

  grid: {
    paddingHorizontal: 15,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  card: {
    width: "48%",
    backgroundColor: "#101E2D",
    borderRadius: 18,
    padding: 18,
    marginBottom: 15,
    alignItems: "center",
  },

  icon: {
    fontSize: 40,
  },

  cardTitle: {
    color: "#FFF",
    textAlign: "center",
    marginTop: 12,
    fontWeight: "700",
    minHeight: 40,
  },

  orderButton: {
    marginTop: 15,
    backgroundColor: "#2D8CFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    minWidth: 80,
    alignItems: "center",
  },

  orderText: {
    color: "#FFF",
    fontWeight: "800",
  },

  bottomCard: {
    backgroundColor: "#16293D",
    margin: 20,
    borderRadius: 20,
    padding: 24,
    marginBottom: 40,
  },

  bottomTitle: {
    color: "#FFF",
    fontSize: 22,
    fontWeight: "900",
  },

  bottomText: {
    color: "#B5C4D4",
    marginTop: 15,
    lineHeight: 28,
  },

  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#07111F",
  },

  loaderText: {
    marginTop: 12,
    color: "#B5C4D4",
    fontSize: 14,
    fontWeight: "600",
  },

  emptyText: {
    color: "#B5C4D4",
    textAlign: "center",
    marginTop: 20,
  },
  customBox: {
  marginHorizontal: 20,
  backgroundColor: "#101E2D",
  borderRadius: 20,
  padding: 18,
  marginBottom: 20,
},

customTitle: {
  color: "#FFF",
  fontSize: 20,
  fontWeight: "900",
  marginBottom: 10,
},

customInput: {
  backgroundColor: "#16293D",
  color: "#FFF",
  borderRadius: 12,
  padding: 12,
  minHeight: 80,
  textAlignVertical: "top",
},

optionalText: {
  color: "#A8B9C8",
  marginTop: 10,
  marginBottom: 8,
},

productChip: {
  backgroundColor: "#16293D",
  padding: 10,
  borderRadius: 20,
  marginRight: 8,
},

productChipActive: {
  backgroundColor: "#2D8CFF",
},

productChipText: {
  color: "#FFF",
  fontSize: 12,
},

customButton: {
  marginTop: 15,
  backgroundColor: "#2D8CFF",
  padding: 14,
  borderRadius: 14,
  alignItems: "center",
},

customButtonText: {
  color: "#FFF",
  fontWeight: "800",
},
});