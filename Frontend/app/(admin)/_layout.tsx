import React, { useEffect, useState } from "react";
import { Tabs, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ActivityIndicator,
  View,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "../../constants/theme";

export default function EmployeeLayout() {
  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const userStr =
        await AsyncStorage.getItem(
          "user"
        );

      if (!userStr) {
        router.replace("/");
        return;
      }

      const user = JSON.parse(userStr);

      if (
        user.user_type !== "ADMIN"
      ) {
        router.replace("/");
        return;
      }
    } catch {
      router.replace("/");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View
        style={styles.loader}
      >
        <ActivityIndicator
          size="large"
          color="#2D8CFF"
        />
      </View>
    );
  }

  return (
    <SafeAreaView
      style={styles.safe}
    >
      <Tabs
        screenOptions={{
          headerShown: false,

          tabBarStyle:
            styles.tabBar,

          tabBarActiveTintColor:
            "#2D8CFF",

          tabBarInactiveTintColor:
            "#8FA4B8",

          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: "700",
          },
        }}
      >
        {/* DASHBOARD */}
        <Tabs.Screen
          name="dashboard"
          options={{
            title: "Home",
            tabBarIcon: ({
              color,
              size,
            }) => (
              <Ionicons
                name="grid-outline"
                size={size}
                color={color}
              />
            ),
          }}
        />

        {/* PRODUCTS */}
        <Tabs.Screen
          name="products"
          options={{
            title: "Products",
            tabBarIcon: ({
              color,
              size,
            }) => (
              <Ionicons
                name="fast-food-outline"
                size={size}
                color={color}
              />
            ),
          }}
        />

        {/* EMPLOYEES */}
        <Tabs.Screen
          name="employees"
          options={{
            title: "Employees",
            tabBarIcon: ({
              color,
              size,
            }) => (
              <Ionicons
                name="person-circle-outline"
                size={size}
                color={color}
              />
            ),
          }}
        />

        {/* TICKETS */}
        <Tabs.Screen
          name="tickets"
          options={{
            title: "Tickets",
            tabBarIcon: ({
              color,
              size,
            }) => (
              <Ionicons
                name="alert-circle-outline"
                size={size}
                color={color}
              />
            ),
          }}
        />

        {/* ORDERS */}
        <Tabs.Screen
          name="orders"
          options={{
            title: "Orders",
            tabBarIcon: ({
              color,
              size,
            }) => (
              <Ionicons
                name="receipt-outline"
                size={size}
                color={color}
              />
            ),
          }}
        />

        {/* ANNOUNCEMENTS */}
        <Tabs.Screen
          name="announcements"
          options={{
            title:
              "Notices",
            tabBarIcon: ({
              color,
              size,
            }) => (
              <Ionicons
                name="megaphone-outline"
                size={size}
                color={color}
              />
            ),
          }}
        />

        {/* PROFILE */}
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({
              color,
              size,
            }) => (
              <Ionicons
                name="person-outline"
                size={size}
                color={color}
              />
            ),
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}

const styles =
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor:
        colors.background,
    },

    loader: {
      flex: 1,
      backgroundColor:
        colors.background,
      justifyContent:
        "center",
      alignItems: "center",
    },

  tabBar: {
    backgroundColor: "#101E2D",

    position: "absolute",
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 20,
    height: 65,

    borderTopWidth: 0,

    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  });

