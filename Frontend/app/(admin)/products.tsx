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

export default function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");

  const [search, setSearch] = useState("");

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

  // ==========================
  // LOADER
  // ==========================
  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#2D8CFF" />
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
        placeholderTextColor="#777"
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
        />
      )}
    </SafeAreaView>
  );
}

// ==========================
// STYLES
// ==========================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#07111F",
    padding: 15,
  },

  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "900",
  },

  subTitle: {
    color: "#aaa",
    marginBottom: 15,
  },

  search: {
    backgroundColor: "#16293D",
    color: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
  },

  form: {
    backgroundColor: "#101E2D",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },

  formTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 10,
  },

  input: {
    backgroundColor: "#16293D",
    color: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },

  addBtn: {
    backgroundColor: "#2D8CFF",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  btnText: {
    color: "#fff",
    fontWeight: "800",
  },

  card: {
    backgroundColor: "#101E2D",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  name: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },

  category: {
    color: "#aaa",
    marginTop: 4,
  },

  deleteBtn: {
    backgroundColor: "#E53935",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },

  deleteText: {
    color: "#fff",
    fontWeight: "800",
  },

  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#07111F",
  },

  loaderText: {
    marginTop: 10,
    color: "#aaa",
  },

  empty: {
    color: "#aaa",
    textAlign: "center",
    marginTop: 20,
  },
});