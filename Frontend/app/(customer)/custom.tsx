import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../config/api";
import { colors } from "../../constants/theme";

export default function Custom() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const user = JSON.parse(await AsyncStorage.getItem("user") || "{}");

    if (!text.trim()) {
      Alert.alert("Error", "Write something");
      return;
    }

    setLoading(true);

    await fetch(`${API_URL}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer_id: user.id,
        product_id: null,
        quantity: 1,
        custom_message: text,
      }),
    });

    setLoading(false);
    setText("");
    Alert.alert("Success", "Custom order sent");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📝 Custom Order</Text>

      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="e.g. extra sugar, special request..."
        placeholderTextColor="#7F8C9A"
        style={styles.input}
        multiline
      />

      <TouchableOpacity style={styles.btn} onPress={submit}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Submit</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 15 },
  title: { color: "#fff", fontSize: 24, fontWeight: "900", marginBottom: 10 },
  input: {
    backgroundColor: "#101E2D",
    color: "#fff",
    borderRadius: 12,
    padding: 12,
    minHeight: 120,
  },
  btn: {
    marginTop: 15,
    backgroundColor: "#2D8CFF",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "800" },
});