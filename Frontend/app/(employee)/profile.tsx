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
} from "react-native";
import { RefreshControl } from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { router } from "expo-router";

import { colors } from "../../constants/theme";

export default function Profile() {
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();
  const [loading, setLoading] =
    useState(true);

  const [user, setUser] =
    useState<any>(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const data =
        await AsyncStorage.getItem(
          "user"
        );

      if (data) {
        setUser(JSON.parse(data));
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    Alert.alert(
      "Logout",
      "Are you sure?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.removeItem(
              "user"
            );

            router.replace("/");
          },
        },
      ]
    );
  };
  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await loadUser();
    } finally {
      setRefreshing(false);
    }
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
        paddingBottom: insets.bottom + 120,
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
      {/* Header */}

      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name
              ?.charAt(0)
              ?.toUpperCase()}
          </Text>
        </View>

        <Text style={styles.name}>
          {user?.name}
        </Text>

        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>
            {user?.user_type}
          </Text>
        </View>
      </View>

      {/* Details */}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
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
          onPress={logout}
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