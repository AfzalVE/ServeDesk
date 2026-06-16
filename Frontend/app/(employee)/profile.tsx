import React, {
  useEffect,
  useState,
} from "react";

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

import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

import { colors } from "../../constants/theme";

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
      <View style={styles.loader}>
        <ActivityIndicator
          size="large"
          color="#2D8CFF"
        />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
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

      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text
            style={styles.avatarText}
          >
            {user?.name
              ?.charAt(0)
              ?.toUpperCase() || "U"}
          </Text>
        </View>

        <Text style={styles.name}>
          {user?.name}
        </Text>

        <View style={styles.roleBadge}>
          <Text
            style={styles.roleText}
          >
            {user?.user_type}
          </Text>
        </View>
      </View>

      {/* Account Info */}

      <View style={styles.section}>
        <Text
          style={styles.sectionTitle}
        >
          ACCOUNT INFORMATION
        </Text>

        <View style={styles.infoCard}>
          <Text style={styles.label}>
            Employee ID
          </Text>

          <Text style={styles.value}>
            {user?.employee_id ||
              "Not Assigned"}
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.label}>
            Full Name
          </Text>

          <Text style={styles.value}>
            {user?.name}
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.label}>
            Email
          </Text>

          <Text style={styles.value}>
            {user?.email}
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.label}>
            User Type
          </Text>

          <Text style={styles.value}>
            {user?.user_type}
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.label}>
            Status
          </Text>

          <Text style={styles.value}>
            {user?.is_active
              ? "Active"
              : "Offline"}
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.label}>
            Last Login
          </Text>

          <Text style={styles.value}>
            {user?.last_login
              ? new Date(
                  user.last_login
                ).toLocaleString()
              : "-"}
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.label}>
            Member Since
          </Text>

          <Text style={styles.value}>
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
        <TouchableOpacity
          style={styles.actionButton}
        >
          <Text
            style={styles.actionText}
          >
            ✏️ Edit Profile
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
        >
          <Text
            style={styles.actionText}
          >
            🔒 Change Password
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text
            style={styles.logoutText}
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
    backgroundColor:
      colors.background,
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor:
      colors.background,
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
});