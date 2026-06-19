import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";

export default function Home() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const user = await AsyncStorage.getItem("user");

    if (user) {
      const parsed = JSON.parse(user);

      const role = parsed.user_type?.toUpperCase();

      if (role === "CUSTOMER") {
        router.replace("/(customer)/home");
      } else if (role === "EMPLOYEE") {
        router.replace("/(employee)/home");
      } else if (role === "ADMIN") {
        router.replace("/(admin)/dashboard");
      }

      return;
    }

    setLoading(false);
  };
  const testNotification = async () => {
    try {
      console.log("Testing notification...");

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Test Notification",
          body: "Notifications are working 🎉",
          sound: true,
        },
        trigger: null,
      });

      console.log("Notification scheduled");
    } catch (err) {
      console.log("Notification Error:", err);
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color="#2D8CFF" size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* HERO CARD */}
        <View style={styles.heroCard}>
          <Text style={styles.badge}>🏢 Enterprise Service Platform</Text>

          <Text style={styles.title}>ServeDesk</Text>

          <Text style={styles.subtitle}>
            Smart order management, employee coordination, and instant support —
            all in one powerful system.
          </Text>

          {/* STATS MINI STRIP */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>1.2K+</Text>
              <Text style={styles.statLabel}>Orders</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statNum}>350+</Text>
              <Text style={styles.statLabel}>Employees</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statNum}>98%</Text>
              <Text style={styles.statLabel}>Success</Text>
            </View>
          </View>

          {/* CTA */}
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => router.push("/(auth)/sign-in")}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryText}>Login to Dashboard</Text>
          </TouchableOpacity>

          <Text style={styles.footerHint}>
            Secure • Fast • Real-time system
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// =====================
// STYLES (PRO UI)
// =====================
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#07111F",
  },

  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#07111F",
  },

  heroCard: {
    backgroundColor: "#101E2D",
    borderRadius: 22,
    padding: 22,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },

  badge: {
    color: "#64B5F6",
    backgroundColor: "#13263A",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    fontSize: 12,
    fontWeight: "700",
  },

  title: {
    fontSize: 44,
    fontWeight: "900",
    color: "#fff",
    marginTop: 15,
  },

  subtitle: {
    color: "#9DB1C7",
    marginTop: 12,
    fontSize: 14,
    lineHeight: 20,
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 25,
  },

  statBox: {
    flex: 1,
    backgroundColor: "#16293D",
    marginHorizontal: 4,
    padding: 12,
    borderRadius: 14,
    alignItems: "center",
  },

  statNum: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900",
  },

  statLabel: {
    color: "#9DB1C7",
    fontSize: 12,
    marginTop: 4,
  },

  primaryBtn: {
    marginTop: 25,
    backgroundColor: "#2D8CFF",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
  },

  primaryText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 16,
  },

  footerHint: {
    color: "#6F8AA6",
    textAlign: "center",
    marginTop: 12,
    fontSize: 12,
  },
  testBtn: {
    marginTop: 12,
    backgroundColor: "#16A34A",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
  },

  testBtnText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 16,
  },
});