import { Stack, useRouter, useSegments } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  ActivityIndicator,
  Platform,
  Vibration,
} from "react-native";

import * as Notifications from "expo-notifications";
import * as Device from "expo-device";

// =====================================
// GLOBAL NOTIFICATION HANDLER
// =====================================

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// =====================================
// REGISTER DEVICE FOR PUSH
// =====================================

async function registerForPushNotificationsAsync() {
  try {
    if (!Device.isDevice) {
      console.log("Physical device required");
      return null;
    }

    // ANDROID CHANNEL
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync(
        "default",
        {
          name: "ServeDesk Alerts",

          importance:
            Notifications.AndroidImportance.MAX,

          enableVibrate: true,

          vibrationPattern: [
            0,
            1000,
            500,
            1000,
            500,
            1000,
          ],

          sound: "default",

          lockscreenVisibility:
            Notifications.AndroidNotificationVisibility.PUBLIC,
        }
      );
    }

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();

    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } =
        await Notifications.requestPermissionsAsync();

      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log(
        "Notification permission denied"
      );
      return null;
    }

    const token =
      await Notifications.getExpoPushTokenAsync();

    console.log(
      "Expo Push Token:",
      token.data
    );

    return token.data;
  } catch (error) {
    console.log(
      "Push registration error:",
      error
    );

    return null;
  }
}

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();

  const [loading, setLoading] =
    useState(true);

  // =====================================
  // PUSH TOKEN REGISTRATION
  // =====================================

  useEffect(() => {
    const initialize = async () => {
      const token =
        await registerForPushNotificationsAsync();

      if (token) {
        await AsyncStorage.setItem(
          "expoPushToken",
          token
        );

        console.log(
          "Push token saved locally"
        );
      }
    };

    initialize();
  }, []);

  // =====================================
  // FOREGROUND NOTIFICATION LISTENER
  // =====================================
const vibrateForTicket = () => {
  Vibration.vibrate(1000);

  setTimeout(() => {
    Vibration.vibrate(1000);
  }, 1500);

  setTimeout(() => {
    Vibration.vibrate(1000);
  }, 3000);
};
  useEffect(() => {
    const notificationListener =
      Notifications.addNotificationReceivedListener(
        (notification) => {
          console.log(
            "Foreground notification:",
            notification
          );

          // Vibrate while app is open
         vibrateForTicket();
        }
      );

    return () => {
      notificationListener.remove();
    };
  }, []);

  // =====================================
  // NOTIFICATION TAP HANDLER
  // =====================================

  useEffect(() => {
    const responseListener =
      Notifications.addNotificationResponseReceivedListener(
        (response) => {
          const data =
            response.notification.request.content
              .data;

          console.log(
            "Notification tapped:",
            data
          );

          if (data?.type === "ticket") {
            router.push(
              "/(employee)/home"
            );
          }

          if (data?.type === "order") {
            router.push(
              "/(employee)/home"
            );
          }
        }
      );

    return () => {
      responseListener.remove();
    };
  }, []);

  // =====================================
  // AUTH CHECK
  // =====================================

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const userStr =
        await AsyncStorage.getItem("user");

      if (!userStr) {
        setLoading(false);
        return;
      }

      const user = JSON.parse(userStr);

      const inAuthGroup =
        segments[0] === "(auth)";

      const inCustomer =
        segments[0] === "(customer)";

      const inEmployee =
        segments[0] === "(employee)";

      const inAdmin =
        segments[0] === "(admin)";

      if (inAuthGroup) {
        setLoading(false);
        return;
      }

      if (
        user.user_type === "CUSTOMER" &&
        !inCustomer
      ) {
        router.replace(
          "/(customer)/home"
        );
      }

      if (
        user.user_type === "EMPLOYEE" &&
        !inEmployee
      ) {
        router.replace(
          "/(employee)/home"
        );
      }

      if (
        user.user_type === "ADMIN" &&
        !inAdmin
      ) {
        router.replace(
          "/(admin)/dashboard"
        );
      }

      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  // =====================================
  // LOADING SCREEN
  // =====================================

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#07111F",
        }}
      >
        <ActivityIndicator
          size="large"
          color="#2D8CFF"
        />
      </View>
    );
  }

  // =====================================
  // APP
  // =====================================

  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </SafeAreaProvider>
  );
}