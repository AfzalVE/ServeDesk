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
  Modal,
  ScrollView,

} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { API_URL } from "../../config/api";
import { colors } from "../../constants/theme";

export default function Employees() {
  const [refreshing, setRefreshing] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editVisible, setEditVisible] =
    useState(false);

  const [editingEmployee, setEditingEmployee] =
    useState<any>(null);

  const [fullName, setFullName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [employeeId, setEmployeeId] =
    useState("");

  const [userType, setUserType] =
    useState("");

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
  const updateEmployee = async () => {
    try {
      const res = await fetch(
        `${API_URL}/employees/${editingEmployee.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            full_name: fullName,
            email,
            employee_id: employeeId,
            user_type: userType,
          }),
        }
      );

      const data =
        await res.json();

      if (!res.ok) {
        Alert.alert(
          "Error",
          data.detail ||
          "Update failed"
        );
        return;
      }

      setEmployees((prev) =>
        prev.map((emp) =>
          emp.id ===
            editingEmployee.id
            ? {
              ...emp,
              full_name:
                fullName,
              email,
              employee_id:
                employeeId,
              user_type:
                userType,
            }
            : emp
        )
      );

      setEditVisible(false);

      Alert.alert(
        "Success",
        "Employee updated"
      );
    } catch {
      Alert.alert(
        "Error",
        "Server error"
      );
    }
  };
  // ==========================
  // SEARCH FILTER
  // ==========================
  const filtered = employees.filter((e) =>
    `${e.full_name} ${e.email}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );
  const onRefresh = async () => {
    setRefreshing(true);
    await loadEmployees();
    setRefreshing(false);
  };
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
    <View style={{ flex: 1 }}>
      <FlatList
        style={styles.container}
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 100,
          flexGrow: 1,
        }}
        refreshing={refreshing}
        onRefresh={onRefresh}
        data={[...filtered].sort(
          (a, b) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
        )}
        keyExtractor={(item) =>
          item.id.toString()
        }
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <Text style={styles.title}>
              Employees
            </Text>

            <Text style={styles.subTitle}>
              Manage your workforce
            </Text>

            <TextInput
              placeholder="Search employee..."
              placeholderTextColor="#777"
              value={search}
              onChangeText={setSearch}
              style={styles.search}
            />
          </>
        }
        ListEmptyComponent={
          <Text style={styles.empty}>
            No employees found
          </Text>
        }
        renderItem={({ item }) => (
          <View style={styles.employeeCard}>
            <View style={styles.cardHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {item.full_name
                    ?.charAt(0)
                    ?.toUpperCase()}
                </Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.name}>
                  {item.full_name}
                </Text>

                <Text style={styles.email}>
                  {item.email}
                </Text>
              </View>
            </View>

            <View style={styles.separator} />

            <Text style={styles.info}>
              🆔 Employee ID :
              <Text style={styles.value}>
                {" "}
                {item.employee_id ||
                  "Not Assigned"}
              </Text>
            </Text>

            <Text style={styles.info}>
              👤 Role :
              <Text style={styles.value}>
                {" "}
                {item.user_type ||
                  "EMPLOYEE"}
              </Text>
            </Text>

            <Text style={styles.info}>
              📅 Joined :
              <Text style={styles.value}>
                {" "}
                {item.created_at
                  ? new Date(
                    item.created_at
                  ).toLocaleDateString()
                  : "-"}
              </Text>
            </Text>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => {
                  setEditingEmployee(item);

                  setFullName(item.full_name);
                  setEmail(item.email);
                  setEmployeeId(
                    item.employee_id || ""
                  );
                  setUserType(
                    item.user_type || "EMPLOYEE"
                  );

                  setEditVisible(true);
                }}

              >
                <Text style={styles.btnText}>
                  EDIT
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() =>
                  deleteEmployee(item.id)
                }
              >
                <Text style={styles.btnText}>
                  DELETE
                </Text>
              </TouchableOpacity>
            </View>
          </ View>
        )}
      />
      <Modal
        visible={editVisible}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>

            <Text style={styles.modalTitle}>
              Edit Employee
            </Text>

            <ScrollView
              showsVerticalScrollIndicator={
                false
              }
            >
              <TextInput
                placeholder="Full Name"
                placeholderTextColor="#777"
                value={fullName}
                onChangeText={setFullName}
                style={styles.modalInput}
              />

              <TextInput
                placeholder="Email"
                placeholderTextColor="#777"
                value={email}
                onChangeText={setEmail}
                style={styles.modalInput}
              />

              <TextInput
                placeholder="Employee ID"
                placeholderTextColor="#777"
                value={employeeId}
                onChangeText={
                  setEmployeeId
                }
                style={styles.modalInput}
              />

              <TextInput
                placeholder="User Type"
                placeholderTextColor="#777"
                value={userType}
                onChangeText={setUserType}
                style={styles.modalInput}
              />

              <View
                style={
                  styles.modalButtonRow
                }
              >
                <TouchableOpacity
                  style={
                    styles.cancelBtn
                  }
                  onPress={() =>
                    setEditVisible(
                      false
                    )
                  }
                >
                  <Text
                    style={
                      styles.modalBtnText
                    }
                  >
                    CANCEL
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={
                    styles.saveBtn
                  }
                  onPress={
                    updateEmployee
                  }
                >
                  <Text
                    style={
                      styles.modalBtnText
                    }
                  >
                    SAVE
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

          </View>
        </View>
      </Modal>
    </View>
  );

}

// ==========================
// STYLES
// ==========================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    backgroundColor: colors.background,
  },

  loaderText: {
    marginTop: 10,
    color: "#aaa",
  },
  employeeCard: {
    backgroundColor: "#101E2D",
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderLeftWidth: 5,
    borderLeftColor: "#2D8CFF",
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 55,
    height: 55,
    borderRadius: 30,
    backgroundColor: "#2D8CFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },

  avatarText: {
    color: "#FFF",
    fontWeight: "900",
    fontSize: 22,
  },

  separator: {
    height: 1,
    backgroundColor: "#1E344A",
    marginVertical: 15,
  },

  info: {
    color: "#9FB2C6",
    marginBottom: 8,
    fontSize: 14,
  },

  value: {
    color: "#FFF",
    fontWeight: "800",
  },

  buttonRow: {
    flexDirection: "row",
    marginTop: 18,
  },

  editBtn: {
    flex: 1,
    backgroundColor: "#2D8CFF",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginRight: 8,
  },

  deleteBtn: {
    flex: 1,
    backgroundColor: "#E53935",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginLeft: 8,
  },

  btnText: {
    color: "#FFF",
    fontWeight: "900",
  },

  name: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "900",
  },

  email: {
    color: "#7F93A8",
    marginTop: 4,
  },



  empty: {
    color: "#AAA",
    textAlign: "center",
    marginTop: 50,
  },


  card: {
    backgroundColor: "#101E2D",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },


  status: {
    marginTop: 5,
    fontWeight: "700",
  },

  actions: {
    marginLeft: 10,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor:
      "rgba(0,0,0,0.7)",
    justifyContent: "center",
    padding: 20,
  },

  modalContainer: {
    backgroundColor: "#101E2D",
    borderRadius: 20,
    padding: 20,
    maxHeight: "80%",
  },

  modalTitle: {
    color: "#FFF",
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 20,
    textAlign: "center",
  },

  modalInput: {
    backgroundColor: "#16293D",
    color: "#FFF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 15,
  },

  modalButtonRow: {
    flexDirection: "row",
    marginTop: 10,
  },

  cancelBtn: {
    flex: 1,
    backgroundColor: "#555",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginRight: 8,
  },

  saveBtn: {
    flex: 1,
    backgroundColor: "#2D8CFF",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginLeft: 8,
  },

  modalBtnText: {
    color: "#FFF",
    fontWeight: "900",
  },
});