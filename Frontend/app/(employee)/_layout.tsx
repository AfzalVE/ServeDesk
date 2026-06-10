import { Stack } from "expo-router";
import React from "react";

export default function EmployeeLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "#07111F",
        },
        headerTintColor: "#FFFFFF",
        headerTitleStyle: {
          fontWeight: "800",
        },
        contentStyle: {
          backgroundColor: "#07111F",
        },
      }}
    >
      {/* Employee Dashboard Home */}
      <Stack.Screen
        name="home"
        options={{
          title: "Employee Dashboard",
        }}
      />

      {/* Orders Page */}
      <Stack.Screen
        name="orders"
        options={{
          title: "All Orders",
        }}
      />

      {/* Tickets / Alerts Page */}
      <Stack.Screen
        name="tickets"
        options={{
          title: "Support Tickets",
        }}
      />

      {/* Optional future page */}
      <Stack.Screen
        name="profile"
        options={{
          title: "My Profile",
        }}
      />
    </Stack>
  );
}