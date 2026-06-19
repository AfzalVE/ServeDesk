import React, {
  useEffect,
  useState,
  useCallback
} from "react";
import { useFocusEffect } from "@react-navigation/native";

import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  ScrollView,
  RefreshControl,
} from "react-native";
import { useColorScheme } from "react-native";
import {
  darkTheme,
  lightTheme,
} from "../../constants/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";


import {
  getCurrentUser,
  logout as logoutUser,
} from "@/lib/auth";

type User = {
  id: number;
  name: string;
  email: string;
  employee_id: string | null;
  user_type: string;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
};

export default function Profile() {
  const insets = useSafeAreaInsets();

  const [user, setUser] =
    useState<User | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser =
        await getCurrentUser();

      if (!currentUser) {
        router.replace(
          "/(auth)/sign-in"
        );
        return;
      }
      setUser(currentUser);
    } catch (error) {
      console.log(error);

      router.replace(
        "/(auth)/sign-in"
      );
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await loadUser();
    } finally {
      setRefreshing(false);
    }
  };
  const deviceTheme = useColorScheme();

  const [theme, setTheme] =
    useState("dark");

  useFocusEffect(
    useCallback(() => {
      loadTheme();
    }, [])
  );

  const loadTheme = async () => {
    try {
      const savedTheme =
        await AsyncStorage.getItem(
          "theme"
        );
      console.log(savedTheme)
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

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            await logoutUser();

            router.replace(
              "/(auth)/sign-in"
            );
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View
        style={[
          styles.loader,
          {
            backgroundColor:
              currentTheme.background,
          },
        ]}
      >
        <ActivityIndicator
          size="large"
          color={currentTheme.primary}
        />
      </View>
    );
  }

  return (
    <ScrollView
      style={[
        styles.container,
        {
          backgroundColor:
            currentTheme.background,
        },
      ]}
      contentContainerStyle={{
        padding: 15,
        paddingBottom:
          insets.bottom + 120,
        flexGrow: 1,
      }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#2D8CFF"
        />
      }
    >
      {/* Profile Header */}

      <View
        style={[
          styles.profileCard,
          {
            backgroundColor:
              currentTheme.card,
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.settingsButton,
            {
              backgroundColor:
                currentTheme.border,
            },
          ]}
          onPress={() =>
            router.push("/settings")
          }
        >
          <Text
            style={[
              styles.settingsText,
              {
                color:
                  currentTheme.primary,
              },
            ]}
          >
            Settings
          </Text>
        </TouchableOpacity>
        <View
          style={[
            styles.avatar,
            {
              backgroundColor:
                currentTheme.primary,
            },
          ]}
        >
          <Text
            style={styles.avatarText}
          >
            {user?.name
              ?.charAt(0)
              ?.toUpperCase() || "U"}
          </Text>
        </View>

        <Text
          style={[
            styles.name,
            {
              color:
                currentTheme.text,
            },
          ]}
        >
          {user?.name}
        </Text>
        <View
          style={[
            styles.roleBadge,
            {
              backgroundColor:
                currentTheme.border,
            },
          ]}
        >
          <Text
            style={[
              styles.roleText,
              {
                color:
                  currentTheme.primary,
              },
            ]}
          >
            {user?.user_type}
          </Text>
        </View>
      </View>

      {/* Account Info */}

      <View style={styles.section}>
        <Text
          style={[
            styles.sectionTitle,
            {
              color: currentTheme.secondaryText,
            },
          ]}
        >
          ACCOUNT INFORMATION
        </Text>

        <View
          style={[
            styles.infoCard,
            {
              backgroundColor: currentTheme.card,
            },
          ]}
        >
          <Text
            style={[
              styles.label,
              {
                color: currentTheme.secondaryText,
              },
            ]}
          >
            Employee ID
          </Text>

          <Text
            style={[
              styles.value,
              {
                color: currentTheme.text,
              },
            ]}
          >
            {user?.employee_id || "Not Assigned"}
          </Text>
        </View>

        <View
          style={[
            styles.infoCard,
            {
              backgroundColor: currentTheme.card,
            },
          ]}
        >
          <Text
            style={[
              styles.label,
              {
                color: currentTheme.secondaryText,
              },
            ]}
          >
            Full Name
          </Text>

          <Text
            style={[
              styles.value,
              {
                color: currentTheme.text,
              },
            ]}
          >
            {user?.name || "-"}
          </Text>
        </View>

        <View
          style={[
            styles.infoCard,
            {
              backgroundColor: currentTheme.card,
            },
          ]}
        >
          <Text
            style={[
              styles.label,
              {
                color: currentTheme.secondaryText,
              },
            ]}
          >
            Email
          </Text>

          <Text
            style={[
              styles.value,
              {
                color: currentTheme.text,
              },
            ]}
          >
            {user?.email || "-"}
          </Text>
        </View>

        <View
          style={[
            styles.infoCard,
            {
              backgroundColor: currentTheme.card,
            },
          ]}
        >
          <Text
            style={[
              styles.label,
              {
                color: currentTheme.secondaryText,
              },
            ]}
          >
            User Type
          </Text>

          <Text
            style={[
              styles.value,
              {
                color: currentTheme.text,
              },
            ]}
          >
            {user?.user_type || "-"}
          </Text>
        </View>

        <View
          style={[
            styles.infoCard,
            {
              backgroundColor: currentTheme.card,
            },
          ]}
        >
          <Text
            style={[
              styles.label,
              {
                color: currentTheme.secondaryText,
              },
            ]}
          >
            Status
          </Text>

          <Text
            style={[
              styles.value,
              {
                color: user?.is_active
                  ? currentTheme.primary
                  : currentTheme.danger,
              },
            ]}
          >
            {user?.is_active ? "Active" : "Offline"}
          </Text>
        </View>

        <View
          style={[
            styles.infoCard,
            {
              backgroundColor: currentTheme.card,
            },
          ]}
        >
          <Text
            style={[
              styles.label,
              {
                color: currentTheme.secondaryText,
              },
            ]}
          >
            Last Login
          </Text>

          <Text
            style={[
              styles.value,
              {
                color: currentTheme.text,
              },
            ]}
          >
            {user?.last_login
              ? new Date(
                user.last_login
              ).toLocaleString()
              : "-"}
          </Text>
        </View>

        <View
          style={[
            styles.infoCard,
            {
              backgroundColor: currentTheme.card,
            },
          ]}
        >
          <Text
            style={[
              styles.label,
              {
                color: currentTheme.secondaryText,
              },
            ]}
          >
            Member Since
          </Text>

          <Text
            style={[
              styles.value,
              {
                color: currentTheme.text,
              },
            ]}
          >
            {user?.created_at
              ? new Date(
                user.created_at
              ).toLocaleDateString()
              : "-"}
          </Text>
        </View>
      </View>

      {/* Actions */}

      <View style={styles.section}>
        <Text
          style={[
            styles.sectionTitle,
            {
              color: currentTheme.secondaryText,
            },
          ]}
        >
          ACTIONS
        </Text>

        <TouchableOpacity
          style={[
            styles.actionButton,
            {
              backgroundColor: currentTheme.card,
            },
          ]}
        >
          <Text
            style={[
              styles.actionText,
              {
                color: currentTheme.text,
              },
            ]}
          >
            ✏️ Edit Profile
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            {
              backgroundColor: currentTheme.card,
            },
          ]}
        >
          <Text
            style={[
              styles.actionText,
              {
                color: currentTheme.text,
              },
            ]}
          >
            🔒 Change Password
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.logoutButton,
            {
              backgroundColor: currentTheme.danger,
            },
          ]}
          onPress={handleLogout}
        >
          <Text
            style={[
              styles.logoutText,
              {
                color: "#FFFFFF",
              },
            ]}
          >
            🚪 Logout
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  profileCard: {
    backgroundColor: "#101E2D",
    borderRadius: 22,
    padding: 25,
    alignItems: "center",
    marginBottom: 25,
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#2D8CFF",
    justifyContent: "center",
    alignItems: "center",
  },

  avatarText: {
    color: "#FFF",
    fontSize: 40,
    fontWeight: "900",
  },

  name: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "900",
    marginTop: 15,
  },

  roleBadge: {
    marginTop: 12,
    backgroundColor: "#163A63",
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
  },

  roleText: {
    color: "#2D8CFF",
    fontWeight: "900",
  },

  section: {
    marginBottom: 20,
  },

  sectionTitle: {
    color: "#7E96AD",
    fontWeight: "900",
    marginBottom: 12,
    letterSpacing: 1,
  },

  infoCard: {
    backgroundColor: "#101E2D",
    borderRadius: 14,
    padding: 15,
    marginBottom: 10,
  },

  label: {
    color: "#7E96AD",
    fontSize: 13,
  },

  value: {
    color: "#FFF",
    fontWeight: "800",
    fontSize: 16,
    marginTop: 4,
  },

  actionButton: {
    backgroundColor: "#101E2D",
    padding: 16,
    borderRadius: 14,
    marginBottom: 10,
  },

  actionText: {
    color: "#FFF",
    fontWeight: "800",
    textAlign: "center",
  },

  logoutButton: {
    backgroundColor: "#B71C1C",
    padding: 16,
    borderRadius: 14,
    marginTop: 10,
  },

  logoutText: {
    color: "#FFF",
    fontWeight: "900",
    textAlign: "center",
  },
  settingsButton: {
    position: "absolute",
    top: 15,
    right: 15,
    backgroundColor: "#163A63",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },

  settingsText: {
    color: "#2D8CFF",
    fontWeight: "700",
    fontSize: 13,
  },
});