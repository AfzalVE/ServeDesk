import { Stack, useRouter, useSegments } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, ActivityIndicator } from "react-native";

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const userStr = await AsyncStorage.getItem("user");

      if (!userStr) {
        setLoading(false);
        return;
      }

      const user = JSON.parse(userStr);

      // prevent redirect loops
      const inAuthGroup = segments[0] === "(auth)";
      const inCustomer = segments[0] === "(customer)";
      const inEmployee = segments[0] === "(employee)";
      const inAdmin = segments[0] === "(admin)";

      if (inAuthGroup) return;

      if (user.user_type === "CUSTOMER" && !inCustomer) {
        router.replace("/(customer)/home");
      }

      if (user.user_type === "EMPLOYEE" && !inEmployee) {
        router.replace("/(employee)/home");
      }

      if (user.user_type === "ADMIN" && !inAdmin) {
        router.replace("/(admin)/dashboard");
      }

      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#07111F" }}>
        <ActivityIndicator color="#2D8CFF" size="large" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
}