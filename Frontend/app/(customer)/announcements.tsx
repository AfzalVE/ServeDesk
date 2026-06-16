import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import { API_URL } from "../../config/api";
import { router } from "expo-router";
import { colors } from "../../constants/theme";

export default function AnnouncementsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/announcements`);
      const json = await res.json();

      setData(Array.isArray(json) ? json : []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };
  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const changeDay = (days: number) => {
    const newDate = new Date(selectedDate);

    newDate.setDate(
      newDate.getDate() + days
    );

    setSelectedDate(newDate);
  };

  const onDateChange = (
    event: any,
    date?: Date
  ) => {
    setShowDatePicker(false);

    if (date) {
      setSelectedDate(date);
    }
  };

  const filteredAnnouncements = [...data]
    .filter(
      (item) =>
        formatDate(
          new Date(item.created_at)
        ) === formatDate(selectedDate)
    )
    .sort((a, b) => b.id - a.id);
  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnnouncements();
    setRefreshing(false);
  };
  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#2D8CFF" />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={{
        padding: 16,
        paddingBottom: 100,
        flexGrow: 1,
      }}
      data={filteredAnnouncements}
      keyExtractor={(item) =>
        item.id.toString()
      }
      refreshing={refreshing}
      onRefresh={onRefresh}
      showsVerticalScrollIndicator={
        false
      }
      ListHeaderComponent={
        <>
          <View style={styles.header}>
            <Text style={styles.title}>
              📢 Announcements
            </Text>

            <TouchableOpacity
              onPress={() =>
                router.back()
              }
            >

            </TouchableOpacity>
          </View>


            <View style={styles.dateRow}>
              <TouchableOpacity
                style={styles.dayButton}
                onPress={() => changeDay(-1)}
              >
                <Text style={styles.dayButtonText}>
                  ◀
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.dateButton}
                onPress={() =>
                  setShowDatePicker(true)
                }
              >
                <Text style={styles.dateText}>
                  📅 {selectedDate.toDateString()}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.dayButton}
                onPress={() => changeDay(1)}
              >
                <Text style={styles.dayButtonText}>
                  ▶
                </Text>
              </TouchableOpacity>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="default"
                onChange={onDateChange}
              />
            )}
            
          <Text
            style={
              styles.sectionTitle
            }
          >
            Recent Announcements
          </Text>
        </>
      }
      ListEmptyComponent={
        <Text style={styles.empty}>
          No announcements found
        </Text>
      }
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View
            style={styles.cardTop}
          >
            <View
              style={
                styles.iconCircle
              }
            >
              <Text
                style={
                  styles.iconText
                }
              >
                📢
              </Text>
            </View>

            <View
              style={{ flex: 1 }}
            >
              <Text
                style={
                  styles.announcementTitle
                }
              >
                {item.title}
              </Text>

              <Text
                style={
                  styles.message
                }
              >
                {item.message}
              </Text>

              <Text
                style={
                  styles.meta
                }
              >
                Announcement ID :
                {" "}
                {item.id}
              </Text>
            </View>
          </View>
        </View>
      )}
    />
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 15,
  },

  loader: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "900",
  },
  createCard: {
    backgroundColor: "#101E2D",
    padding: 18,
    borderRadius: 18,
    marginBottom: 20,
  },

  createTitle: {
    color: "#FFF",
    fontWeight: "900",
    fontSize: 18,
    marginBottom: 15,
  },

  input: {
    backgroundColor: "#16293D",
    color: "#FFF",
    borderRadius: 12,
    padding: 15,
    minHeight: 110,
    textAlignVertical: "top",
  },

  publishBtn: {
    backgroundColor: "#2D8CFF",
    marginTop: 15,
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },

  publishText: {
    color: "#FFF",
    fontWeight: "900",
  },

  sectionTitle: {
    color: "#7F93A8",
    fontWeight: "900",
    marginBottom: 15,
    letterSpacing: 1,
  },

  cardTop: {
    flexDirection: "row",
  },

  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#163A63",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },

  iconText: {
    fontSize: 22,
  },



  card: {
    backgroundColor: "#101E2D",
    padding: 18,
    borderRadius: 18,
    marginBottom: 15,
    borderLeftWidth: 5,
    borderLeftColor: "#FFC107",
  },

  message: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },

  meta: {
    color: "#64B5F6",
    marginTop: 12,
    fontWeight: "800",
    fontSize: 12,
  },

  empty: {
    color: "#AAA",
    textAlign: "center",
    marginTop: 50,
  },
  back: {
    color: "#2D8CFF",
    fontWeight: "700",
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },

  dayButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#101E2D",
    justifyContent: "center",
    alignItems: "center",
  },

  dayButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "900",
  },

  dateButton: {
    backgroundColor: "#101E2D",
    paddingHorizontal: 16,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    marginHorizontal: 10,
  },

  dateText: {
    color: "#FFF",
    fontWeight: "800",
  },
  titleInput: {
    backgroundColor: "#16293D",
    color: "#FFF",
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
  },

  announcementTitle: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 8,
  },

});