import React, {
  useEffect,
  useState,
  useCallback,
} from "react";

import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from "react-native";

import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";

import { API_URL } from "../../config/api";
import { router } from "expo-router";

import {
  darkTheme,
  lightTheme,
} from "../../constants/theme";
import { useColorScheme } from "react-native";


export default function AnnouncementsPage() {

  const deviceTheme = useColorScheme();

  const [theme,setTheme] = useState("dark");

  const [data,setData] = useState<any[]>([]);
  const [loading,setLoading] = useState(true);
  const [refreshing,setRefreshing] = useState(false);

  const [selectedDate,setSelectedDate] =
    useState(new Date());

  const [showDatePicker,setShowDatePicker] =
    useState(false);


  useFocusEffect(
    useCallback(()=>{
      loadTheme();
      loadAnnouncements();
    },[])
  );


  const loadTheme = async()=>{

    try{

      const savedTheme =
        await AsyncStorage.getItem("theme");

      if(savedTheme){
        setTheme(savedTheme);
      }

    }catch(err){
      console.log(err);
    }

  };


  const deviceCurrentTheme =
    theme==="light"
    ? lightTheme
    : theme==="dark"
    ? darkTheme
    : deviceTheme==="light"
    ? lightTheme
    : darkTheme;



  const currentTheme=deviceCurrentTheme;



  const loadAnnouncements = async()=>{

    try{

      setLoading(true);

      const res =
        await fetch(
          `${API_URL}/announcements`
        );

      const json =
        await res.json();

      setData(
        Array.isArray(json)
        ? json
        : []
      );


    }catch(err){

      console.log(err);

    }
    finally{

      setLoading(false);

    }

  };



  const formatDate=(date:Date)=>{

    return date
    .toISOString()
    .split("T")[0];

  };



  const changeDay=(days:number)=>{

    const newDate =
      new Date(selectedDate);

    newDate.setDate(
      newDate.getDate()+days
    );

    setSelectedDate(newDate);

  };



  const onDateChange=(
    event:any,
    date?:Date
  )=>{

    setShowDatePicker(false);

    if(date){
      setSelectedDate(date);
    }

  };



  const filteredAnnouncements =
    [...data]
    .filter(
      item =>
      formatDate(
        new Date(item.created_at)
      )
      ===
      formatDate(selectedDate)
    )
    .sort(
      (a,b)=>b.id-a.id
    );



  const onRefresh=async()=>{

    setRefreshing(true);

    await loadAnnouncements();

    setRefreshing(false);

  };



  if(loading){

    return(
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



  return(

    <FlatList

      style={[
        styles.container,
        {
          backgroundColor:
          currentTheme.background
        }
      ]}

      contentContainerStyle={{
        padding:16,
        paddingBottom:100,
        flexGrow:1
      }}

      data={filteredAnnouncements}

      keyExtractor={
        item=>item.id.toString()
      }

      refreshing={refreshing}

      onRefresh={onRefresh}

      showsVerticalScrollIndicator={false}



      ListHeaderComponent={

        <>

        <View style={styles.header}>

          <Text
            style={[
              styles.title,
              {
                color:
                currentTheme.text
              }
            ]}
          >
            📢 Announcements
          </Text>


        </View>



        <View style={styles.dateRow}>


          <TouchableOpacity
            style={[
              styles.dayButton,
              {
                backgroundColor:
                currentTheme.card
              }
            ]}
            onPress={()=>changeDay(-1)}
          >

            <Text
              style={[
                styles.dayButtonText,
                {
                  color:
                  currentTheme.text
                }
              ]}
            >
              ◀
            </Text>

          </TouchableOpacity>




          <TouchableOpacity
            style={[
              styles.dateButton,
              {
                backgroundColor:
                currentTheme.card
              }
            ]}
            onPress={()=>
              setShowDatePicker(true)
            }
          >

            <Text
              style={[
                styles.dateText,
                {
                  color:
                  currentTheme.text
                }
              ]}
            >
              📅 {selectedDate.toDateString()}
            </Text>


          </TouchableOpacity>




          <TouchableOpacity
            style={[
              styles.dayButton,
              {
                backgroundColor:
                currentTheme.card
              }
            ]}
            onPress={()=>changeDay(1)}
          >

            <Text
              style={[
                styles.dayButtonText,
                {
                  color:
                  currentTheme.text
                }
              ]}
            >
              ▶
            </Text>


          </TouchableOpacity>


        </View>



        {
          showDatePicker &&
          <DateTimePicker

            value={selectedDate}

            mode="date"

            display="default"

            onChange={onDateChange}

          />
        }



        <Text
          style={[
            styles.sectionTitle,
            {
              color:
              currentTheme.secondaryText
            }
          ]}
        >
          Recent Announcements
        </Text>


        </>

      }




      ListEmptyComponent={

        <Text
          style={[
            styles.empty,
            {
              color:
              currentTheme.secondaryText
            }
          ]}
        >
          No announcements found
        </Text>

      }



      renderItem={({item})=>(


        <View

          style={[
            styles.card,
            {
              backgroundColor:
              currentTheme.card,
              borderLeftColor:
              currentTheme.primary
            }
          ]}

        >



          <View
            style={styles.cardTop}
          >


            <View

              style={[
                styles.iconCircle,
                {
                  backgroundColor:
                  currentTheme.border
                }
              ]}

            >

              <Text
                style={styles.iconText}
              >
                📢
              </Text>


            </View>




            <View
              style={{flex:1}}
            >


              <Text

                style={[
                  styles.announcementTitle,
                  {
                    color:
                    currentTheme.text
                  }
                ]}

              >

                {item.title}

              </Text>




              <Text

                style={[
                  styles.message,
                  {
                    color:
                    currentTheme.text
                  }
                ]}

              >

                {item.message}

              </Text>




              <Text

                style={[
                  styles.meta,
                  {
                    color:
                    currentTheme.primary
                  }
                ]}

              >

                Announcement ID : {item.id}

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
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  title: {
    fontSize: 24,
    fontWeight: "900",
  },

  sectionTitle: {
    fontWeight: "900",
    marginBottom: 15,
    letterSpacing: 1,
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
    justifyContent: "center",
    alignItems: "center",
  },

  dayButtonText: {
    fontSize: 18,
    fontWeight: "900",
  },

  dateButton: {
    paddingHorizontal: 16,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    marginHorizontal: 10,
  },

  dateText: {
    fontWeight: "800",
  },

  card: {
    padding: 18,
    borderRadius: 18,
    marginBottom: 15,
    borderLeftWidth: 5,
  },

  cardTop: {
    flexDirection: "row",
  },

  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },

  iconText: {
    fontSize: 22,
  },

  announcementTitle: {
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 8,
  },

  message: {
    fontSize: 16,
    fontWeight: "700",
  },

  meta: {
    marginTop: 12,
    fontWeight: "800",
    fontSize: 12,
  },

  empty: {
    textAlign: "center",
    marginTop: 50,
    fontWeight: "600",
  },
});