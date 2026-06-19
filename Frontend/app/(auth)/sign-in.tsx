import React, { useState,useEffect } from "react";
import { Link, router } from "expo-router";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  useColorScheme,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";

import { signin } from "@/lib/auth";
import { API_URL } from "../../config/api";
import {registerForPushNotifications} from "../../utils/notifications";
import {
  darkTheme,
  lightTheme,
} from "../../constants/theme";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
const deviceTheme =
  useColorScheme();

const [theme, setTheme] =
  useState("dark");

useEffect(() => {
  loadTheme();
}, []);

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
  const handleSignin = async () => {
    const userEmail = email.trim().toLowerCase();

    if (!userEmail || !password.trim()) {
      Alert.alert(
        "Validation",
        "Please fill all fields"
      );
      return;
    }

    try {
      setLoading(true);

      const result = await signin(
        userEmail,
        password
      );

      if (!result.ok) {
        Alert.alert(
          "Login Failed",
          result.error
        );
        return;
      }

      // =====================
      // REGISTER PUSH TOKEN
      // =====================

      try {
        const pushToken =
          await registerForPushNotifications();

        if (pushToken) {
          await AsyncStorage.setItem(
            "expoPushToken",
            pushToken
          );
          console.log(pushToken)
          await fetch(
            `${API_URL}/save-push-token`,
            {
              method: "POST",
              headers: {
                "Content-Type":
                  "application/json",
              },
              body: JSON.stringify({
                user_id: result.user.id,
                push_token: pushToken,
              }),
            }
          );
        }
      } catch (err) {
        console.log(
          "Push token registration failed:",
          err
        );
      }

      // =====================
      // ROUTING
      // =====================

      const userType =
        result.user.user_type;

      switch (userType) {
        case "CUSTOMER":
          router.replace(
            "/(customer)/home"
          );
          break;

        case "EMPLOYEE":
          router.replace(
            "/(employee)/home"
          );
          break;

        case "ADMIN":
          router.replace(
            "/(admin)/dashboard"
          );
          break;

        default:
          Alert.alert(
            "Error",
            `Unknown user type: ${userType}`
          );
      }
    } catch (error) {
      console.log(error);

      Alert.alert(
        "Error",
        "Something went wrong while signing in"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
   <SafeAreaView
  style={[
    styles.container,
    {
      backgroundColor:
        currentTheme.background,
    },
  ]}
>
  <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={
      Platform.OS === "ios"
        ? "padding"
        : undefined
    }
  >
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: "center",
      }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.logoBox}>
        <Text style={styles.logo}>
          🏢
        </Text>

        <Text
          style={[
            styles.title,
            {
              color:
                currentTheme.text,
            },
          ]}
        >
          ServeDesk
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
          Employee Order &
          Task Management
        </Text>
      </View>

      <View
        style={[
          styles.form,
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
          Email
        </Text>

        <TextInput
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
          placeholder="john@company.com"
          placeholderTextColor={
            currentTheme.secondaryText
          }
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Text
          style={[
            styles.label,
            {
              color:
                currentTheme.text,
            },
          ]}
        >
          Password
        </Text>

        <TextInput
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
          placeholder="Enter your password"
          placeholderTextColor={
            currentTheme.secondaryText
          }
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          autoCapitalize="none"
        />

        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor:
                currentTheme.primary,
            },
            loading && {
              opacity: 0.7,
            },
          ]}
          disabled={loading}
          onPress={handleSignin}
        >
          <Text
            style={styles.buttonText}
          >
            {loading
              ? "Signing In..."
              : "Sign In"}
          </Text>
        </TouchableOpacity>

        <Text
          style={[
            styles.bottomText,
            {
              color:
                currentTheme.secondaryText,
            },
          ]}
        >
          Don't have an account?
        </Text>

        <Link
          href="/(auth)/sign-up"
          asChild
        >
          <TouchableOpacity>
            <Text
              style={[
                styles.link,
                {
                  color:
                    currentTheme.primary,
                },
              ]}
            >
              Create Account
            </Text>
          </TouchableOpacity>
        </Link>
      </View>
    </ScrollView>
  </KeyboardAvoidingView>
</SafeAreaView>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 25,
    },

    logoBox: {
      alignItems: "center",
      marginBottom: 50,
    },

    logo: {
      fontSize: 60,
    },

    title: {
      fontSize: 36,
      fontWeight: "900",
      marginTop: 10,
    },

    subtitle: {
      marginTop: 10,
      textAlign: "center",
      fontSize: 15,
    },

    form: {
      padding: 22,
      borderRadius: 20,
    },

    label: {
      marginBottom: 8,
      marginTop: 10,
      fontWeight: "600",
      fontSize: 14,
    },

    input: {
      padding: 15,
      borderRadius: 12,
      marginBottom: 10,
      borderWidth: 1,
      fontSize: 15,
    },

    button: {
      padding: 16,
      borderRadius: 14,
      marginTop: 20,
      alignItems: "center",
    },

    buttonText: {
      color: "#FFFFFF",
      fontWeight: "800",
      fontSize: 16,
    },

    bottomText: {
      marginTop: 25,
      textAlign: "center",
    },

    link: {
      textAlign: "center",
      marginTop: 10,
      fontWeight: "700",
    },
  });