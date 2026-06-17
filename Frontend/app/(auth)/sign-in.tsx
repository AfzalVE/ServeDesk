import React, { useState } from "react";
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
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";

import { signin } from "@/lib/auth";
import { API_URL } from "../../config/api";
import {registerForPushNotifications} from "../../utils/notifications";
import { colors } from "../../constants/theme";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

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

          await fetch(
            `${API_URL}/users/push-token`,
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
    <SafeAreaView style={styles.container}>
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
            <Text style={styles.logo}>🏢</Text>

            <Text style={styles.title}>
              ServeDesk
            </Text>

            <Text style={styles.subtitle}>
              Employee Order & Task Management
            </Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>
              Email
            </Text>

            <TextInput
              style={styles.input}
              placeholder="john@company.com"
              placeholderTextColor="#7F8C9A"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Text style={styles.label}>
              Password
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#7F8C9A"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
            />

            <TouchableOpacity
              style={[
                styles.button,
                loading && {
                  opacity: 0.7,
                },
              ]}
              disabled={loading}
              onPress={handleSignin}
            >
              <Text style={styles.buttonText}>
                {loading
                  ? "Signing In..."
                  : "Sign In"}
              </Text>
            </TouchableOpacity>

            <Text style={styles.bottomText}>
              Don't have an account?
            </Text>

            <Link
              href="/(auth)/sign-up"
              asChild
            >
              <TouchableOpacity>
                <Text style={styles.link}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    color: "#FFF",
    fontSize: 36,
    fontWeight: "900",
    marginTop: 10,
  },

  subtitle: {
    color: "#9DB1C7",
    marginTop: 10,
    textAlign: "center",
  },

  form: {
    backgroundColor: "#101E2D",
    padding: 22,
    borderRadius: 20,
  },

  label: {
    color: "#FFF",
    marginBottom: 8,
    marginTop: 10,
    fontWeight: "600",
  },

  input: {
    backgroundColor: "#16293D",
    color: "#FFF",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },

  button: {
    backgroundColor: "#2D8CFF",
    padding: 16,
    borderRadius: 14,
    marginTop: 20,
    alignItems: "center",
  },

  buttonText: {
    color: "#FFF",
    fontWeight: "800",
    fontSize: 16,
  },

  bottomText: {
    color: "#AAA",
    marginTop: 25,
    textAlign: "center",
  },

  link: {
    color: "#64B5F6",
    textAlign: "center",
    marginTop: 10,
    fontWeight: "700",
  },
});