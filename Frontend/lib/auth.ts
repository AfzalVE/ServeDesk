import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../config/api";

/**
 * SIGN IN USER
 */
export const signin = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/signin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        ok: false,
        error: data.detail || "Login failed",
      };
    }

    // SAVE USER LOCALLY
    await AsyncStorage.setItem(
      "user",
      JSON.stringify(data.user)
    );

    return {
      ok: true,
      user: data.user,
    };
  } catch (error) {
    return {
      ok: false,
      error: "Cannot connect to server",
    };
  }
};

/**
 * GET LOGGED IN USER
 */
export const getUser = async () => {
  try {
    const user = await AsyncStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  } catch (error) {
    return null;
  }
};

/**
 * LOGOUT USER
 */
export const logout = async () => {
  try {
    await AsyncStorage.removeItem("user");
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * CHECK IF USER IS LOGGED IN
 */
export const isLoggedIn = async () => {
  const user = await getUser();
  return !!user;
};