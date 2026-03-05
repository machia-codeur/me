import { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  TextInput,
  Modal,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { featuredProducts, categories } from "@/lib/mock-data";

function formatPrice(value: number) {
  return new Intl.NumberFormat("fr-FR").format(value) + " FCFA";
}

export default function CatalogueScreen() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<"all" | "low" | "mid" | "high">(
    "all"
  );
  const [sortBy, setSortBy] = useState<"popular" | "price_asc" | "price_desc">(
    "popular"
  );

  const filtered = useMemo(() => {
    let result = [...featuredProducts];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    if (selectedCategory) {
      result = result.filter((p) => p.category === selectedCategory);
    }

    if (priceRange === "low") result = result.filter((p) => p.price < 15000);
    else if (priceRange === "mid")
      result = result.filter((p) => p.price >= 15000 && p.price < 50000);
    else if (priceRange === "high")
      result = result.filter((p) => p.price >= 50000);

    if (sortBy === "price_asc") result.sort((a, b) => a.price - b.price);
    else if (sortBy === "price_desc") result.sort((a, b) => b.price - a.price);
    else result.sort((a, b) => b.reviews - a.reviews);

    return result;
  }, [search, selectedCategory, priceRange, sortBy]);

  const resetFilters = useCallback(() => {
    setSelectedCategory(null);
    setPriceRange("all");
    setSortBy("popular");
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      {/* Search bar */}
      <View
        style={{
          flexDirection: "row",
          paddingHorizontal: 16,
          paddingVertical: 12,
          gap: 10,
          backgroundColor: "white",
          borderBottomWidth: 1,
          borderBottomColor: "#f3f4f6",
        }}
      >
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#f3f4f6",
            borderRadius: 10,
            paddingHorizontal: 12,
          }}
        >
          <Ionicons name="search" size={18} color="#9ca3af" />
          <TextInput
            style={{ flex: 1, paddingVertical: 10, marginLeft: 8, fontSize: 14 }}
            placeholder="Rechercher un produit..."
            placeholderTextColor="#9ca3af"
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <Pressable
          onPress={() => setShowFilters(true)}
          style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            backgroundColor: "#f97316",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Ionicons name="options-outline" size={20} color="white" />
        </Pressable>
      </View>

      {/* Product grid */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={{ padding: 12 }}
        columnWrapperStyle={{ gap: 12 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListEmptyComponent={
          <View style={{ alignItems: "center", marginTop: 60 }}>
            <Ionicons name="search-outline" size={48} color="#d1d5db" />
            <Text style={{ color: "#9ca3af", marginTop: 12, fontSize: 15 }}>
              Aucun produit trouvé
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/product/${item.id}`)}
            style={{
              flex: 1,
              backgroundColor: "white",
              borderRadius: 12,
              overflow: "hidden",
              borderWidth: 1,
              borderColor: "#f3f4f6",
            }}
          >
            <View
              style={{
                height: 130,
                backgroundColor: "#fed7aa",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons name="image-outline" size={32} color="#f97316" />
              {!item.inStock && (
                <View
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    backgroundColor: "#ef4444",
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 4,
                  }}
                >
                  <Text style={{ color: "white", fontSize: 10, fontWeight: "600" }}>
                    Épuisé
                  </Text>
                </View>
              )}
            </View>
            <View style={{ padding: 10 }}>
              <Text
                style={{ fontSize: 13, fontWeight: "600", color: "#1f2937" }}
                numberOfLines={2}
              >
                {item.name}
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4, gap: 4 }}>
                <Ionicons name="star" size={11} color="#f59e0b" />
                <Text style={{ fontSize: 11, color: "#6b7280" }}>
                  {item.rating}
                </Text>
              </View>
              <Text
                style={{ fontSize: 14, fontWeight: "700", color: "#f97316", marginTop: 4 }}
              >
                {formatPrice(item.price)}
              </Text>
            </View>
          </Pressable>
        )}
      />

      {/* Filters Bottom Sheet Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent
        onRequestClose={() => setShowFilters(false)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)" }}
          onPress={() => setShowFilters(false)}
        />
        <View
          style={{
            backgroundColor: "white",
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingTop: 16,
            paddingBottom: 40,
            paddingHorizontal: 20,
            maxHeight: "70%",
          }}
        >
          {/* Handle */}
          <View
            style={{
              width: 40,
              height: 4,
              backgroundColor: "#d1d5db",
              borderRadius: 2,
              alignSelf: "center",
              marginBottom: 16,
            }}
          />

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "700", color: "#1f2937" }}>
              Filtres
            </Text>
            <Pressable onPress={resetFilters}>
              <Text style={{ fontSize: 14, color: "#f97316", fontWeight: "600" }}>
                Réinitialiser
              </Text>
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Categories */}
            <Text
              style={{ fontSize: 15, fontWeight: "600", color: "#374151", marginBottom: 10 }}
            >
              Catégorie
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
              {categories.map((cat) => (
                <Pressable
                  key={cat.id}
                  onPress={() =>
                    setSelectedCategory(
                      selectedCategory === cat.name ? null : cat.name
                    )
                  }
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 20,
                    backgroundColor:
                      selectedCategory === cat.name ? "#f97316" : "#f3f4f6",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "500",
                      color: selectedCategory === cat.name ? "white" : "#4b5563",
                    }}
                  >
                    {cat.name}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Price Range */}
            <Text
              style={{ fontSize: 15, fontWeight: "600", color: "#374151", marginBottom: 10 }}
            >
              Fourchette de prix
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
              {[
                { key: "all" as const, label: "Tous" },
                { key: "low" as const, label: "< 15 000" },
                { key: "mid" as const, label: "15 000 - 50 000" },
                { key: "high" as const, label: "> 50 000" },
              ].map((range) => (
                <Pressable
                  key={range.key}
                  onPress={() => setPriceRange(range.key)}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 20,
                    backgroundColor:
                      priceRange === range.key ? "#f97316" : "#f3f4f6",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "500",
                      color: priceRange === range.key ? "white" : "#4b5563",
                    }}
                  >
                    {range.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Sort */}
            <Text
              style={{ fontSize: 15, fontWeight: "600", color: "#374151", marginBottom: 10 }}
            >
              Trier par
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
              {[
                { key: "popular" as const, label: "Popularité" },
                { key: "price_asc" as const, label: "Prix croissant" },
                { key: "price_desc" as const, label: "Prix décroissant" },
              ].map((sort) => (
                <Pressable
                  key={sort.key}
                  onPress={() => setSortBy(sort.key)}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 20,
                    backgroundColor:
                      sortBy === sort.key ? "#f97316" : "#f3f4f6",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "500",
                      color: sortBy === sort.key ? "white" : "#4b5563",
                    }}
                  >
                    {sort.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          {/* Apply button */}
          <Pressable
            onPress={() => setShowFilters(false)}
            style={{
              backgroundColor: "#f97316",
              borderRadius: 12,
              paddingVertical: 14,
              alignItems: "center",
              marginTop: 10,
            }}
          >
            <Text style={{ color: "white", fontSize: 15, fontWeight: "700" }}>
              Appliquer les filtres
            </Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}
