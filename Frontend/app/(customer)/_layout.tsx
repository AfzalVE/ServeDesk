import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, View } from "react-native";

export default function CustomerLayout() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.wrapper}>
        <Tabs
          screenOptions={{
            headerShown: false,

            tabBarStyle: styles.tabBar,

            tabBarActiveTintColor: "#2D8CFF",
            tabBarInactiveTintColor: "#7F8C9A",

            tabBarLabelStyle: {
              fontSize: 11,
              fontWeight: "700",
              marginBottom: 4,
            },

            tabBarItemStyle: {
              paddingVertical: 6,
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
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#07111F",
  },

  wrapper: {
    flex: 1,
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