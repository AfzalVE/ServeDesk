import React, { useState } from "react";
import { Link, router } from "expo-router";

import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../constants/theme";

import { API_URL } from "../../config/api";

export default function SignUp() {
  const [fullName, setFullName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userType, setUserType] = useState("CUSTOMER");

  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (
      !fullName.trim() ||
      !email.trim() ||
      !password.trim() ||
      !confirmPassword.trim()
    ) {
      Alert.alert(
        "Validation Error",
        "Please fill all fields."
      );
      return;
    }

    if (
      userType === "EMPLOYEE" &&
      !employeeId.trim()
    ) {
      Alert.alert(
        "Validation Error",
        "Employee ID is required."
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(
        "Validation Error",
        "Passwords do not match."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            full_name: fullName,
            employee_id: employeeId,
            email: email,
            password: password,
            user_type: userType
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        Alert.alert(
          "Signup Failed",
          data.detail ||
          "Unable to create account."
        );
        return;
      }

      Alert.alert(
        "Success",
        "Account created successfully.",
        [
          {
            text: "OK",
            onPress: () =>
              router.replace("/sign-in"),
          },
        ]
      );
    } catch (error) {
      console.log(error);

      Alert.alert(
        "Connection Error",
        "Could not connect to server."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>
          Create Account
        </Text>

        <Text style={styles.subtitle}>
          Join your company's workspace
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Full Name"
          placeholderTextColor="#7F8C9A"
          value={fullName}
          onChangeText={setFullName}
        />

        <TextInput
          style={styles.input}
          placeholder="Employee ID"
          placeholderTextColor="#7F8C9A"
          value={employeeId}
          onChangeText={setEmployeeId}
          autoCapitalize="none"
        />
        <Text style={styles.userTypeLabel}>
          Register As
        </Text>

        <TouchableOpacity
          style={[
            styles.userTypeButton,
            userType === "CUSTOMER" &&
            styles.selectedUserType,
          ]}
          onPress={() =>
            setUserType("CUSTOMER")
          }
        >
          <Text
            style={styles.userTypeText}
          >
            Customer (Give Orders)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.userTypeButton,
            userType === "EMPLOYEE" &&
            styles.selectedUserType,
          ]}
          onPress={() =>
            setUserType("EMPLOYEE")
          }
        >
          <Text
            style={styles.userTypeText}
          >
            Employee (Complete Tasks)
          </Text>
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Company Email"
          placeholderTextColor="#7F8C9A"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#7F8C9A"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          placeholderTextColor="#7F8C9A"
          secureTextEntry
          value={confirmPassword}
          onChangeText={
            setConfirmPassword
          }
        />

        <TouchableOpacity
          style={[
            styles.button,
            loading && {
              opacity: 0.7,
            },
          ]}
          onPress={handleSignup}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading
              ? "Creating Account..."
              : "Create Account"}
          </Text>
        </TouchableOpacity>

        <Link
          href="/sign-in"
          asChild
        >
          <TouchableOpacity>
            <Text style={styles.link}>
              Already have an account?
              {"\n"}
              Sign In
            </Text>
          </TouchableOpacity>
        </Link>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 25,
  },

  title: {
    color: "#FFF",
    fontSize: 34,
    fontWeight: "900",
    marginTop: 40,
  },

  subtitle: {
    color: "#9DB1C7",
    marginTop: 10,
    marginBottom: 30,
  },

  input: {
    backgroundColor: "#101E2D",
    color: "#FFF",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },

  button: {
    backgroundColor: "#2D8CFF",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 10,
  },

  buttonText: {
    color: "#FFF",
    fontWeight: "800",
    fontSize: 16,
  },

  link: {
    color: "#64B5F6",
    textAlign: "center",
    marginTop: 25,
    fontWeight: "700",
  },
  userTypeLabel: {
  color: "#FFF",
  fontSize: 16,
  fontWeight: "700",
  marginBottom: 10,
  marginTop: 5,
},

userTypeButton: {
  backgroundColor: "#101E2D",
  padding: 15,
  borderRadius: 12,
  marginBottom: 12,
  borderWidth: 1,
  borderColor: "#101E2D",
},

selectedUserType: {
  borderColor: "#2D8CFF",
  backgroundColor: "#16324F",
},

userTypeText: {
  color: "#FFFFFF",
  fontWeight: "700",
},
});