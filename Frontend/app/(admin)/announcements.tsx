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
  Modal,
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

  const [editVisible, setEditVisible] = useState(false);

  const [editingAnnouncement, setEditingAnnouncement] =
    useState<any>(null);

  const [editTitle, setEditTitle] = useState("");

  const [editMessage, setEditMessage] = useState("");

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




  const updateAnnouncement = async () => {

    if (!editTitle.trim() || !editMessage.trim()) {

      Alert.alert(
        "Missing fields",
        "Please enter title and message"
      );

      return;
    }


    try {

      const res = await fetch(
        `${API_URL}/announcements/${editingAnnouncement.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: editTitle.trim(),
            message: editMessage.trim()
          })
        }
      );


      const data = await res.json();


      if (!res.ok) {

        Alert.alert(
          "Error",
          data.detail || "Update failed"
        );

        return;
      }



      setData(prev =>
        prev.map(item =>
          item.id === editingAnnouncement.id
            ?
            {
              ...item,
              title: editTitle,
              message: editMessage
            }
            :
            item
        )
      );


      setEditVisible(false);


      Alert.alert(
        "Success",
        "Announcement updated"
      );


    }
    catch (err) {

      Alert.alert(
        "Error",
        "Server error"
      );

    }

  };
  const deleteAnnouncement = async (id: number) => {


    Alert.alert(
      "Delete Announcement",
      "Are you sure?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },

        {
          text: "Delete",
          style: "destructive",

          onPress: async () => {

            try {

              const res =
                await fetch(
                  `${API_URL}/announcements/${id}`,
                  {
                    method: "DELETE"
                  }
                );


              if (!res.ok) {

                Alert.alert(
                  "Error",
                  "Delete failed"
                );

                return;
              }



              setData(prev =>
                prev.filter(
                  item => item.id !== id
                )
              );


            }
            catch {

              Alert.alert(
                "Error",
                "Server error"
              );

            }

          }

        }

      ]

    );

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
    <View style={{ flex: 1 }}>

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



              <View style={styles.actionRow}>


                <TouchableOpacity

                  style={styles.editBtn}

                  onPress={() => {

                    setEditingAnnouncement(item);

                    setEditTitle(item.title);

                    setEditMessage(item.message);

                    setEditVisible(true);

                  }}

                >

                  <Text style={styles.actionText}>
                    EDIT
                  </Text>

                </TouchableOpacity>




                <TouchableOpacity

                  style={styles.deleteBtn}

                  onPress={() => deleteAnnouncement(item.id)}

                >

                  <Text style={styles.actionText}>
                    DELETE
                  </Text>

                </TouchableOpacity>



              </View>



            </View>



          </View>


        )
        }


      />
      <Modal
        visible={editVisible}
        transparent
        animationType="fade"
      >

        <View style={styles.modalOverlay}>


          <View style={styles.modalBox}>


            {/* HEADER */}

            <View style={styles.modalHeader}>

              <Text style={styles.modalTitle}>
                ✏️ Edit Announcement
              </Text>


              <TouchableOpacity
                onPress={() => setEditVisible(false)}
              >

                <Text style={styles.closeText}>
                  ✕
                </Text>


              </TouchableOpacity>


            </View>



            <View style={styles.modalDivider} />



            {/* TITLE INPUT */}

            <Text style={styles.inputLabel}>
              Announcement Title
            </Text>


            <TextInput

              style={styles.modalInput}

              placeholder="Enter announcement title"

              placeholderTextColor={
                currentTheme.mutedText
              }

              value={editTitle}

              onChangeText={setEditTitle}

            />




            {/* MESSAGE INPUT */}

            <Text style={styles.inputLabel}>
              Announcement Message
            </Text>



            <TextInput

              style={[
                styles.modalInput,
                styles.messageModalInput
              ]}

              placeholder="Write announcement..."

              placeholderTextColor={
                currentTheme.mutedText
              }

              value={editMessage}

              onChangeText={setEditMessage}

              multiline

            />



            {/* BUTTONS */}


            <View style={styles.modalActions}>


            <TouchableOpacity

              style={styles.cancelBtn}

              onPress={() =>
                setEditVisible(false)
              }

            >

              <Text style={styles.cancelText}>
                Cancel
              </Text>

            </TouchableOpacity>




            <TouchableOpacity

              style={styles.saveBtn}

              onPress={updateAnnouncement}

            >

              <Text style={styles.saveText}>
                Save Changes
              </Text>

            </TouchableOpacity>


          </View>



        </View>


    </View>


</Modal >

</View >

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
    },
    actionRow: {
      flexDirection: "row",
      marginTop: 15,
    },


    editBtn: {
      backgroundColor: theme.primary,
      paddingVertical: 8,
      paddingHorizontal: 15,
      borderRadius: 10,
      marginRight: 10,
    },


    deleteBtn: {
      backgroundColor: theme.danger,
      paddingVertical: 8,
      paddingHorizontal: 15,
      borderRadius: 10,
    },


    actionText: {
      color: theme.buttonText,
      fontWeight: "900",
    },




    modalTitle: {
      color: theme.text,
      fontSize: 22,
      fontWeight: "900",
      textAlign: "center",
      marginBottom: 20,
    },


    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.65)",
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 20,
    },



    modalBox: {
      width: "100%",
      backgroundColor: theme.card,
      borderRadius: 24,
      padding: 22,

      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 8
      },
      shadowOpacity: 0.25,
      shadowRadius: 15,

      elevation: 10,
    },



    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 15,
    },


    closeText: {
      color: theme.mutedText,
      fontSize: 24,
      fontWeight: "900",
    },



    modalDivider: {
      height: 1,
      backgroundColor: theme.border,
      marginBottom: 20,
    },



    inputLabel: {
      color: theme.secondaryText,
      fontSize: 13,
      fontWeight: "800",
      marginBottom: 8,
    },



    modalInput: {
      backgroundColor: theme.surface,
      color: theme.text,

      borderWidth: 1,
      borderColor: theme.border,

      borderRadius: 14,

      paddingHorizontal: 15,
      paddingVertical: 14,

      fontSize: 15,

      marginBottom: 18,
    },



    messageModalInput: {
      height: 120,
      textAlignVertical: "top",
    },



    modalActions: {
      flexDirection: "row",
      marginTop: 5,
    },



    cancelBtn: {
      flex: 1,

      backgroundColor: theme.surface,

      borderWidth: 1,
      borderColor: theme.border,

      paddingVertical: 14,

      borderRadius: 14,

      alignItems: "center",

      marginRight: 10,
    },




    cancelText: {
      color: theme.text,
      fontWeight: "900",
      fontSize: 14,
    },



    saveText: {
      color: theme.buttonText,
      fontWeight: "900",
      fontSize: 14,
    },
    saveBtn: {
      flex: 1,
      backgroundColor: theme.buttonPrimary,
      padding: 14,
      borderRadius: 12,
      alignItems: "center",
      marginLeft: 8,
    },


  });