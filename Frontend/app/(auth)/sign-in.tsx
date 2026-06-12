import React, { useState } from "react";
import { Link, router } from "expo-router";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { API_URL } from "../../config/api";
import { SafeAreaView } from "react-native-safe-area-context";
import { signin } from "@/lib/auth";
import { colors } from "../../constants/theme";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const handleSignin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    setLoading(true);

    const result = await signin(email, password);

    setLoading(false);

    if (!result.ok) {
      Alert.alert("Error", result.error);
      return;
    }

    const type = result.user.user_type;

    if (type === "CUSTOMER") {
      router.replace("/(customer)/home");
    } else if (type === "EMPLOYEE") {
      router.replace("/(employee)/home");
    } else {
      router.replace("/(admin)/dashboard");
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.logoBox}>
        <Text style={styles.logo}>🏢</Text>
        <Text style={styles.title}>ServeDesk</Text>
        <Text style={styles.subtitle}>
          Employee Order & Task Management
        </Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Employee Email</Text>

        <TextInput
          placeholder="john@company.com"
          value={email}
          onChangeText={setEmail}
          placeholderTextColor="#7F8C9A"
          style={styles.input}
        />

        <Text style={styles.label}>Password</Text>

        <TextInput
          secureTextEntry
          placeholder="Enter your password"
          placeholderTextColor="#7F8C9A"
          value={password}
          onChangeText={setPassword}
          style={styles.input}
        />

        <TouchableOpacity
          style={styles.button}
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

        <Link href="/(auth)/sign-up" asChild>
          <TouchableOpacity>
            <Text style={styles.link}>
              Create Account
            </Text>
          </TouchableOpacity>
        </Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
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