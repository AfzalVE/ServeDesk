import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../config/api";

const USER_KEY = "user";
const TOKEN_KEY = "access_token";

/**
 * SIGN IN
 */
export const signin = async (
  email: string,
  password: string
) => {
  try {
    const response = await fetch(
      `${API_URL}/signin`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      }
    );

    let data: any;

    try {
      data = await response.json();
    } catch {
      return {
        ok: false,
        error: `Server Error (${response.status})`,
      };
    }

    if (!response.ok) {
      return {
        ok: false,
        error:
          data?.detail ||
          data?.message ||
          "Login failed",
      };
    }

    if (
      !data.access_token ||
      !data.user
    ) {
      return {
        ok: false,
        error:
          "Invalid login response",
      };
    }

    await AsyncStorage.setItem(
      TOKEN_KEY,
      data.access_token
    );

    await AsyncStorage.setItem(
      USER_KEY,
      JSON.stringify(data.user)
    );

    return {
      ok: true,
      user: data.user,
      token: data.access_token,
    };
  } catch (error) {
    console.log(
      "Signin Error:",
      error
    );

    return {
      ok: false,
      error:
        "Cannot connect to server",
    };
  }
};

/**
 * GET STORED USER
 */
export const getUser =
  async () => {
    try {
      const user =
        await AsyncStorage.getItem(
          USER_KEY
        );

      return user
        ? JSON.parse(user)
        : null;
    } catch {
      return null;
    }
  };

/**
 * GET STORED TOKEN
 */
export const getToken =
  async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(
        TOKEN_KEY
      );
    } catch {
      return null;
    }
  };

/**
 * AUTH HEADERS
 */
export const getAuthHeaders =
  async () => {
    const token =
      await getToken();

    return {
      "Content-Type":
        "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

/**
 * GET CURRENT USER FROM BACKEND
 */
export const getCurrentUser =
  async () => {
    try {
      const token =
        await getToken();

      if (!token) {
        return null;
      }

      const response =
        await fetch(
          `${API_URL}/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

      if (!response.ok) {
        return null;
      }

      const user =
        await response.json();

      await AsyncStorage.setItem(
        USER_KEY,
        JSON.stringify(user)
      );

      return user;
    } catch {
      return null;
    }
  };

/**
 * LOGOUT
 */
export const logout =
  async (): Promise<boolean> => {
    try {
      const token =
        await getToken();

      if (token) {
        try {
          await fetch(
            `${API_URL}/logout`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
        } catch {}
      }

      await AsyncStorage.multiRemove([
        USER_KEY,
        TOKEN_KEY,
      ]);

      return true;
    } catch {
      return false;
    }
  };

/**
 * CHECK LOGIN
 */
export const isLoggedIn =
  async (): Promise<boolean> => {
    const token =
      await getToken();

    return !!token;
  };