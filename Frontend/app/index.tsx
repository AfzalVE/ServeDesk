import { router } from "expo-router";
import React from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// =====================
// FEATURE CARD
// =====================
const FeatureCard = ({ icon, title, desc }: any) => (
  <View style={styles.card}>
    <Text style={styles.cardIcon}>{icon}</Text>
    <Text style={styles.cardTitle}>{title}</Text>
    <Text style={styles.cardDesc}>{desc}</Text>
  </View>
);

// =====================
// ROLE BUTTON
// =====================
const RoleButton = ({ title, route, color }: any) => (
  <TouchableOpacity
    style={[styles.roleBtn, { backgroundColor: color }]}
    onPress={() => router.push(route)}
  >
    <Text style={styles.roleText}>{title}</Text>
  </TouchableOpacity>
);

// =====================
// MAIN PAGE
// =====================
export default function Home() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ================= HERO ================= */}
        <View style={styles.hero}>
          <Text style={styles.badge}>🏢 Enterprise Service Platform</Text>

          <Text style={styles.title}>ServeDesk</Text>

          <Text style={styles.subtitle}>
            A unified system to manage{" "}
            <Text style={{ color: "#fff" }}>
              orders, employees, tasks, and support requests
            </Text>{" "}
            in real time with complete control and visibility.
          </Text>

          {/* CTA */}
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => router.push("/(auth)/sign-in")}
          >
            <Text style={styles.primaryText}>Get Started</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => router.push("/(auth)/sign-in")}
          >
            <Text style={styles.secondaryText}>Login to Dashboard</Text>
          </TouchableOpacity>

        </View>

        {/* ================= STATS ================= */}
        <View style={styles.stats}>
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
            <Text style={styles.statLabel}>Resolution</Text>
          </View>
        </View>

        {/* ================= FEATURES ================= */}
        <Text style={styles.sectionTitle}>Core Features</Text>

        <FeatureCard
          icon="📦"
          title="Smart Order System"
          desc="Create and track office service requests in real time."
        />

        <FeatureCard
          icon="👨‍💼"
          title="Employee Management"
          desc="Assign tasks and monitor employee performance."
        />

        <FeatureCard
          icon="📊"
          title="Live Dashboard"
          desc="Get real-time insights into operations and workflow."
        />

        <FeatureCard
          icon="🚨"
          title="Instant Support"
          desc="Raise tickets and notify employees instantly."
        />

        {/* ================= HOW IT WORKS ================= */}
        <View style={styles.howBox}>
          <Text style={styles.sectionTitle}>How It Works</Text>

          <Text style={styles.step}>1. Login as Admin / Employee / User</Text>
          <Text style={styles.step}>2. Create or receive service requests</Text>
          <Text style={styles.step}>3. Assign & track tasks in real time</Text>
          <Text style={styles.step}>4. Resolve & generate reports</Text>
        </View>

        {/* ================= FINAL CTA ================= */}
        <View style={styles.bottomCard}>
          <Text style={styles.bottomTitle}>
            One Platform. Total Control.
          </Text>

          <Text style={styles.bottomText}>
            Simplify operations, improve productivity, and manage your entire
            office workflow from a single system.
          </Text>

          <TouchableOpacity
            style={styles.finalBtn}
            onPress={() => router.push("/(auth)/sign-in")}
          >
            <Text style={styles.finalText}>Enter System</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// =====================
// STYLES
// =====================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#07111F",
  },

  hero: {
    padding: 24,
    paddingTop: 40,
  },

  badge: {
    color: "#64B5F6",
    backgroundColor: "#13263A",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 15,
    fontWeight: "700",
  },

  title: {
    fontSize: 44,
    fontWeight: "900",
    color: "#fff",
  },

  subtitle: {
    color: "#9DB1C7",
    marginTop: 15,
    fontSize: 16,
    lineHeight: 24,
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
    fontWeight: "800",
  },

  secondaryBtn: {
    marginTop: 12,
    backgroundColor: "#101E2D",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
  },

  secondaryText: {
    color: "#fff",
    fontWeight: "700",
  },

  roleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },

  roleBtn: {
    flex: 1,
    marginHorizontal: 5,
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },

  roleText: {
    color: "#fff",
    fontWeight: "800",
  },

  stats: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
  },

  statBox: {
    backgroundColor: "#101E2D",
    flex: 1,
    marginHorizontal: 5,
    padding: 18,
    borderRadius: 14,
    alignItems: "center",
  },

  statNum: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "900",
  },

  statLabel: {
    color: "#9DB1C7",
    marginTop: 5,
  },

  sectionTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "900",
    marginLeft: 20,
    marginTop: 10,
    marginBottom: 10,
  },

  card: {
    backgroundColor: "#101E2D",
    margin: 20,
    marginTop: 10,
    padding: 18,
    borderRadius: 16,
  },

  cardIcon: {
    fontSize: 28,
  },

  cardTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    marginTop: 8,
  },

  cardDesc: {
    color: "#9DB1C7",
    marginTop: 6,
    lineHeight: 20,
  },

  howBox: {
    backgroundColor: "#101E2D",
    margin: 20,
    padding: 18,
    borderRadius: 16,
  },

  step: {
    color: "#B5C4D4",
    marginTop: 8,
  },

  bottomCard: {
    backgroundColor: "#16293D",
    margin: 20,
    padding: 22,
    borderRadius: 18,
    marginBottom: 40,
  },

  bottomTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "900",
  },

  bottomText: {
    color: "#B5C4D4",
    marginTop: 10,
    lineHeight: 22,
  },

  finalBtn: {
    marginTop: 18,
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
  },

  finalText: {
    color: "#07111F",
    fontWeight: "900",
  },
});