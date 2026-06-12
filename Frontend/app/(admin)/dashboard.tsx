import React, {
  useEffect,
  useState,
} from "react";

import {
  Alert,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

import { API_URL } from "../../config/api";
import { colors } from "../../constants/theme";

export default function AdminDashboard() {
  const [user, setUser] =
    useState<any>(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [stats, setStats] =
    useState({
      products: 0,
      orders: 0,
      employees: 0,
      tickets: 0,
    });

  const [todayAnnouncement,
    setTodayAnnouncement] =
    useState<any>(null);

  // ==========================
  // LOAD DASHBOARD
  // ==========================
  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard =
    async () => {
      try {
        setLoading(true);

        const stored =
          await AsyncStorage.getItem(
            "user"
          );

        if (stored) {
          setUser(
            JSON.parse(stored)
          );
        }

        const [
          productsRes,
          ordersRes,
          employeesRes,
          ticketsRes,
          announcementsRes,
        ] = await Promise.all([
          fetch(
            `${API_URL}/products`
          ),
          fetch(
            `${API_URL}/orders`
          ),
          fetch(
            `${API_URL}/employees`
          ),
          fetch(
            `${API_URL}/tickets`
          ),
          fetch(
            `${API_URL}/announcements`
          ),
        ]);

        const products =
          await productsRes.json();

        const orders =
          await ordersRes.json();

        const employees =
          await employeesRes.json();

        const tickets =
          await ticketsRes.json();

        const announcements =
          await announcementsRes.json();

        setStats({
          products:
            Array.isArray(
              products
            )
              ? products.length
              : 0,

          orders:
            Array.isArray(
              orders
            )
              ? orders.length
              : 0,

          employees:
            Array.isArray(
              employees
            )
              ? employees.length
              : 0,

          tickets:
            Array.isArray(
              tickets
            )
              ? tickets.length
              : 0,
        });

        const today =
          new Date()
            .toISOString()
            .split("T")[0];

          if (
          Array.isArray(
            announcements
          )
          ) {
          const announcement =
            announcements.find(
              (item: any) =>
                item.created_at &&
                item.created_at
                  .split(
                    "T"
                  )[0] ===
                today
            );

          setTodayAnnouncement(
            announcement ||
              null
          );
        }
      } catch (err) {
        Alert.alert(
          "Error",
          "Failed to load dashboard"
        );
      } finally {
        setLoading(false);
      }
    };

  // ==========================
  // REFRESH
  // ==========================
  const onRefresh =
    async () => {
      setRefreshing(true);

      await loadDashboard();

      setRefreshing(false);
    };

  // ==========================
  // NAVIGATION
  // ==========================
  const go = (
    path: string
  ) => {
    router.push(path as any);
  };

  // ==========================
  // LOADER
  // ==========================
  if (loading) {
    return (
      <View
        style={styles.loader}
      >
        <ActivityIndicator
          size="large"
          color="#2D8CFF"
        />

        <Text
          style={
            styles.loaderText
          }
        >
          Loading Admin
          Dashboard...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={
        false
      }
      refreshControl={
        <RefreshControl
          refreshing={
            refreshing
          }
          onRefresh={
            onRefresh
          }
        />
      }
    >
      {/* =======================
            HEADER
      ======================= */}

      <View
        style={styles.header}
      >
        <View>
          <Text
            style={
              styles.title
            }
          >
            Admin Dashboard
          </Text>

          <Text
            style={
              styles.subTitle
            }
          >
            Welcome back,
            {" "}
            {user?.full_name ||
              "Admin"}
          </Text>
        </View>

        <View
          style={
            styles.avatar
          }
        >
          <Text
            style={
              styles.avatarText
            }
          >
            {user?.full_name
              ?.charAt(
                0
              )
              ?.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* =======================
            STATS
      ======================= */}

      <View
        style={
          styles.statsRow
        }
      >
        <View
          style={
            styles.card
          }
        >
          <Text
            style={
              styles.cardNumber
            }
          >
            {
              stats.products
            }
          </Text>

          <Text
            style={
              styles.cardLabel
            }
          >
            Products
          </Text>
        </View>

        <View
          style={
            styles.card
          }
        >
          <Text
            style={
              styles.cardNumber
            }
          >
            {
              stats.orders
            }
          </Text>

          <Text
            style={
              styles.cardLabel
            }
          >
            Orders
          </Text>
        </View>

        <View
          style={
            styles.card
          }
        >
          <Text
            style={
              styles.cardNumber
            }
          >
            {
              stats.employees
            }
          </Text>

          <Text
            style={
              styles.cardLabel
            }
          >
            Employees
          </Text>
        </View>

        <View
          style={
            styles.card
          }
        >
          <Text
            style={
              styles.cardNumber
            }
          >
            {
              stats.tickets
            }
          </Text>

          <Text
            style={
              styles.cardLabel
            }
          >
            Tickets
          </Text>
        </View>
      </View>

      {/* =======================
            QUICK NAVIGATION
      ======================= */}

      <Text
        style={
          styles.sectionTitle
        }
      >
        System Modules
      </Text>

      <View
        style={
          styles.navGrid
        }
      >
        <TouchableOpacity
          style={
            styles.navCard
          }
          onPress={() =>
            go(
              "/(admin)/employees"
            )
          }
        >
          <Text
            style={
              styles.navIcon
            }
          >
            👨‍💼
          </Text>

          <Text
            style={
              styles.navText
            }
          >
            Employees
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={
            styles.navCard
          }
          onPress={() =>
            go(
              "/(admin)/products"
            )
          }
        >
          <Text
            style={
              styles.navIcon
            }
          >
            🍔
          </Text>

          <Text
            style={
              styles.navText
            }
          >
            Products
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={
            styles.navCard
          }
          onPress={() =>
            go(
              "/(admin)/orders"
            )
          }
        >
          <Text
            style={
              styles.navIcon
            }
          >
            📦
          </Text>

          <Text
            style={
              styles.navText
            }
          >
            Orders
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={
            styles.navCard
          }
          onPress={() =>
            go(
              "/(admin)/announcements"
            )
          }
        >
          <Text
            style={
              styles.navIcon
            }
          >
            📢
          </Text>

          <Text
            style={
              styles.navText
            }
          >
            Announcements
          </Text>
        </TouchableOpacity>
      </View>

      {/* =======================
            TODAY ANNOUNCEMENT
      ======================= */}

      <View
        style={
          styles.announcementBox
        }
      >
        <Text
          style={
            styles.sectionTitle
          }
        >
          Today's
          Announcement
        </Text>

        {todayAnnouncement ? (
          <>
            <Text
              style={
                styles.announcementTitle
              }
            >
              {
                todayAnnouncement.title
              }
            </Text>

            <Text
              style={
                styles.announcementMessage
              }
            >
              {
                todayAnnouncement.message
              }
            </Text>
          </>
        ) : (
          <Text
            style={
              styles.emptyText
            }
          >
            No
            announcement
            available
            today.
          </Text>
        )}

        <TouchableOpacity
          style={
            styles.viewBtn
          }
          onPress={() =>
            go(
              "/(admin)/announcements"
            )
          }
        >
          <Text
            style={
              styles.viewBtnText
            }
          >
            View All
            Announcements
          </Text>
        </TouchableOpacity>
      </View>

      {/* =======================
            QUICK ACTIONS
      ======================= */}

      <View
        style={
          styles.quickBox
        }
      >
        <Text
          style={
            styles.sectionTitle
          }
        >
          Quick Actions
        </Text>

        <TouchableOpacity
          style={
            styles.actionBtn
          }
          onPress={() =>
            go(
              "/(admin)/employees"
            )
          }
        >
          <Text
            style={
              styles.actionText
            }
          >
            Manage
            Employees
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={
            styles.actionBtn
          }
          onPress={() =>
            go(
              "/(admin)/products"
            )
          }
        >
          <Text
            style={
              styles.actionText
            }
          >
            Manage
            Products
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={
            styles.actionBtn
          }
          onPress={() =>
            go(
              "/(admin)/orders"
            )
          }
        >
          <Text
            style={
              styles.actionText
            }
          >
            View Orders
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={
            styles.actionBtn
          }
          onPress={() =>
            go(
              "/(admin)/announcements"
            )
          }
        >
          <Text
            style={
              styles.actionText
            }
          >
            Browse
            Announcements
          </Text>
        </TouchableOpacity>
      </View>

      {/* =======================
            FOOTER
      ======================= */}

      <View
        style={
          styles.footer
        }
      >
        <Text
          style={
            styles.footerText
          }
        >
          ServeDesk
          Administration
          Panel
        </Text>

        <Text
          style={
            styles.footerSubText
          }
        >
          Manage your
          business from a
          single place
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
  },

  loader: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
  },

  loaderText: {
    color: "#FFF",
    marginTop: 15,
    fontSize: 15,
    fontWeight: "700",
  },

  // ======================
  // HEADER
  // ======================

  header: {
    marginTop: 20,
    marginBottom: 25,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    color: "#FFF",
    fontSize: 30,
    fontWeight: "900",
  },

  subTitle: {
    color: "#8EA2B8",
    fontSize: 15,
    marginTop: 5,
  },

  avatar: {
    width: 65,
    height: 65,
    borderRadius: 35,
    backgroundColor: "#2D8CFF",
    justifyContent: "center",
    alignItems: "center",
  },

  avatarText: {
    color: "#FFF",
    fontSize: 28,
    fontWeight: "900",
  },

  // ======================
  // STATS
  // ======================

  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 25,
  },

  card: {
    width: "48%",
    backgroundColor: "#101E2D",
    borderRadius: 18,
    paddingVertical: 22,
    paddingHorizontal: 18,
    marginBottom: 14,
    borderLeftWidth: 5,
    borderLeftColor: "#2D8CFF",
  },

  cardNumber: {
    color: "#FFF",
    fontSize: 28,
    fontWeight: "900",
  },

  cardLabel: {
    color: "#8EA2B8",
    marginTop: 8,
    fontSize: 14,
    fontWeight: "700",
  },

  // ======================
  // SECTION
  // ======================

  sectionTitle: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 15,
  },

  // ======================
  // MODULES
  // ======================

  navGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 25,
  },

  navCard: {
    width: "48%",
    backgroundColor: "#101E2D",
    borderRadius: 18,
    paddingVertical: 22,
    alignItems: "center",
    marginBottom: 14,
  },

  navIcon: {
    fontSize: 34,
    marginBottom: 10,
  },

  navText: {
    color: "#FFF",
    fontWeight: "800",
    fontSize: 15,
  },

  // ======================
  // ANNOUNCEMENT
  // ======================

  announcementBox: {
    backgroundColor: "#101E2D",
    borderRadius: 20,
    padding: 20,
    marginBottom: 25,
    borderLeftWidth: 5,
    borderLeftColor: "#FFC107",
  },

  announcementTitle: {
    color: "#FFC107",
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 10,
  },

  announcementMessage: {
    color: "#D5E2F0",
    fontSize: 15,
    lineHeight: 24,
  },

  emptyText: {
    color: "#8EA2B8",
    fontSize: 15,
    marginBottom: 10,
  },

  viewBtn: {
    backgroundColor: "#2D8CFF",
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },

  viewBtnText: {
    color: "#FFF",
    fontWeight: "900",
    fontSize: 15,
  },

  // ======================
  // QUICK ACTIONS
  // ======================

  quickBox: {
    backgroundColor: "#101E2D",
    borderRadius: 20,
    padding: 20,
    marginBottom: 25,
  },

  actionBtn: {
    backgroundColor: "#16293D",
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 12,
  },

  actionText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "800",
  },

  // ======================
  // FOOTER
  // ======================

  footer: {
    alignItems: "center",
    paddingVertical: 30,
    marginBottom: 30,
  },

  footerText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "900",
  },

  footerSubText: {
    color: "#7D93A8",
    marginTop: 8,
    textAlign: "center",
    fontSize: 14,
  },
});
