import AsyncStorage from "@react-native-async-storage/async-storage";

export const API_URL =
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "") || "";

if (!API_URL) {
  throw new Error(
    "EXPO_PUBLIC_API_URL is not defined"
  );
}

export const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem(
    "access_token"
  );

  return {
    "Content-Type": "application/json",
    Authorization: token
      ? `Bearer ${token}`
      : "",
  };
};