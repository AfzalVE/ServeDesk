import React, {
  useEffect,
  useState,
  useCallback,
} from "react";

import { Tabs, router } from "expo-router";

import {
  Ionicons,
} from "@expo/vector-icons";

import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  ActivityIndicator,
  View,
  StyleSheet,
  useColorScheme,
} from "react-native";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import {
  useFocusEffect,
} from "@react-navigation/native";

import {
  darkTheme,
  lightTheme,
} from "../../constants/theme";

export default function EmployeeLayout() {
  const [loading, setLoading] =
    useState(true);

  const deviceTheme =
    useColorScheme();

  const [theme, setTheme] =
    useState("dark");

  useEffect(() => {
    checkAuth();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTheme();
    }, [])
  );

  const loadTheme =
    async () => {
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

  const checkAuth =
    async () => {
      try {
        const userStr =
          await AsyncStorage.getItem(
            "user"
          );

        if (!userStr) {
          router.replace("/");
          return;
        }

        const user =
          JSON.parse(userStr);

        if (
          user.user_type !==
          "EMPLOYEE"
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
          color={
            currentTheme.primary
          }
        />
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[
        styles.safe,
        {
          backgroundColor:
            currentTheme.background,
        },
      ]}
    >
      <Tabs
        screenOptions={{
          headerShown: false,

          tabBarStyle: {
            backgroundColor:
              currentTheme.card,

            borderTopColor:
              currentTheme.border,

            height: 70,

            paddingTop: 8,

            paddingBottom: 8,
          },

          tabBarActiveTintColor:
            currentTheme.primary,

          tabBarInactiveTintColor:
            currentTheme.secondaryText,

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

        <Tabs.Screen
          name="orders"
          options={{
            title: "Orders",

            tabBarIcon: ({
              color,
              size,
            }) => (
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

            tabBarIcon: ({
              color,
              size,
            }) => (
              <Ionicons
                name="notifications-outline"
                size={size}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="announcements"
          options={{
            title: "Notices",

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

        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",

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
      </Tabs>
    </SafeAreaView>
  );
}

const styles =
  StyleSheet.create({
    safe: {
      flex: 1,
    },

    loader: {
      flex: 1,
      justifyContent:
        "center",
      alignItems: "center",
    },
  });