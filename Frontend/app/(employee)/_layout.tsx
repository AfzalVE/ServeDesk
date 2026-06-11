import React, { useEffect, useState } from "react";
import { Tabs, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActivityIndicator, View,StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EmployeeLayout() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const userStr = await AsyncStorage.getItem("user");

      if (!userStr) {
        router.replace("/");
        return;
      }

      const user = JSON.parse(userStr);

      if (user.user_type !== "EMPLOYEE") {
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
        style={{
          flex: 1,
          backgroundColor: "#07111F",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator
          size="large"
          color="#2D8CFF"
        />
      </View>
    );
  }

  return (
        <SafeAreaView style={styles.safe}>
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarStyle: {
          backgroundColor: "#101E2D",
          borderTopColor: "#16293D",
          height: 70,
          paddingBottom: 8,
          paddingTop: 8,
        },

        tabBarActiveTintColor: "#2D8CFF",
        tabBarInactiveTintColor: "#8FA4B8",

        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "700",
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="grid-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="orders"
        options={{
          title: "Orders",
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="restaurant-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="tickets"
        options={{
          title: "Tickets",
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="notifications-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="person-circle-outline"
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
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#07111F",
  },

  wrapper: {
    flex: 1,
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