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
  useColorScheme,
} from "react-native";

import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

import { API_URL } from "../../config/api";

import {
  darkTheme,
  lightTheme,
} from "../../constants/theme";


export default function AnnouncementsPage() {


  const [data, setData] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  const [posting, setPosting] = useState(false);


  const [title, setTitle] = useState("");

  const [message, setMessage] = useState("");


  const [refreshing, setRefreshing] = useState(false);


  const [selectedDate, setSelectedDate] =
    useState(new Date());


  const [showDatePicker, setShowDatePicker] =
    useState(false);



  const [theme, setTheme] = useState("dark");

  const deviceTheme = useColorScheme();



  useEffect(() => {
    loadAnnouncements();
  }, []);



  useFocusEffect(
    React.useCallback(() => {
      loadTheme();
    }, [])
  );



  const loadTheme = async () => {

    const saved =
      await AsyncStorage.getItem("theme");

    if (saved) {
      setTheme(saved);
    }

  };



  const currentTheme =
    theme === "light"
      ? lightTheme
      :
      theme === "dark"
        ? darkTheme
        :
        deviceTheme === "light"
          ? lightTheme
          :
          darkTheme;



  const styles =
    createStyles(currentTheme);




  const loadAnnouncements = async () => {

    try {

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


    }
    catch (err) {

      console.log(err);

    }
    finally {

      setLoading(false);

    }

  };





  const postAnnouncement = async () => {


    if (!title.trim() || !message.trim()) {

      Alert.alert(
        "Missing fields",
        "Please enter title and message"
      );

      return;

    }



    try {

      setPosting(true);



      const res =
        await fetch(
          `${API_URL}/announcements`,
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify({

              title: title.trim(),

              message: message.trim()

            })

          }
        );



      if (!res.ok) {

        throw new Error(
          "Failed"
        );

      }



      Alert.alert(
        "Success",
        "Announcement posted"
      );



      setTitle("");

      setMessage("");

      loadAnnouncements();



    }
    catch (err) {

      Alert.alert(
        "Error",
        "Unable to post announcement"
      );

    }
    finally {

      setPosting(false);

    }


  };







  const formatDate = (date: Date) => {

    return date
      .toISOString()
      .split("T")[0];

  };



  const changeDay = (days: number) => {

    const newDate =
      new Date(selectedDate);


    newDate.setDate(
      newDate.getDate() + days
    );


    setSelectedDate(newDate);

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
        (a, b) => b.id - a.id
      );




  const onRefresh = async () => {

    setRefreshing(true);

    await loadAnnouncements();

    setRefreshing(false);

  };





  if (loading) {

    return (

      <View style={styles.loader}>

        <ActivityIndicator
          size="large"
          color={currentTheme.primary}
        />

      </View>

    );

  }




  return (

    <FlatList

      style={styles.container}


      contentContainerStyle={{
        padding: 16,
        paddingBottom: 100
      }}


      data={filteredAnnouncements}


      keyExtractor={
        item => item.id.toString()
      }



      refreshing={refreshing}


      onRefresh={onRefresh}



      ListHeaderComponent={

        <>



          <View style={styles.header}>

            <Text style={styles.heading}>
              📢 Announcements
            </Text>


          </View>





          <View style={styles.createCard}>


            <Text style={styles.createTitle}>
              Create Announcement
            </Text>



            <TextInput

              placeholder="Announcement title"

              placeholderTextColor={
                currentTheme.mutedText
              }

              value={title}

              onChangeText={setTitle}

              style={styles.titleInput}

            />





            <TextInput

              placeholder="Write announcement..."

              placeholderTextColor={
                currentTheme.mutedText
              }


              value={message}

              onChangeText={setMessage}


              multiline


              style={styles.messageInput}

            />




            <TouchableOpacity

              style={styles.publishBtn}

              onPress={postAnnouncement}

              disabled={posting}

            >


              {
                posting

                  ?

                  <ActivityIndicator
                    color={
                      currentTheme.buttonText
                    }
                  />

                  :

                  <Text style={styles.publishText}>
                    Publish Announcement
                  </Text>

              }


            </TouchableOpacity>



          </View>







          <View style={styles.dateRow}>


            <TouchableOpacity

              style={styles.dayButton}

              onPress={() => changeDay(-1)}

            >

              <Text style={styles.dayText}>
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


              <Text style={styles.dayText}>
                ▶
              </Text>


            </TouchableOpacity>



          </View>





          {
            showDatePicker &&

            <DateTimePicker

              value={selectedDate}

              mode="date"

              onChange={(e, date) => {

                setShowDatePicker(false);

                if (date)
                  setSelectedDate(date);

              }}

            />

          }




          <Text style={styles.sectionTitle}>
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


          <View style={styles.iconCircle}>

            <Text>
              📢
            </Text>

          </View>



          <View style={{ flex: 1 }}>


            <Text style={styles.announcementTitle}>
              {item.title}
            </Text>



            <Text style={styles.message}>
              {item.message}
            </Text>



            <Text style={styles.meta}>

              Announcement ID : {item.id}

            </Text>


          </View>



        </View>


      )}


    />


  );


}







const createStyles = (theme: any) =>

  StyleSheet.create({


    container: {
      flex: 1,
      backgroundColor: theme.background
    },



    loader: {
      flex: 1,
      backgroundColor: theme.background,
      justifyContent: "center",
      alignItems: "center"
    },



    header: {
      marginBottom: 20
    },



    heading: {
      fontSize: 25,
      fontWeight: "900",
      color: theme.text
    },



    createCard: {
      backgroundColor: theme.card,
      padding: 18,
      borderRadius: 18,
      marginBottom: 20
    },



    createTitle: {
      fontSize: 18,
      fontWeight: "900",
      color: theme.text,
      marginBottom: 15
    },



    titleInput: {
      backgroundColor: theme.surface,
      color: theme.text,
      borderRadius: 12,
      padding: 14,
      marginBottom: 12
    },



    messageInput: {
      backgroundColor: theme.surface,
      color: theme.text,
      borderRadius: 12,
      padding: 14,
      height: 110,
      textAlignVertical: "top"
    },



    publishBtn: {
      backgroundColor: theme.buttonPrimary,
      padding: 15,
      borderRadius: 12,
      marginTop: 15,
      alignItems: "center"
    },



    publishText: {
      color: theme.buttonText,
      fontWeight: "900"
    },



    sectionTitle: {
      color: theme.secondaryText,
      fontWeight: "900",
      marginBottom: 15
    },



    card: {
      backgroundColor: theme.card,
      padding: 18,
      borderRadius: 18,
      marginBottom: 15,
      borderLeftWidth: 5,
      borderLeftColor: theme.warning,
      flexDirection: "row"
    },



    iconCircle: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: theme.primaryDark,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 15
    },



    announcementTitle: {
      fontSize: 18,
      fontWeight: "900",
      color: theme.text,
      marginBottom: 8
    },



    message: {
      fontSize: 15,
      fontWeight: "700",
      color: theme.text
    },



    meta: {
      marginTop: 12,
      fontSize: 12,
      fontWeight: "800",
      color: theme.softText
    },



    dateRow: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 20
    },



    dayButton: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: theme.card,
      justifyContent: "center",
      alignItems: "center"
    },



    dayText: {
      color: theme.text,
      fontWeight: "900"
    },



    dateButton: {
      height: 44,
      paddingHorizontal: 15,
      borderRadius: 12,
      backgroundColor: theme.card,
      justifyContent: "center",
      marginHorizontal: 10
    },



    dateText: {
      color: theme.text,
      fontWeight: "800"
    },



    empty: {
      color: theme.mutedText,
      textAlign: "center",
      marginTop: 50
    }


  });