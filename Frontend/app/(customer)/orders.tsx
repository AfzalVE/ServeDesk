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
import { useColorScheme } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";

import {
  darkTheme,
  lightTheme,
} from "../../constants/theme";

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
const [theme, setTheme] =
  useState("dark");

const deviceTheme =
  useColorScheme();

useFocusEffect(
  useCallback(() => {
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
  } catch (error) {
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
    <View
      style={[
        styles.loader,
        {
          backgroundColor:
            currentTheme.background,
        },
      ]}
    >
      <ActivityIndicator
        size="large"
        color={currentTheme.primary}
      />
    </View>
  );
}

  return (

  <FlatList
  style={[
    styles.container,
    {
      backgroundColor:
        currentTheme.background,
    },
  ]}
  data={filteredOrders}
  keyExtractor={(item) =>
    item.id.toString()
  }
  contentContainerStyle={{
    padding: 16,
    paddingBottom:
      insets.bottom + 120,
  }}
  showsVerticalScrollIndicator={
    false
  }
      ListHeaderComponent={
  <>
    <Text
      style={[
        styles.title,
        {
          color:
            currentTheme.text,
        },
      ]}
    >
      📦 Your Orders
    </Text>

    <View style={styles.dateRow}>
      <TouchableOpacity
        style={[
          styles.dayButton,
          {
            backgroundColor:
              currentTheme.card,
          },
        ]}
        onPress={() =>
          changeDay(-1)
        }
      >
        <Text
          style={[
            styles.dayButtonText,
            {
              color:
                currentTheme.text,
            },
          ]}
        >
          ◀
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.dateButton,
          {
            backgroundColor:
              currentTheme.card,
          },
        ]}
        onPress={() =>
          setShowDatePicker(true)
        }
      >
        <Text
          style={[
            styles.dateText,
            {
              color:
                currentTheme.text,
            },
          ]}
        >
          📅{" "}
          {selectedDate.toDateString()}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.dayButton,
          {
            backgroundColor:
              currentTheme.card,
          },
        ]}
        onPress={() =>
          changeDay(1)
        }
      >
        <Text
          style={[
            styles.dayButtonText,
            {
              color:
                currentTheme.text,
            },
          ]}
        >
          ▶
        </Text>
      </TouchableOpacity>
    </View>

    {showDatePicker && (
      <DateTimePicker
        value={selectedDate}
        mode="date"
        display="default"
        onChange={
          onDateChange
        }
      />
    )}
  </>
}
     ListEmptyComponent={
  <Text
    style={[
      styles.empty,
      {
        color:
          currentTheme.secondaryText,
      },
    ]}
  >
    No orders found for selected date
  </Text>
}

      refreshing={refreshing}
      onRefresh={onRefresh}

      renderItem={({ item }) => (
  <View
    style={[
      styles.card,
      {
        backgroundColor:
          currentTheme.card,
      },
    ]}
  >
    <Text
      style={[
        styles.orderId,
        {
          color:
            currentTheme.primary,
        },
      ]}
    >
      Order #{item.id}
    </Text>

    {item.display_name ? (
      <Text
        style={[
          styles.line,
          {
            color:
              currentTheme.text,
          },
        ]}
      >
        🍽 Product Name:
        {" "}
        {item.display_name}
      </Text>
    ) : (
      <Text
        style={[
          styles.line,
          {
            color:
              currentTheme.text,
          },
        ]}
      >
        🛒 Custom Order:
        {" "}
        {item.custom_item_name ||
          "N/A"}
      </Text>
    )}

    <Text
      style={[
        styles.line,
        {
          color:
            currentTheme.text,
        },
      ]}
    >
      🔢 Quantity:
      {" "}
      {item.quantity}
    </Text>

    {item.custom_message ? (
      <Text
        style={[
          styles.message,
          {
            color:
              currentTheme.primary,
          },
        ]}
      >
        📝{" "}
        {item.custom_message}
      </Text>
    ) : null}

    <Text
      style={[
        styles.date,
        {
          color:
            currentTheme.secondaryText,
        },
      ]}
    >
      📅{" "}
      {new Date(
        item.created_at
      ).toLocaleString()}
    </Text>

    <View
      style={[
        styles.status,
        item.status ===
        "DELIVERED"
          ? styles.delivered
          : item.status ===
              "ACCEPTED"
            ? styles.accepted
            : item.status ===
                "PREPARING"
              ? styles.preparing
              : item.status ===
                  "CANCELLED"
                ? styles.cancelled
                : item.status ===
                    "REJECTED"
                  ? styles.rejected
                  : styles.pending,
      ]}
    >
      <Text
        style={
          styles.statusText
        }
      >
        {item.status}
      </Text>
    </View>

    {item.status ===
      "PENDING" && (
      <TouchableOpacity
        style={[
          styles.cancelButton,
          {
            backgroundColor:
              currentTheme.danger,
          },
        ]}
        onPress={() =>
          cancelOrder(
            item.id
          )
        }
      >
        <Text
          style={
            styles.cancelButtonText
          }
        >
          Cancel Order
        </Text>
      </TouchableOpacity>
    )}

    {item.reject_reason ? (
      <View
        style={[
          styles.reasonBox,
          {
            backgroundColor:
              currentTheme.background,
            borderColor:
              currentTheme.border,
          },
        ]}
      >
        <Text
          style={[
            styles.reasonTitle,
            {
              color:
                currentTheme.danger,
            },
          ]}
        >
          ❌ Reject Reason
        </Text>

        <Text
          style={[
            styles.reasonText,
            {
              color:
                currentTheme.text,
            },
          ]}
        >
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
const styles =
  StyleSheet.create({
    container: {
      flex: 1,
    },

    loader: {
      flex: 1,
      justifyContent:
        "center",
      alignItems:
        "center",
    },

    title: {
      fontSize: 28,
      fontWeight: "700",
      marginBottom: 20,
    },

    card: {
      padding: 16,
      borderRadius: 18,
      marginBottom: 12,
    },

    orderId: {
      fontSize: 16,
      fontWeight: "700",
      marginBottom: 10,
    },

    line: {
      fontSize: 14,
      marginTop: 4,
    },

    message: {
      marginTop: 10,
      fontStyle: "italic",
    },

    date: {
      marginTop: 10,
      fontSize: 12,
    },

    status: {
      marginTop: 12,
      alignSelf: "flex-start",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 10,
    },

    pending: {
      backgroundColor:
        "#FFA726",
    },

    accepted: {
      backgroundColor:
        "#42A5F5",
    },

    preparing: {
      backgroundColor:
        "#AB47BC",
    },

    delivered: {
      backgroundColor:
        "#66BB6A",
    },

    cancelled: {
      backgroundColor:
        "#E53935",
    },

    rejected: {
      backgroundColor:
        "#D32F2F",
    },

    statusText: {
      color: "#FFFFFF",
      fontWeight: "700",
      fontSize: 12,
    },

    reasonBox: {
      marginTop: 12,
      padding: 12,
      borderRadius: 12,
      borderWidth: 1,
    },

    reasonTitle: {
      fontWeight: "700",
      marginBottom: 6,
    },

    reasonText: {
      lineHeight: 20,
    },

    dateRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
      marginBottom: 20,
    },

    dayButton: {
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 12,
    },

    dayButtonText: {
      fontSize: 16,
      fontWeight: "700",
    },

    dateButton: {
      flex: 1,
      marginHorizontal: 10,
      padding: 12,
      borderRadius: 12,
      alignItems: "center",
    },

    dateText: {
      fontWeight: "600",
    },

    empty: {
      textAlign: "center",
      marginTop: 60,
      fontSize: 15,
    },

    cancelButton: {
      marginTop: 15,
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: "center",
    },

    cancelButtonText: {
      color: "#FFFFFF",
      fontWeight: "700",
      fontSize: 14,
    },
  });