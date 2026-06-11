import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

export default function Profile() {
  const [user, setUser] = useState<any>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const data = await AsyncStorage.getItem("user");
    if (data) {
      const parsed = JSON.parse(data);
      setUser(parsed);
      setName(parsed.name);
      setEmail(parsed.email);
    }
  };

  const updateProfile = async () => {
    Alert.alert("Success", "Profile updated (mock UI)");
  };

  const changePassword = async () => {
    if (!oldPass || !newPass) {
      Alert.alert("Error", "Fill password fields");
      return;
    }

    Alert.alert("Success", "Password changed (mock UI)");
  };

  const logout = async () => {
    await AsyncStorage.removeItem("user");
    router.replace("/(auth)/sign-in");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <Text style={styles.title}>Profile 👤</Text>

      {/* PROFILE INFO */}
      <View style={styles.card}>
        <Text style={styles.label}>Name</Text>
        <TextInput value={name} onChangeText={setName} style={styles.input} />

        <Text style={styles.label}>Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />

        <TouchableOpacity style={styles.btn} onPress={updateProfile}>
          <Text style={styles.btnText}>Update Profile</Text>
        </TouchableOpacity>
      </View>

      {/* PASSWORD */}
      <View style={styles.card}>
        <Text style={styles.label}>Old Password</Text>
        <TextInput
          secureTextEntry
          value={oldPass}
          onChangeText={setOldPass}
          style={styles.input}
        />

        <Text style={styles.label}>New Password</Text>
        <TextInput
          secureTextEntry
          value={newPass}
          onChangeText={setNewPass}
          style={styles.input}
        />

        <TouchableOpacity style={styles.btn} onPress={changePassword}>
          <Text style={styles.btnText}>Change Password</Text>
        </TouchableOpacity>
      </View>

      {/* LOGOUT */}
      <TouchableOpacity style={styles.logout} onPress={logout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#07111F",
    padding: 15,
  },

  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 15,
  },

  card: {
    backgroundColor: "#101E2D",
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
  },

  label: {
    color: "#9DB1C7",
    marginTop: 10,
  },

  input: {
    backgroundColor: "#16293D",
    color: "#fff",
    padding: 12,
    borderRadius: 10,
    marginTop: 5,
  },

  btn: {
    backgroundColor: "#2D8CFF",
    padding: 12,
    borderRadius: 12,
    marginTop: 15,
    alignItems: "center",
  },

  btnText: {
    color: "#fff",
    fontWeight: "800",
  },

  logout: {
    backgroundColor: "#E53935",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },

  logoutText: {
    color: "#fff",
    fontWeight: "900",
  },
});