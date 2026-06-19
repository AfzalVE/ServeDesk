import React, { useEffect, useState } from "react";
import {
  Alert,
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
} from "react-native";
import { API_URL } from "../../config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import {
  darkTheme,
  lightTheme,
} from "../../constants/theme";

import {
  useColorScheme,
} from "react-native"; import { useSafeAreaInsets } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";

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
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  //Theme
  const [theme, setTheme] = useState("dark");

  const deviceTheme = useColorScheme();


  useFocusEffect(
    React.useCallback(() => {
      loadTheme();
    }, [])
  );



  const loadTheme = async () => {
    try {

      const savedTheme =
        await AsyncStorage.getItem("theme");

      if (savedTheme) {
        setTheme(savedTheme);
      }

    } catch (error) {
      console.log(error);
    }
  };



  const currentTheme =
    theme === "light"
      ?
      lightTheme
      :
      theme === "dark"
        ?
        darkTheme
        :
        deviceTheme === "light"
          ?
          lightTheme
          :
          darkTheme;



  const styles = createStyles(currentTheme);
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
  // FILTER ORDERS
  // ==========================

  const STATUS_CONFIG: any = {

    PENDING: {
      color: currentTheme.warning,
      bg: currentTheme.cardDark,
    },


    ACCEPTED: {
      color: currentTheme.primary,
      bg: currentTheme.cardDark,
    },


    DELIVERED: {
      color: currentTheme.success,
      bg: currentTheme.cardDark,
    },


    COMPLETED: {
      color: currentTheme.success,
      bg: currentTheme.cardDark,
    },


    CANCELLED: {
      color: currentTheme.danger,
      bg: currentTheme.cardDark,
    },


    REJECTED: {
      color: currentTheme.danger,
      bg: currentTheme.cardDark,
    },


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

  const filtered = orders
    .filter((o) => {
      const orderDate = formatDate(
        new Date(o.created_at)
      );

      const matchesSearch =
        `${o.order_id || o.id} ${o.status} ${o.customer_name || ""
          }`
          .toLowerCase()
          .includes(search.toLowerCase());

      return (
        matchesSearch &&
        orderDate === formatDate(selectedDate)
      );
    })
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime()
    );

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await loadOrders();
    } finally {
      setRefreshing(false);
    }
  };
  // ==========================
  // LOADING
  // ==========================
  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={currentTheme.primary} />
        <Text style={styles.loaderText}>Loading orders...</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={{
        padding: 15,
        paddingBottom: insets.bottom + 120,
        flexGrow: 1,
      }}
      refreshing={refreshing}
      onRefresh={onRefresh}
      data={filtered.sort(
        (a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
      )}
      keyExtractor={(item) => item.id.toString()}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <>
          <Text style={styles.title}>
            Orders
          </Text>

          <Text style={styles.subTitle}>
            Manage all customer requests
          </Text>

          <TextInput
            placeholder="Search orders..."
            placeholderTextColor="#777"
            value={search}
            onChangeText={setSearch}
            style={styles.search}
          />

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
          No orders found
        </Text>
      }
      renderItem={({ item }) => {
        const config =
          STATUS_CONFIG[item.status] || {
            color: "#888",
            bg: "#16293D",
          };

        return (
          <View
            style={[
              styles.orderCard,
              {
                borderLeftColor: config.color,
              },
            ]}
          >
            {/* HEADER */}

            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.orderNumber}>
                  {item.order_id ||
                    `#${item.id}`}
                </Text>

                <Text style={styles.orderTime}>
                  {new Date(
                    item.created_at
                  ).toLocaleString()}
                </Text>
              </View>

              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      config.color,
                  },
                ]}
              >
                <Text
                  style={styles.statusText}
                >
                  {item.status}
                </Text>
              </View>
            </View>

            <View style={styles.separator} />

            <Text style={styles.info}>
              🍔 Product :
              <Text style={styles.value}>
                {" "}
                {item.product_name ||
                  item.custom_item_name ||
                  "Custom Order"}
              </Text>
            </Text>

            <Text style={styles.info}>
              👤 Customer :
              <Text style={styles.value}>
                {" "}
                {item.customer_name}
              </Text>
            </Text>

            <Text style={styles.info}>
              📦 Quantity :
              <Text style={styles.value}>
                {" "}
                {item.quantity}
              </Text>
            </Text>

            {item.accepted_employee_name && (
              <Text style={styles.info}>
                ✅ Accepted By :
                <Text
                  style={styles.value}
                >
                  {" "}
                  {
                    item.accepted_employee_name
                  }
                </Text>
              </Text>
            )}

            {item.custom_message ? (
              <View
                style={styles.noteBox}
              >
                <Text
                  style={styles.noteTitle}
                >
                  CUSTOMER NOTE
                </Text>

                <Text
                  style={styles.noteText}
                >
                  {item.custom_message}
                </Text>
              </View>
            ) : null}

            {item.reject_reason ? (
              <View
                style={styles.rejectBox}
              >
                <Text
                  style={
                    styles.rejectTitle
                  }
                >
                  REJECT REASON
                </Text>

                <Text
                  style={
                    styles.rejectText
                  }
                >
                  {item.reject_reason}
                </Text>
              </View>
            ) : null}
          </View>
        );
      }}
    />
  );
}
// ==========================
// STYLES
// ==========================
const createStyles = (theme: any) =>

  StyleSheet.create({


    container: {
      flex: 1,
      backgroundColor: theme.background,
    },



    title: {
      color: theme.text,
      fontSize: 28,
      fontWeight: "900",
    },



    subTitle: {
      color: theme.mutedText,
      marginBottom: 15,
    },



    search: {
      backgroundColor: theme.cardDark,
      color: theme.text,
      padding: 12,
      borderRadius: 10,
      marginBottom: 15,
    },



    loader: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.background,
    },



    loaderText: {
      marginTop: 10,
      color: theme.mutedText,
    },



    empty: {
      color: theme.mutedText,
      textAlign: "center",
      marginTop: 20,
    },



    orderCard: {
      backgroundColor: theme.card,
      marginBottom: 16,
      borderRadius: 18,
      padding: 18,
      borderLeftWidth: 6,
    },



    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },



    orderNumber: {
      color: theme.text,
      fontSize: 18,
      fontWeight: "900",
    },



    orderTime: {
      color: theme.mutedText,
      marginTop: 4,
      fontSize: 12,
    },



    statusBadge: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 30,
    },



    statusText: {
      color: theme.buttonText,
      fontWeight: "900",
      fontSize: 12,
    },



    separator: {
      height: 1,
      backgroundColor: theme.divider,
      marginVertical: 14,
    },



    info: {
      color: theme.secondaryText,
      fontSize: 14,
      marginBottom: 8,
    },



    value: {
      color: theme.text,
      fontWeight: "800",
    },



    noteBox: {
      marginTop: 15,
      backgroundColor: theme.cardDark,
      padding: 12,
      borderRadius: 12,
    },



    noteTitle: {
      color: theme.primaryLight,
      fontWeight: "900",
      marginBottom: 5,
    },



    noteText: {
      color: theme.text,
    },



    rejectBox: {
      marginTop: 15,
      backgroundColor: theme.cardDark,
      borderLeftWidth: 4,
      borderLeftColor: theme.danger,
      padding: 12,
      borderRadius: 12,
    },



    rejectTitle: {
      color: theme.danger,
      fontWeight: "900",
      marginBottom: 5,
    },



    rejectText: {
      color: theme.text,
    },



    dateRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 18,
    },



    dayButton: {
      backgroundColor: theme.cardDark,
      width: 50,
      height: 50,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
    },



    dayButtonText: {
      color: theme.text,
      fontSize: 20,
      fontWeight: "900",
    },



    dateButton: {
      flex: 1,
      marginHorizontal: 10,
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.primary,
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: "center",
    },



    dateText: {
      color: theme.text,
      fontWeight: "900",
      fontSize: 15,
    },


  });