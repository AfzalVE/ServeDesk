import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";

import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Alert,
  useColorScheme,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

import { API_URL } from "../../config/api";

import {
  darkTheme,
  lightTheme,
} from "../../constants/theme";



export default function ActiveTickets() {

  const socket =
    useRef<WebSocket | null>(null);


  const [tickets,setTickets] =
    useState<any[]>([]);


  const [loading,setLoading] =
    useState(true);


  const [refreshing,setRefreshing] =
    useState(false);


  const [cancellingId,setCancellingId] =
    useState<number | null>(null);



  const deviceTheme =
    useColorScheme();


  const [theme,setTheme] =
    useState("dark");



  const currentTheme =
    theme === "light"
    ? lightTheme
    : theme === "dark"
    ? darkTheme
    : deviceTheme === "light"
    ? lightTheme
    : darkTheme;



  const userRef =
    useRef<any>(null);



  // ======================
  // LOAD THEME
  // ======================

  const loadTheme = async()=>{

    try{

      const savedTheme =
        await AsyncStorage.getItem(
          "theme"
        );


      if(savedTheme){

        setTheme(savedTheme);

      }


    }catch(error){

      console.log(error);

    }

  };



  useFocusEffect(
    useCallback(()=>{

      loadTheme();

    },[])
  );



  // ======================
  // STATUS UI
  // ======================

  const getStatus = (
    status:string
  ) => {


    switch(status){


      case "ACCEPTED":

        return {
          label:"✅ Accepted",
          color:"#66BB6A"
        };



      case "OPEN":

        return {
          label:"⏳ Waiting",
          color:"#FFA726"
        };



      case "REJECTED":

        return {
          label:"❌ Rejected",
          color:"#EF5350"
        };



      default:

        return {
          label:status,
          color:currentTheme.primary
        };


    }

  };



  // ======================
  // FETCH TICKETS
  // ======================

  const fetchTickets =
  useCallback(async()=>{


    try{


      const user =
        await AsyncStorage.getItem(
          "user"
        );


      if(!user)
        return;



      const userData =
        JSON.parse(user);



      userRef.current =
        userData;



      const res =
        await fetch(
          `${API_URL}/tickets/customer/${userData.id}`
        );



      if(!res.ok)
        return;



      const data =
        await res.json();



      setTickets(
        Array.isArray(data)
        ? data
        : []
      );


    }

    catch(error){

      console.log(
        "Fetch error:",
        error
      );

    }

    finally{

      setLoading(false);

      setRefreshing(false);

    }


  },[]);





  useEffect(()=>{

    fetchTickets();

  },[
    fetchTickets
  ]);





  // ======================
  // WEBSOCKET
  // ======================

  useEffect(()=>{


    const initWS =
    async()=>{


      const user =
      await AsyncStorage.getItem(
        "user"
      );


      if(!user)
        return;



      socket.current =
      new WebSocket(
        API_URL.replace(
          "http",
          "ws"
        )
        +
        "/ws/tickets"
      );



      socket.current.onopen =
      ()=>{

        console.log(
          "✅ Ticket WS Connected"
        );

      };



      socket.current.onmessage =
      (event)=>{


        console.log(
          "📩 Ticket Update:",
          event.data
        );


        fetchTickets();

      };



      socket.current.onerror =
      (err)=>{

        console.log(
          "❌ WS Error",
          err
        );

      };



      socket.current.onclose =
      ()=>{

        console.log(
          "🔌 WS Closed"
        );

      };


    };



    initWS();



    return()=>{

      socket.current?.close();

    };


  },[
    fetchTickets
  ]);





  // ======================
  // REFRESH
  // ======================

  const onRefresh = ()=>{

    setRefreshing(true);

    fetchTickets();

  };





  // ======================
  // CANCEL
  // ======================

  const cancelTicket =
  async(id:number)=>{


    try{


      setCancellingId(id);



      const res =
      await fetch(
        `${API_URL}/tickets/${id}/cancel`,
        {
          method:"PUT",
          headers:{
            "Content-Type":
            "application/json"
          }
        }
      );



      if(!res.ok)
        throw new Error();



      Alert.alert(
        "Success",
        "Ticket cancelled"
      );



      fetchTickets();


    }

    catch(error){


      Alert.alert(
        "Error",
        "Failed to cancel ticket"
      );


    }

    finally{


      setCancellingId(null);


    }


  };





  // ======================
  // CARD
  // ======================

  const renderItem =
  ({item}:any)=>{


    const statusUI =
    getStatus(
      item.status
    );



    return (

      <View

        style={[
          styles.card,
          {
            backgroundColor:
            currentTheme.card
          }
        ]}

      >


        <View
          style={styles.headerRow}
        >


          <Text

            style={[
              styles.title,
              {
                color:
                currentTheme.text
              }
            ]}

          >

            🎫 Ticket #{item.id}

          </Text>



          <View

            style={[
              styles.badge,
              {
                backgroundColor:
                statusUI.color
              }
            ]}

          >

            <Text
              style={styles.badgeText}
            >
              {statusUI.label}
            </Text>


          </View>


        </View>
                <Text
          style={[
            styles.label,
            {
              color:
              currentTheme.secondaryText
            }
          ]}
        >
          Requested Employee
        </Text>

        <Text
          style={[
            styles.value,
            {
              color:
              currentTheme.text
            }
          ]}
        >
          {item.requested_employee_name}
        </Text>


        {item.accepted_employee_name && (
          <>
            <Text
              style={[
                styles.label,
                {
                  color:
                  currentTheme.secondaryText
                }
              ]}
            >
              Accepted By
            </Text>

            <Text
              style={[
                styles.value,
                {
                  color:"#66BB6A"
                }
              ]}
            >
              {item.accepted_employee_name}
            </Text>
          </>
        )}



        {item.rejected_employee_name && (
          <>
            <Text
              style={[
                styles.label,
                {
                  color:
                  currentTheme.secondaryText
                }
              ]}
            >
              Rejected By
            </Text>

            <Text
              style={[
                styles.value,
                {
                  color:"#EF5350"
                }
              ]}
            >
              {item.rejected_employee_name}
            </Text>
          </>
        )}



        {item.reject_reason && (
          <>
            <Text
              style={[
                styles.label,
                {
                  color:
                  currentTheme.secondaryText
                }
              ]}
            >
              Reason
            </Text>


            <Text
              style={[
                styles.value,
                {
                  color:"#FFB74D"
                }
              ]}
            >
              {item.reject_reason}
            </Text>

          </>
        )}




        {item.status==="OPEN" && (

          <TouchableOpacity

            style={[
              styles.cancelBtn,
              {
                backgroundColor:
                currentTheme.danger
              },

              cancellingId===item.id &&
              styles.disabledBtn

            ]}


            disabled={
              cancellingId===item.id
            }


            onPress={()=>
              cancelTicket(item.id)
            }

          >

            <Text
              style={styles.cancelText}
            >

              {
                cancellingId===item.id
                ?
                "Cancelling..."
                :
                "Cancel Ticket"
              }

            </Text>


          </TouchableOpacity>

        )}


      </View>

    );

  };





  if(loading){

    return (

      <View

        style={[
          styles.loader,
          {
            backgroundColor:
            currentTheme.background
          }
        ]}

      >

        <ActivityIndicator

          size="large"

          color={
            currentTheme.primary
          }

        />

      </View>

    );

  }





  return (

    <View

      style={[
        styles.container,
        {
          backgroundColor:
          currentTheme.background
        }
      ]}

    >

      <Text

        style={[
          styles.pageTitle,
          {
            color:
            currentTheme.text
          }
        ]}

      >

        🎫 Active Tickets

      </Text>




      <FlatList

        data={tickets}

        keyExtractor={
          item=>item.id.toString()
        }


        renderItem={renderItem}


        contentContainerStyle={{
          padding:15,
          paddingBottom:100
        }}


        refreshControl={

          <RefreshControl

            refreshing={
              refreshing
            }

            onRefresh={
              onRefresh
            }

            tintColor={
              currentTheme.primary
            }

          />

        }

      />


    </View>

  );


}
const styles = StyleSheet.create({

  container:{
    flex:1,
  },


  loader:{
    flex:1,
    justifyContent:"center",
    alignItems:"center",
  },


  pageTitle:{
    fontSize:22,
    fontWeight:"900",
    margin:15,
  },


  card:{
    padding:18,
    borderRadius:16,
    marginBottom:15,
  },


  headerRow:{
    flexDirection:"row",
    justifyContent:"space-between",
    alignItems:"center",
    marginBottom:10,
  },


  title:{
    fontSize:16,
    fontWeight:"900",
  },


  label:{
    marginTop:8,
    fontSize:13,
    fontWeight:"600",
  },


  value:{
    fontSize:15,
    fontWeight:"700",
  },


  badge:{
    paddingHorizontal:10,
    paddingVertical:5,
    borderRadius:10,
  },


  badgeText:{
    color:"#FFFFFF",
    fontWeight:"800",
    fontSize:12,
  },


  cancelBtn:{
    marginTop:15,
    padding:12,
    borderRadius:12,
    alignItems:"center",
  },


  cancelText:{
    color:"#FFFFFF",
    fontWeight:"900",
  },


  disabledBtn:{
    opacity:0.6,
  },

});