import React, { useEffect, useState, useRef } from "react"; import {
  Alert,
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { RefreshControl } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { API_URL } from "../../config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useColorScheme } from "react-native";

import {
  darkTheme,
  lightTheme,
} from "../../constants/theme";

type Order = {
  id: number;
  status: string;
  customer_id: number;
  display_name: string;
  customer_name: string;
  created_at: string;
  reject_reason: string | null;

};

export default function OrdersPage() {
  const [refreshing, setRefreshing] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const orderSocket = useRef<WebSocket | null>(null);

  // reject modal
  const [rejectModal, setRejectModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
const [theme,setTheme] = useState("dark");

const deviceTheme = useColorScheme();



useFocusEffect(
  React.useCallback(()=>{

    loadTheme();

  },[])
);



const loadTheme = async()=>{

  try{

    const savedTheme =
      await AsyncStorage.getItem("theme");


    if(savedTheme){

      setTheme(savedTheme);

    }


  }catch(error){

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
  useEffect(() => {
    fetchOrders();
    // =====================
    // ORDER WEBSOCKET
    // =====================

    orderSocket.current = new WebSocket(
      API_URL.replace(/^http/, "ws") + "/ws/orders"
    );


    orderSocket.current.onopen = () => {
      console.log("✅ Orders Page WS Connected");
    };


    orderSocket.current.onmessage = (event) => {

      try {

        console.log(
          "🔥 RAW ORDER MESSAGE:",
          event.data
        );


        const parsed = JSON.parse(event.data);


        console.log(
          "📦 ORDER SOCKET:",
          parsed
        );


        // =====================
        // NEW ORDER CREATED
        // =====================
        if (parsed.type === "order_created") {

          const newOrder = parsed.order;


          setOrders((prev) => {

            // avoid duplicate
            const exists = prev.some(
              (o) => o.id === newOrder.id
            );


            if (exists) {
              return prev;
            }


            return [
              newOrder,
              ...prev
            ];

          });

        }



        // =====================
        // ORDER STATUS UPDATED
        // =====================
        if (
          parsed.type === "order_update"
        ) {

          const updatedOrder = parsed.order;


          setOrders((prev) =>
            prev.map((order) =>
              order.id === updatedOrder.id
                ? updatedOrder
                : order
            )
          );

        }



      } catch (error) {

        console.log(
          "Order WS Error:",
          error
        );

      }

    };


    orderSocket.current.onerror = (error) => {
      console.log(
        "Order WS Error:",
        error
      );
    };


    orderSocket.current.onclose = () => {

      console.log(
        "❌ Orders Page WS Closed"
      );

    };


    return () => {

      if (orderSocket.current) {

        orderSocket.current.close();

        orderSocket.current = null;

      }

    };


  }, []);;

  // =========================
  // FETCH ORDERS
  // =========================
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/orders`);
      const data = await res.json();
      setOrders(
        Array.isArray(data)
          ? [...data].sort((a, b) => {
            // Pending first
            if (
              a.status === "PENDING" &&
              b.status !== "PENDING"
            )
              return -1;

            if (
              a.status !== "PENDING" &&
              b.status === "PENDING"
            )
              return 1;

            // Then latest first
            return (
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
            );
          })
          : []
      );
    } catch {
      Alert.alert("Error", "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // UPDATE STATUS (BACKEND FIXED)
  // =========================
  const updateStatus = async (
    id: number,
    status: string
  ) => {
    try {
      let url = `${API_URL}/orders/${id}/status?status=${status}`;

      if (
        status === "REJECTED" &&
        rejectReason.trim()
      ) {
        url += `&reject_reason=${encodeURIComponent(
          rejectReason
        )}`;
      }

      const res = await fetch(url, {
        method: "PUT",
      });

      if (!res.ok) {
        const err = await res.text();
        console.log(err);
        throw new Error();
      }

      setOrders((prev) =>
        prev.map((o) =>
          o.id === id
            ? {
              ...o,
              status,
              reject_reason:
                status === "REJECTED"
                  ? rejectReason
                  : o.reject_reason,
            }
            : o
        )
      );
    } catch {
      Alert.alert(
        "Error",
        "Failed to update order"
      );
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
  // =========================
  // ACTIONS
  // =========================
  const acceptOrder = (id: number) => {
    updateStatus(id, "ACCEPTED");
  };

  const deliverOrder = (id: number) => {
    updateStatus(id, "DELIVERED");
  };

  const openReject = (id: number) => {
    setSelectedOrder(id);
    setRejectReason("");
    setRejectModal(true);
  };

  const confirmReject = async () => {
    if (!rejectReason.trim()) {
      Alert.alert(
        "Required",
        "Reject reason is required"
      );
      return;
    }

    if (selectedOrder === null) return;

    await updateStatus(
      selectedOrder,
      "REJECTED"
    );

    setRejectModal(false);
    setRejectReason("");
    setSelectedOrder(null);

    Alert.alert(
      "Success",
      "Order Rejected"
    );
  };
  const filteredOrders = orders.filter((order) => {
    return (
      formatDate(
        new Date(order.created_at)
      ) === formatDate(selectedDate)
    );
  });

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await fetchOrders();
    } finally {
      setRefreshing(false);
    }
  };

  // =========================
  // LOADING UI
  // =========================
  if (loading) {
    return (
      <View style={styles.loader}>
<ActivityIndicator
 color={currentTheme.primary}
/>      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
           colors={[
 currentTheme.primary
]}

tintColor={
 currentTheme.primary
}
          />
        }
      >
        <Text style={styles.title}>
          All Orders
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

        {filteredOrders.length === 0 ? (
          <Text style={styles.empty}>
            No orders found
          </Text>
        ) : (
          filteredOrders.map((order) => {
            const isLocked =
              order.status === "DELIVERED" ||
              order.status === "REJECTED";

            return (
              <View key={order.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.orderId}>
                    🧾 Order #{order.id}
                  </Text>

                  <View
                    style={[
                      styles.statusBadge,
                      order.status === "PENDING" &&
                      styles.pending,
                      order.status === "ACCEPTED" &&
                      styles.accepted,
                      order.status === "DELIVERED" &&
                      styles.delivered,
                      order.status === "REJECTED" &&
                      styles.rejected,
                      order.status === "CANCELLED" &&
                      styles.cancelled,
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {order.status}
                    </Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.infoRow}>
                  <Text style={styles.label}>
                    🍔 Product
                  </Text>

                  <Text style={styles.value}>
                    {order.display_name}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.label}>
                    👤 Customer
                  </Text>

                  <Text style={styles.value}>
                    {order.customer_name}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.label}>
                    🆔 Customer ID
                  </Text>

                  <Text style={styles.value}>
                    {order.customer_id}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.label}>
                    🕒 Time
                  </Text>

                  <Text style={styles.value}>
                    {new Date(
                      order.created_at
                    ).toLocaleString()}
                  </Text>
                </View>

                {order.status !== "DELIVERED" &&
                  order.status !== "REJECTED" &&
                  order.status !== "CANCELLED" && (
                    <View style={styles.buttonRow}>

                      {order.status === "PENDING" && (
                        <TouchableOpacity
                          style={styles.acceptBtn}
                          onPress={() => acceptOrder(order.id)}
                        >
                          <Text style={styles.buttonText}>
                            Accept
                          </Text>
                        </TouchableOpacity>
                      )}


                      {order.status === "ACCEPTED" && (
                        <TouchableOpacity
                          style={styles.deliverBtn}
                          onPress={() => deliverOrder(order.id)}
                        >
                          <Text style={styles.buttonText}>
                            Deliver
                          </Text>
                        </TouchableOpacity>
                      )}


                      <TouchableOpacity
                        style={styles.rejectBtn}
                        onPress={() => openReject(order.id)}
                      >
                        <Text style={styles.buttonText}>
                          Reject
                        </Text>
                      </TouchableOpacity>

                    </View>
                  )}



                {order.status === "DELIVERED" && (
                  <Text style={styles.completedText}>
                    ✔ Order delivered successfully
                  </Text>
                )}


                {order.status === "REJECTED" && (
                  <Text style={styles.rejectedText}>
                    ❌ Order rejected
                  </Text>
                )}


                {order.status === "CANCELLED" && (
                  <Text style={styles.cancelledText}>
                    🚫 Order cancelled by customer
                  </Text>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* ================= REJECT MODAL ================= */}
      <Modal visible={rejectModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              Reject Order
            </Text>

            <TextInput
              placeholder="Enter reason..."
              placeholderTextColor="#888"
              value={rejectReason}
              onChangeText={setRejectReason}
              style={styles.input}
              multiline
            />

            <View style={styles.modalRow}>

              <TouchableOpacity
                style={styles.btn}
                onPress={() => setRejectModal(false)}
              >
                <Text style={styles.btnText}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.btn,
                  { backgroundColor: "#E53935" },
                ]}
                onPress={confirmReject}
              >
                <Text style={styles.btnText}>
                  Confirm
                </Text>
              </TouchableOpacity>


            </View>
          </View>
        </View>
      </Modal>
    </View>
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
 fontSize:26,
 fontWeight:"900",
 margin:20,
},



text:{
 color:theme.text,
 fontWeight:"800",
},



sub:{
 color:theme.secondaryText,
 marginTop:5,
},



btn:{
 backgroundColor:theme.primary,
 padding:10,
 borderRadius:10,
},



btnText:{
 color:theme.buttonText,
 fontWeight:"800",
},



modalOverlay:{
 flex:1,
 backgroundColor:"rgba(0,0,0,0.6)",
 justifyContent:"center",
 padding:20,
},



modalBox:{
 backgroundColor:theme.card,
 padding:20,
 borderRadius:16,
},



modalTitle:{
 color:theme.text,
 fontSize:18,
 fontWeight:"900",
 marginBottom:10,
},



input:{
 backgroundColor:theme.cardDark,
 color:theme.text,
 padding:12,
 borderRadius:10,
 minHeight:80,
 marginBottom:15,
},



modalRow:{
 flexDirection:"row",
 justifyContent:"space-between",
},



card:{
 backgroundColor:theme.card,
 marginHorizontal:16,
 marginVertical:8,
 padding:18,
 borderRadius:18,
},



cardHeader:{
 flexDirection:"row",
 justifyContent:"space-between",
 alignItems:"center",
},



orderId:{
 color:theme.text,
 fontSize:20,
 fontWeight:"900",
},



divider:{
 height:1,
 backgroundColor:theme.divider,
 marginVertical:15,
},



infoRow:{
 flexDirection:"row",
 justifyContent:"space-between",
 marginVertical:6,
},



label:{
 color:theme.secondaryText,
 fontSize:14,
 fontWeight:"700",
},



value:{
 color:theme.text,
 fontSize:14,
 fontWeight:"800",
 maxWidth:"60%",
 textAlign:"right",
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



empty:{
 color:theme.mutedText,
 textAlign:"center",
 marginTop:50,
 fontSize:16,
},



statusBadge:{
 paddingHorizontal:12,
 paddingVertical:6,
 borderRadius:10,
},



pending:{
 backgroundColor:theme.warning,
},



accepted:{
 backgroundColor:theme.info,
},



delivered:{
 backgroundColor:theme.success,
},



rejected:{
 backgroundColor:theme.danger,
},



cancelled:{
 backgroundColor:theme.buttonDisabled,
},



statusText:{
 color:theme.buttonText,
 fontWeight:"800",
 fontSize:12,
},



buttonRow:{
 flexDirection:"row",
 justifyContent:"space-between",
 marginTop:20,
},



acceptBtn:{
 flex:1,
 backgroundColor:theme.primaryDark,
 padding:12,
 borderRadius:12,
 alignItems:"center",
 marginRight:8,
},



deliverBtn:{
 flex:1,
 backgroundColor:theme.success,
 padding:12,
 borderRadius:12,
 alignItems:"center",
 marginRight:8,
},



rejectBtn:{
 flex:1,
 backgroundColor:theme.danger,
 padding:12,
 borderRadius:12,
 alignItems:"center",
},



buttonText:{
 color:theme.buttonText,
 fontWeight:"800",
 fontSize:15,
},



completedText:{
 color:theme.primaryLight,
 textAlign:"center",
 marginTop:18,
 fontWeight:"700",
},



rejectedText:{
 color:theme.danger,
 textAlign:"center",
 marginTop:18,
 fontWeight:"800",
},



cancelledText:{
 color:theme.warning,
 textAlign:"center",
 marginTop:18,
 fontWeight:"800",
},



});