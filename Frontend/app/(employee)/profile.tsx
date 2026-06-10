import React, { useState, useEffect } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const data = await AsyncStorage.getItem("user");
    if (data) setUser(JSON.parse(data));
  };

  const logout = async () => {
    Alert.alert("Logout", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        onPress: async () => {
          await AsyncStorage.removeItem("user");
          router.replace("/(auth)/sign-in");
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>👤 Profile</Text>

        <Text style={styles.text}>Name: {user?.name}</Text>
        <Text style={styles.text}>Email: {user?.email}</Text>
        <Text style={styles.text}>Role: Employee</Text>

        <TouchableOpacity style={styles.btn} onPress={logout}>
          <Text style={styles.btnText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#07111F",
    justifyContent: "center",
    alignItems: "center",
  },

  card: {
    backgroundColor: "#101E2D",
    padding: 20,
    borderRadius: 16,
    width: "90%",
  },

  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 15,
  },

  text: {
    color: "#9DB1C7",
    marginBottom: 10,
  },

  btn: {
    marginTop: 20,
    backgroundColor: "#E53935",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },

  btnText: {
    color: "#fff",
    fontWeight: "800",
  },
});