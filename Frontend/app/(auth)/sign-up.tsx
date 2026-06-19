import React, {
  useState,
  useEffect,
} from "react";

import { Link, router } from "expo-router";

import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import {
  darkTheme,
  lightTheme,
} from "../../constants/theme";

import { API_URL } from "../../config/api";
export default function SignUp() {
  const [fullName, setFullName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userType, setUserType] = useState("CUSTOMER");

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
  <SafeAreaView
    style={[
      styles.container,
      {
        backgroundColor:
          currentTheme.background,
      },
    ]}
  >
    <ScrollView
      showsVerticalScrollIndicator={
        false
      }
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
        Create Account
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
        Join your company's workspace
      </Text>

      <TextInput
        style={[
          styles.input,
          {
            backgroundColor:
              currentTheme.card,
            color:
              currentTheme.text,
            borderColor:
              currentTheme.border,
          },
        ]}
        placeholder="Full Name"
        placeholderTextColor={
          currentTheme.secondaryText
        }
        value={fullName}
        onChangeText={setFullName}
      />

      <TextInput
        style={[
          styles.input,
          {
            backgroundColor:
              currentTheme.card,
            color:
              currentTheme.text,
            borderColor:
              currentTheme.border,
          },
        ]}
        placeholder="Employee ID"
        placeholderTextColor={
          currentTheme.secondaryText
        }
        value={employeeId}
        onChangeText={setEmployeeId}
        autoCapitalize="none"
      />

      <Text
        style={[
          styles.userTypeLabel,
          {
            color:
              currentTheme.text,
          },
        ]}
      >
        Register As
      </Text>

      <TouchableOpacity
        style={[
          styles.userTypeButton,
          {
            backgroundColor:
              currentTheme.card,
            borderColor:
              currentTheme.border,
          },
          userType ===
            "CUSTOMER" && {
            borderColor:
              currentTheme.primary,
            backgroundColor:
              currentTheme.border,
          },
        ]}
        onPress={() =>
          setUserType(
            "CUSTOMER"
          )
        }
      >
        <Text
          style={[
            styles.userTypeText,
            {
              color:
                currentTheme.text,
            },
          ]}
        >
          Customer (Give Orders)
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.userTypeButton,
          {
            backgroundColor:
              currentTheme.card,
            borderColor:
              currentTheme.border,
          },
          userType ===
            "EMPLOYEE" && {
            borderColor:
              currentTheme.primary,
            backgroundColor:
              currentTheme.border,
          },
        ]}
        onPress={() =>
          setUserType(
            "EMPLOYEE"
          )
        }
      >
        <Text
          style={[
            styles.userTypeText,
            {
              color:
                currentTheme.text,
            },
          ]}
        >
          Employee (Complete Tasks)
        </Text>
      </TouchableOpacity>

      <TextInput
        style={[
          styles.input,
          {
            backgroundColor:
              currentTheme.card,
            color:
              currentTheme.text,
            borderColor:
              currentTheme.border,
          },
        ]}
        placeholder="Company Email"
        placeholderTextColor={
          currentTheme.secondaryText
        }
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={[
          styles.input,
          {
            backgroundColor:
              currentTheme.card,
            color:
              currentTheme.text,
            borderColor:
              currentTheme.border,
          },
        ]}
        placeholder="Password"
        placeholderTextColor={
          currentTheme.secondaryText
        }
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TextInput
        style={[
          styles.input,
          {
            backgroundColor:
              currentTheme.card,
            color:
              currentTheme.text,
            borderColor:
              currentTheme.border,
          },
        ]}
        placeholder="Confirm Password"
        placeholderTextColor={
          currentTheme.secondaryText
        }
        secureTextEntry
        value={confirmPassword}
        onChangeText={
          setConfirmPassword
        }
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
        onPress={handleSignup}
        disabled={loading}
      >
        <Text
          style={
            styles.buttonText
          }
        >
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
          <Text
            style={[
              styles.link,
              {
                color:
                  currentTheme.primary,
              },
            ]}
          >
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

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 25,
    },

    title: {
      fontSize: 34,
      fontWeight: "900",
      marginTop: 40,
    },

    subtitle: {
      marginTop: 10,
      marginBottom: 30,
      fontSize: 15,
    },

    input: {
      padding: 15,
      borderRadius: 12,
      marginBottom: 15,
      borderWidth: 1,
      fontSize: 15,
    },

    button: {
      padding: 16,
      borderRadius: 14,
      alignItems: "center",
      marginTop: 10,
    },

    buttonText: {
      color: "#FFFFFF",
      fontWeight: "800",
      fontSize: 16,
    },

    link: {
      textAlign: "center",
      marginTop: 25,
      fontWeight: "700",
      marginBottom: 30,
    },

    userTypeLabel: {
      fontSize: 16,
      fontWeight: "700",
      marginBottom: 10,
      marginTop: 5,
    },

    userTypeButton: {
      padding: 15,
      borderRadius: 12,
      marginBottom: 12,
      borderWidth: 1,
    },

    userTypeText: {
      fontWeight: "700",
      fontSize: 14,
    },
  });