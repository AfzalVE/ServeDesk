import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";

export async function registerForPushNotifications() {
  try {
    if (!Device.isDevice) {
      console.log("Must use physical device");
      return null;
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
      console.log("Notification permission denied");
      return null;
    }

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;

    if (!projectId) {
      console.log("EAS Project ID not found");
      return null;
    }

    const token =
      await Notifications.getExpoPushTokenAsync({
        projectId,
      });

    console.log("Expo Push Token:", token.data);

    return token.data;
  } catch (error) {
    console.log("Push registration error:", error);
    return null;
  }
}