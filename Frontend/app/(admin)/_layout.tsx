import React, {
  useEffect,
  useState,
  useCallback,
} from "react";

import {
  Tabs,
  router,
} from "expo-router";

import {
  Ionicons,
} from "@expo/vector-icons";

import {
  ActivityIndicator,
  View,
  StyleSheet,
  useColorScheme,
} from "react-native";

import {
  SafeAreaView,
} from "react-native-safe-area-context";

import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  useFocusEffect,
} from "@react-navigation/native";


import {
  darkTheme,
  lightTheme,
} from "../../constants/theme";



export default function AdminLayout() {


  const [loading,setLoading] =
    useState(true);


  const [theme,setTheme] =
    useState("dark");


  const deviceTheme =
    useColorScheme();



  useEffect(() => {
    checkAuth();
  }, []);




  useFocusEffect(
    useCallback(() => {
      loadTheme();
    }, [])
  );



  const loadTheme = async()=>{

    try{

      const savedTheme =
        await AsyncStorage.getItem(
          "theme"
        );


      if(savedTheme){
        setTheme(savedTheme);
      }


    }
    catch(error){

      console.log(error);

    }

  };





  const checkAuth = async()=>{

    try{

      const userStr =
        await AsyncStorage.getItem(
          "user"
        );


      if(!userStr){

        router.replace("/");
        return;

      }



      const user =
        JSON.parse(userStr);



      if(
        user.user_type !== "ADMIN"
      ){

        router.replace("/");
        return;

      }


    }
    catch(error){

      router.replace("/");

    }
    finally{

      setLoading(false);

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

    <SafeAreaView

      style={[
        styles.safe,
        {
          backgroundColor:
          currentTheme.background
        }
      ]}

    >


      <Tabs


        screenOptions={{


          headerShown:false,



          tabBarStyle:{


            backgroundColor:
              currentTheme.card,


            position:"absolute",


            marginHorizontal:16,


            marginBottom:12,


            borderRadius:20,


            height:65,


            borderTopWidth:0,



            shadowColor:"#000",


            shadowOpacity:0.3,


            shadowRadius:10,


            elevation:10,


          },



          tabBarActiveTintColor:
            currentTheme.primary,



          tabBarInactiveTintColor:
            currentTheme.secondaryText,



          tabBarLabelStyle:{

            fontSize:11,

            fontWeight:"700",

          },


        }}


      >



        <Tabs.Screen

          name="dashboard"

          options={{

            title:"Home",

            tabBarIcon:({
              color,
              size
            })=>(

              <Ionicons

                name="grid-outline"

                size={size}

                color={color}

              />

            )

          }}

        />





        <Tabs.Screen

          name="products"

          options={{

            title:"Products",

            tabBarIcon:({
              color,
              size
            })=>(

              <Ionicons

                name="fast-food-outline"

                size={size}

                color={color}

              />

            )

          }}

        />






        <Tabs.Screen

          name="employees"

          options={{

            title:"Employees",

            tabBarIcon:({
              color,
              size
            })=>(

              <Ionicons

                name="people-outline"

                size={size}

                color={color}

              />

            )

          }}

        />






        <Tabs.Screen

          name="tickets"

          options={{

            title:"Tickets",

            tabBarIcon:({
              color,
              size
            })=>(

              <Ionicons

                name="ticket-outline"

                size={size}

                color={color}

              />

            )

          }}

        />







        <Tabs.Screen

          name="orders"

          options={{

            title:"Orders",

            tabBarIcon:({
              color,
              size
            })=>(

              <Ionicons

                name="receipt-outline"

                size={size}

                color={color}

              />

            )

          }}

        />







        <Tabs.Screen

          name="announcements"

          options={{

            title:"Notices",

            tabBarIcon:({
              color,
              size
            })=>(

              <Ionicons

                name="megaphone-outline"

                size={size}

                color={color}

              />

            )

          }}

        />






        <Tabs.Screen

          name="profile"

          options={{

            title:"Profile",

            tabBarIcon:({
              color,
              size
            })=>(

              <Ionicons

                name="person-outline"

                size={size}

                color={color}

              />

            )

          }}

        />



      </Tabs>



    </SafeAreaView>


  );


}






const styles =
StyleSheet.create({

  safe:{
    flex:1,
  },


  loader:{
    flex:1,
    justifyContent:"center",
    alignItems:"center",
  },


});