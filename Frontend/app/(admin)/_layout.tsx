import { Stack } from "expo-router";

export default function AdminLayout() {
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
      <Stack.Screen
        name="dashboard"
        options={{
          title: "Admin Dashboard",
        }}
      />

      <Stack.Screen
        name="products"
        options={{
          title: "Products",
        }}
      />

      <Stack.Screen
        name="add-product"
        options={{
          title: "Add Product",
        }}
      />

      <Stack.Screen
        name="orders"
        options={{
          title: "Orders",
        }}
      />

      <Stack.Screen
        name="employees"
        options={{
          title: "Employees",
        }}
      />

      <Stack.Screen
        name="customers"
        options={{
          title: "Customers",
        }}
      />

      <Stack.Screen
        name="tickets"
        options={{
          title: "Support Tickets",
        }}
      />

      <Stack.Screen
        name="analytics"
        options={{
          title: "Analytics",
        }}
      />

      <Stack.Screen
        name="settings"
        options={{
          title: "Settings",
        }}
      />
    </Stack>
  );
}