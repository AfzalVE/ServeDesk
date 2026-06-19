import React, {
  useState,
  useCallback,
} from "react";

import { Tabs } from "expo-router";

import {
  Ionicons,
} from "@expo/vector-icons";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import {
  StyleSheet,
  useColorScheme,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  useFocusEffect,
} from "@react-navigation/native";

import {
  darkTheme,
  lightTheme,
} from "../../constants/theme";

export default function CustomerLayout() {
  const deviceTheme =
    useColorScheme();

  const [theme, setTheme] =
    useState("dark");

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
            fontSize: 11,
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
                name="home-outline"
                size={size}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="custom"
          options={{
            title: "Custom",

            tabBarIcon: ({
              color,
              size,
            }) => (
              <Ionicons
                name="create-outline"
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
                name="cube-outline"
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
          name="active_tickets"
          options={{
            title: "Active",

            tabBarIcon: ({
              color,
              size,
            }) => (
              <Ionicons
                name="ticket-outline"
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
    },
  });