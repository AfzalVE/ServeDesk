import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, View } from "react-native";
import { colors } from "../../constants/theme";

export default function CustomerLayout() {
  return (
    <SafeAreaView
      style={styles.safe}
    >
      <Tabs
        screenOptions={{
          headerShown: false,

          tabBarStyle:
            styles.tabBar,

          tabBarActiveTintColor:
            "#2D8CFF",

          tabBarInactiveTintColor:
            "#8FA4B8",

          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: "700",
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home-outline" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="custom"
          options={{
            title: "Custom",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="create-outline" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="orders"
          options={{
            title: "Orders",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="cube-outline" size={size} color={color} />
            ),
          }}
        />
        {/* ANNOUNCEMENTS */}
        <Tabs.Screen
          name="announcements"
          options={{
            title:
              "Notices",
            tabBarIcon: ({
              color,
              size,
            }) => (
              <Ionicons
                name="megaphone-outline"
                size={size}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="active_tickets"
          options={{
            title: "Active",
            tabBarIcon: ({ color, size }) => (
              <Ionicons
                name="ticket-outline"
                size={size}
                color={color}
              />
            ),
          }}
        />


        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person-outline" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor:
      colors.background,
  },

  loader: {
    flex: 1,
    backgroundColor:
      colors.background,
    justifyContent:
      "center",
    alignItems: "center",
  },


  tabBar: {
    backgroundColor: "#101E2D",

    position: "absolute",
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 20,
    height: 65,

    borderTopWidth: 0,

    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
});