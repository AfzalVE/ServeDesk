import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
  FlatList,
  RefreshControl,
  TouchableOpacity
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import { API_URL } from "../../config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

import {
  darkTheme,
  lightTheme,
} from "../../constants/theme";

import {
  useColorScheme,
} from "react-native";

type Ticket = {
  id: number;
  customer_id: number;
  customer_name: string;

  requested_employee_id: number | null;
  requested_employee_name: string | null;

  accepted_employee_id: number | null;
  accepted_employee_name: string | null;
  accepted_at: string | null;

  rejected_employee_id: number | null;
  rejected_employee_name: string | null;


  reject_reason: string | null;

  message: string;
  status: string;
  created_at: string;
};

export default function TicketsPage() {
  const [refreshing, setRefreshing] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);
  const [theme, setTheme] = useState("dark");

  const deviceTheme = useColorScheme();


  useFocusEffect(
    React.useCallback(() => {

      loadTheme();

    }, [])
  );



  const loadTheme = async () => {

    try {

      const savedTheme =
        await AsyncStorage.getItem("theme");


      if (savedTheme) {
        setTheme(savedTheme);
      }

    }
    catch (error) {

      console.log(error);

    }

  };



  const currentTheme =
    theme === "light"
      ?
      lightTheme
      :
      theme === "dark"
        ?
        darkTheme
        :
        deviceTheme === "light"
          ?
          lightTheme
          :
          darkTheme;



  const styles = createStyles(currentTheme);
  const fetchTickets = async () => {
    try {
      const res = await fetch(`${API_URL}/tickets`);
      const data = await res.json();
      setTickets(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };
  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const changeDay = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
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
  const filteredTickets = tickets.filter((ticket) => {
    return (
      formatDate(
        new Date(ticket.created_at)
      ) === formatDate(selectedDate)
    );
  });
  const onRefresh = async () => {
    setRefreshing(true);

    await fetchTickets();

    setRefreshing(false);
  };
  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color={currentTheme.primary}/>
      </View>
    );
  }

  return (

    <FlatList
      data={filteredTickets}
      keyExtractor={(item) => item.id.toString()}
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={currentTheme.primary}
        />
      }
      ListHeaderComponent={
        <>
          <Text style={styles.title}>
            🎫 Support Tickets
          </Text>

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
        </>
      }
      ListEmptyComponent={
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>
            No support tickets found
          </Text>
        </View>
      }
      renderItem={({ item: t }) => (
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <Text style={styles.ticketId}>
              Ticket #{t.id}
            </Text>

            <View
              style={[
                styles.statusBadge,
                t.status === "OPEN" &&
                styles.openBadge,
                t.status === "ACCEPTED" &&
                styles.acceptedBadge,
                t.status === "REJECTED" &&
                styles.rejectedBadge,
                t.status === "CANCELLED" &&
                styles.cancelledBadge,
                t.status === "CLOSED" &&
                styles.closedBadge,
              ]}
            >
              <Text style={styles.statusText}>
                {t.status}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.label}>
              👤 Customer
            </Text>
            <Text style={styles.value}>
              {t.customer_name}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>
              🙋 Requested Employee
            </Text>
            <Text style={styles.value}>
              {t.requested_employee_name || "-"}
            </Text>
          </View>

          {t.accepted_employee_name && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>
                ✅ Accepted By
              </Text>
              <Text style={styles.successText}>
                {t.accepted_employee_name}
              </Text>
            </View>
          )}

          {t.rejected_employee_name && (
            <>
              <View style={styles.infoRow}>
                <Text style={styles.label}>
                  ❌ Rejected By
                </Text>
                <Text style={styles.rejectText}>
                  {t.rejected_employee_name}
                </Text>
              </View>

              <View style={styles.reasonBox}>
                <Text style={styles.reasonTitle}>
                  Reject Reason
                </Text>
                <Text style={styles.reasonText}>
                  {t.reject_reason}
                </Text>
              </View>
            </>
          )}

          <View style={styles.messageBox}>
            <Text style={styles.messageTitle}>
              Message
            </Text>
            <Text style={styles.messageText}>
              {t.message}
            </Text>
          </View>

          <Text style={styles.date}>
            🕒{" "}
            {new Date(
              t.created_at
            ).toLocaleString()}
          </Text>
        </View>
      )}
    />
  );
}

const createStyles = (theme:any)=>

StyleSheet.create({

container:{
 flex:1,
 backgroundColor:theme.background,
},


loader:{
 flex:1,
 justifyContent:"center",
 alignItems:"center",
 backgroundColor:theme.background,
},



title:{
 color:theme.text,
 fontSize:28,
 fontWeight:"900",
 margin:20,
},



emptyCard:{
 backgroundColor:theme.card,
 margin:20,
 padding:30,
 borderRadius:18,
 alignItems:"center",
},


emptyText:{
 color:theme.mutedText,
 fontSize:16,
},



card:{
 backgroundColor:theme.card,
 marginHorizontal:16,
 marginBottom:16,
 padding:18,
 borderRadius:18,
 borderWidth:1,
 borderColor:theme.border,
},



dateRow:{
 flexDirection:"row",
 alignItems:"center",
 justifyContent:"center",
 marginHorizontal:16,
 marginBottom:16,
},



dayButton:{
 backgroundColor:theme.card,
 width:45,
 height:45,
 borderRadius:12,
 justifyContent:"center",
 alignItems:"center",
},



dayButtonText:{
 color:theme.text,
 fontSize:18,
 fontWeight:"900",
},



dateButton:{
 backgroundColor:theme.card,
 paddingHorizontal:18,
 paddingVertical:12,
 borderRadius:12,
 marginHorizontal:10,
},



dateText:{
 color:theme.text,
 fontWeight:"700",
},



headerRow:{
 flexDirection:"row",
 justifyContent:"space-between",
 alignItems:"center",
},



ticketId:{
 color:theme.text,
 fontSize:18,
 fontWeight:"900",
},



divider:{
 height:1,
 backgroundColor:theme.divider,
 marginVertical:15,
},



statusBadge:{
 paddingHorizontal:12,
 paddingVertical:6,
 borderRadius:20,
},



openBadge:{
 backgroundColor:theme.warning,
},



acceptedBadge:{
 backgroundColor:theme.success,
},



rejectedBadge:{
 backgroundColor:theme.danger,
},



cancelledBadge:{
 backgroundColor:theme.buttonDisabled,
},



closedBadge:{
 backgroundColor:theme.primaryDark,
},



statusText:{
 color:theme.buttonText,
 fontWeight:"800",
 fontSize:12,
},



infoRow:{
 flexDirection:"row",
 justifyContent:"space-between",
 marginBottom:10,
},



label:{
 color:theme.secondaryText,
 fontWeight:"700",
 width:"45%",
},



value:{
 color:theme.text,
 fontWeight:"800",
 textAlign:"right",
 width:"55%",
},



successText:{
 color:theme.success,
 fontWeight:"900",
 textAlign:"right",
 width:"55%",
},



rejectText:{
 color:theme.danger,
 fontWeight:"900",
 textAlign:"right",
 width:"55%",
},



reasonBox:{
 marginTop:12,
 backgroundColor:theme.cardDark,
 padding:12,
 borderRadius:12,
},



reasonTitle:{
 color:theme.danger,
 fontWeight:"800",
 marginBottom:6,
},



reasonText:{
 color:theme.text,
 lineHeight:20,
},



messageBox:{
 marginTop:15,
 backgroundColor:theme.cardDark,
 padding:14,
 borderRadius:12,
},



messageTitle:{
 color:theme.primaryLight,
 fontWeight:"900",
 marginBottom:6,
},



messageText:{
 color:theme.text,
 lineHeight:22,
},



date:{
 color:theme.mutedText,
 marginTop:16,
 fontSize:12,
 textAlign:"right",
},


});