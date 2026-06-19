import React, { useEffect, useState } from "react";
import {
  Alert,
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { API_URL } from "../../config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  useColorScheme,
} from "react-native";

import {
  darkTheme,
  lightTheme,
} from "../../constants/theme";

import {
  useFocusEffect,
} from "@react-navigation/native";
export default function Products() {
  const [refreshing, setRefreshing] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");

  const [search, setSearch] = useState("");
//Theme
const [theme, setTheme] = useState("dark");

const deviceTheme = useColorScheme();


useFocusEffect(
  React.useCallback(() => {
    loadTheme();
  }, [])
);



const loadTheme = async () => {
  try {

    const savedTheme =
      await AsyncStorage.getItem("theme");

    if(savedTheme){
      setTheme(savedTheme);
    }

  } catch(error){
    console.log(error);
  }
};



const currentTheme =
  theme === "light"
    ? lightTheme
    : theme === "dark"
      ? darkTheme
      : deviceTheme === "light"
        ? lightTheme
        : darkTheme;



const styles = createStyles(currentTheme);
  // ==========================
  // LOAD PRODUCTS
  // ==========================
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/products`);
      const data = await res.json();

      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      Alert.alert("Error", "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  // ==========================
  // ADD PRODUCT
  // ==========================
  const addProduct = async () => {
    if (!name || !category) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          category,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        Alert.alert("Error", data.detail || "Failed to add product");
        return;
      }

      setProducts([data, ...products]);

      setName("");
      setCategory("");

      Alert.alert("Success", "Product added");
    } catch {
      Alert.alert("Error", "Server error");
    }
  };

  // ==========================
  // DELETE PRODUCT
  // ==========================
  const deleteProduct = async (id: string) => {
    Alert.alert("Delete Product", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const res = await fetch(`${API_URL}/products/${id}`, {
              method: "DELETE",
            });

            if (!res.ok) {
              Alert.alert("Error", "Delete failed");
              return;
            }

            setProducts((prev) =>
              prev.filter((p) => p.id !== id)
            );
          } catch {
            Alert.alert("Error", "Server error");
          }
        },
      },
    ]);
  };

  // ==========================
  // FILTERED PRODUCTS
  // ==========================
  const filtered = products.filter((p) =>
    `${p.name} ${p.category}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );
  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await loadProducts();
    } catch (e) {
      console.log(e);
    } finally {
      setRefreshing(false);
    }
  };
  // ==========================
  // LOADER
  // ==========================
  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={currentTheme.primary} />
        <Text style={styles.loaderText}>Loading products...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>

      <Text style={styles.title}>Products</Text>
      <Text style={styles.subTitle}>
        Manage cafeteria & office items
      </Text>

      {/* SEARCH */}
      <TextInput
        placeholder="Search products..."
        placeholderTextColor={currentTheme.mutedText}
        value={search}
        onChangeText={setSearch}
        style={styles.search}
      />

      {/* ADD PRODUCT */}
      <View style={styles.form}>
        <Text style={styles.formTitle}>Add Product</Text>

        <TextInput
          placeholder="Product name"
          placeholderTextColor="#777"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />

        <TextInput
          placeholder="Category"
          placeholderTextColor="#777"
          value={category}
          onChangeText={setCategory}
          style={styles.input}
        />

        <TouchableOpacity style={styles.addBtn} onPress={addProduct}>
          <Text style={styles.btnText}>Add Product</Text>
        </TouchableOpacity>
      </View>

      {/* LIST */}
      {filtered.length === 0 ? (
        <Text style={styles.empty}>No products found</Text>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.category}>{item.category}</Text>
              </View>

              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => deleteProduct(item.id)}
              >
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      )}
    </SafeAreaView>
  );
}

// ==========================
// STYLES
// ==========================
const createStyles = (theme:any) =>

StyleSheet.create({

container:{
  flex:1,
  backgroundColor:theme.background,
  padding:15,
},



title:{
  color:theme.text,
  fontSize:28,
  fontWeight:"900",
},



subTitle:{
  color:theme.secondaryText,
  marginBottom:15,
},



search:{
  backgroundColor:theme.cardDark,
  color:theme.text,
  padding:12,
  borderRadius:10,
  marginBottom:15,
  borderWidth:1,
  borderColor:theme.border,
},



form:{
  backgroundColor:theme.card,
  padding:15,
  borderRadius:12,
  marginBottom:20,
  borderWidth:1,
  borderColor:theme.border,
},



formTitle:{
  color:theme.text,
  fontSize:18,
  fontWeight:"800",
  marginBottom:10,
},



input:{
  backgroundColor:theme.cardDark,
  color:theme.text,
  padding:12,
  borderRadius:10,
  marginBottom:10,
},



addBtn:{
  backgroundColor:theme.primary,
  padding:12,
  borderRadius:10,
  alignItems:"center",
},



btnText:{
  color:theme.buttonText,
  fontWeight:"800",
},



card:{
  backgroundColor:theme.card,
  padding:15,
  borderRadius:12,
  marginBottom:12,
  flexDirection:"row",
  alignItems:"center",
  borderWidth:1,
  borderColor:theme.border,
},



name:{
  color:theme.text,
  fontSize:16,
  fontWeight:"800",
},



category:{
  color:theme.secondaryText,
  marginTop:4,
},



deleteBtn:{
  backgroundColor:theme.danger,
  paddingVertical:8,
  paddingHorizontal:12,
  borderRadius:8,
},



deleteText:{
  color:theme.buttonText,
  fontWeight:"800",
},



loader:{
  flex:1,
  justifyContent:"center",
  alignItems:"center",
  backgroundColor:theme.background,
},



loaderText:{
  marginTop:10,
  color:theme.mutedText,
},



empty:{
  color:theme.mutedText,
  textAlign:"center",
  marginTop:20,
},


});