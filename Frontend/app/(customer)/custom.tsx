import React, {
  useState,
  useEffect,
  useCallback,
} from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  useColorScheme,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

import {
  darkTheme,
  lightTheme,
} from "../../constants/theme";

import { API_URL } from "../../config/api";

export default function Custom() {
  const [text, setText] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [theme, setTheme] =
    useState("dark");

  const deviceTheme =
    useColorScheme();

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

  const submit = async () => {
    try {
      const user = JSON.parse(
        (await AsyncStorage.getItem(
          "user"
        )) || "{}"
      );

      if (!text.trim()) {
        Alert.alert(
          "Error",
          "Please enter your request."
        );
        return;
      }

      setLoading(true);

      const response =
        await fetch(
          `${API_URL}/orders`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              customer_id:
                user.id,
              product_id: null,
              quantity: 1,
              custom_message:
                text,
            }),
          }
        );

      if (!response.ok) {
        throw new Error(
          "Failed to submit order"
        );
      }

      setText("");

      Alert.alert(
        "Success",
        "Custom order submitted successfully."
      );
    } catch (error) {
      console.log(error);

      Alert.alert(
        "Error",
        "Failed to submit custom order."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor:
            currentTheme.background,
        },
      ]}
    >
      {/* HEADER */}

      <View
        style={[
          styles.headerCard,
          {
            backgroundColor:
              currentTheme.card,
          },
        ]}
      >
        <Text
          style={[
            styles.title,
            {
              color:
                currentTheme.text,
            },
          ]}
        >
          📝 Custom Order
        </Text>

        <Text
          style={[
            styles.subtitle,
            {
              color:
                currentTheme.secondaryText,
            },
          ]}
        >
          Describe your request and
          our team will review it.
        </Text>
      </View>

      {/* FORM */}

      <View
        style={[
          styles.formCard,
          {
            backgroundColor:
              currentTheme.card,
          },
        ]}
      >
        <Text
          style={[
            styles.label,
            {
              color:
                currentTheme.text,
            },
          ]}
        >
          Order Details
        </Text>

        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="e.g. Extra sugar, special request, urgent office supplies..."
          placeholderTextColor={
            currentTheme.secondaryText
          }
          multiline
          textAlignVertical="top"
          style={[
            styles.input,
            {
              backgroundColor:
                currentTheme.background,
              color:
                currentTheme.text,
              borderColor:
                currentTheme.border,
            },
          ]}
        />

        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor:
                currentTheme.primary,
              opacity:
                loading
                  ? 0.7
                  : 1,
            },
          ]}
          onPress={submit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator
              color="#FFFFFF"
            />
          ) : (
            <Text
              style={
                styles.buttonText
              }
            >
              Submit Order
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
    },

    headerCard: {
      borderRadius: 20,
      padding: 20,
      marginBottom: 16,
    },

    title: {
      fontSize: 24,
      fontWeight: "700",
      marginBottom: 6,
    },

    subtitle: {
      fontSize: 14,
      lineHeight: 20,
    },

    formCard: {
      borderRadius: 20,
      padding: 18,
    },

    label: {
      fontSize: 15,
      fontWeight: "600",
      marginBottom: 10,
    },

    input: {
      minHeight: 160,
      borderWidth: 1,
      borderRadius: 16,
      padding: 14,
      fontSize: 15,
    },

    button: {
      marginTop: 18,
      height: 54,
      borderRadius: 14,
      justifyContent: "center",
      alignItems: "center",
    },

    buttonText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "700",
    },
  });