import React, { useEffect, useState } from "react";
import {
  Alert,
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { API_URL } from "../../config/api";

export default function Employees() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // ==========================
  // LOAD EMPLOYEES
  // ==========================
  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/employees`);
      const data = await res.json();

      setEmployees(Array.isArray(data) ? data : []);
    } catch (err) {
      Alert.alert("Error", "Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  // ==========================
  // DELETE EMPLOYEE
  // ==========================
  const deleteEmployee = async (id: string) => {
    Alert.alert("Delete Employee", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const res = await fetch(`${API_URL}/employees/${id}`, {
              method: "DELETE",
            });

            if (!res.ok) {
              Alert.alert("Error", "Delete failed");
              return;
            }

            setEmployees((prev) => prev.filter((e) => e.id !== id));
          } catch {
            Alert.alert("Error", "Server error");
          }
        },
      },
    ]);
  };

  // ==========================
  // SEARCH FILTER
  // ==========================
  const filtered = employees.filter((e) =>
    `${e.full_name} ${e.email}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // ==========================
  // LOADING
  // ==========================
  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#2D8CFF" />
        <Text style={styles.loaderText}>Loading employees...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Employees</Text>

      <Text style={styles.subTitle}>
        Manage all employees in your system
      </Text>

      {/* SEARCH */}
      <TextInput
        placeholder="Search employees..."
        placeholderTextColor="#777"
        value={search}
        onChangeText={setSearch}
        style={styles.search}
      />

      {/* LIST */}
      {filtered.length === 0 ? (
        <Text style={styles.empty}>No employees found</Text>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.full_name}</Text>
                <Text style={styles.email}>{item.email}</Text>

                <Text style={styles.role}>
                  Role: {item.role || "EMPLOYEE"}
                </Text>

                <Text
                  style={[
                    styles.status,
                    {
                      color:
                        item.is_active === false
                          ? "#E53935"
                          : "#4CAF50",
                    },
                  ]}
                >
                  {item.is_active === false
                    ? "Inactive"
                    : "Active"}
                </Text>
              </View>

              {/* ACTIONS */}
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => deleteEmployee(item.id)}
                >
                  <Text style={styles.btnText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

// ==========================
// STYLES
// ==========================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#07111F",
    padding: 15,
  },

  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "900",
  },

  subTitle: {
    color: "#aaa",
    marginBottom: 15,
  },

  search: {
    backgroundColor: "#16293D",
    color: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#07111F",
  },

  loaderText: {
    marginTop: 10,
    color: "#aaa",
  },

  empty: {
    color: "#aaa",
    textAlign: "center",
    marginTop: 20,
  },

  card: {
    backgroundColor: "#101E2D",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  name: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
  },

  email: {
    color: "#aaa",
    marginTop: 4,
  },

  role: {
    color: "#64B5F6",
    marginTop: 5,
  },

  status: {
    marginTop: 5,
    fontWeight: "700",
  },

  actions: {
    marginLeft: 10,
  },

  deleteBtn: {
    backgroundColor: "#E53935",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },

  btnText: {
    color: "#fff",
    fontWeight: "800",
  },
});