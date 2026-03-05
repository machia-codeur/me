import { View, Text, ScrollView, Pressable, FlatList, Image } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { categories, featuredProducts } from "@/lib/mock-data";

function formatPrice(value: number) {
  return new Intl.NumberFormat("fr-FR").format(value) + " FCFA";
}

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      {/* Banner */}
      <View
        style={{
          backgroundColor: "#f97316",
          marginHorizontal: 16,
          marginTop: 16,
          borderRadius: 16,
          padding: 24,
        }}
      >
        <Text style={{ color: "white", fontSize: 13, fontWeight: "500", opacity: 0.9 }}>
          Bienvenue sur
        </Text>
        <Text style={{ color: "white", fontSize: 28, fontWeight: "800", marginTop: 4 }}>
          COWRI
        </Text>
        <Text style={{ color: "white", fontSize: 14, marginTop: 8, opacity: 0.9, lineHeight: 20 }}>
          Découvrez les meilleurs produits artisanaux d'Afrique de l'Ouest
        </Text>
        <Pressable
          style={{
            backgroundColor: "white",
            alignSelf: "flex-start",
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 25,
            marginTop: 16,
          }}
          onPress={() => router.push("/(tabs)/catalogue")}
        >
          <Text style={{ color: "#f97316", fontWeight: "700", fontSize: 14 }}>
            Explorer
          </Text>
        </Pressable>
      </View>

      {/* Categories */}
      <View style={{ marginTop: 28 }}>
        <Text
          style={{
            fontSize: 18,
            fontWeight: "700",
            color: "#1f2937",
            paddingHorizontal: 16,
            marginBottom: 12,
          }}
        >
          Catégories
        </Text>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12 }}
          data={categories}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push("/(tabs)/catalogue")}
              style={{
                alignItems: "center",
                marginHorizontal: 6,
                width: 76,
              }}
            >
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: "#fff7ed",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Ionicons
                  name={item.icon as any}
                  size={24}
                  color="#f97316"
                />
              </View>
              <Text
                style={{
                  fontSize: 11,
                  color: "#4b5563",
                  marginTop: 6,
                  textAlign: "center",
                  fontWeight: "500",
                }}
                numberOfLines={1}
              >
                {item.name}
              </Text>
            </Pressable>
          )}
        />
      </View>

      {/* Featured Products */}
      <View style={{ marginTop: 28, paddingBottom: 24 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 16,
            marginBottom: 12,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "700", color: "#1f2937" }}>
            Produits vedettes
          </Text>
          <Pressable onPress={() => router.push("/(tabs)/catalogue")}>
            <Text style={{ fontSize: 14, color: "#f97316", fontWeight: "600" }}>
              Voir tout
            </Text>
          </Pressable>
        </View>

        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12 }}
          data={featuredProducts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push(`/product/${item.id}`)}
              style={{
                width: 170,
                marginHorizontal: 6,
                backgroundColor: "white",
                borderRadius: 12,
                overflow: "hidden",
                borderWidth: 1,
                borderColor: "#f3f4f6",
              }}
            >
              {/* Placeholder image */}
              <View
                style={{
                  height: 140,
                  backgroundColor: "#fed7aa",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Ionicons name="image-outline" size={40} color="#f97316" />
              </View>
              <View style={{ padding: 10 }}>
                <Text
                  style={{ fontSize: 13, fontWeight: "600", color: "#1f2937" }}
                  numberOfLines={2}
                >
                  {item.name}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 4,
                    gap: 4,
                  }}
                >
                  <Ionicons name="star" size={12} color="#f59e0b" />
                  <Text style={{ fontSize: 11, color: "#6b7280" }}>
                    {item.rating} ({item.reviews})
                  </Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", marginTop: 6, gap: 6 }}>
                  <Text
                    style={{ fontSize: 14, fontWeight: "700", color: "#f97316" }}
                  >
                    {formatPrice(item.price)}
                  </Text>
                  {item.originalPrice && (
                    <Text
                      style={{
                        fontSize: 11,
                        color: "#9ca3af",
                        textDecorationLine: "line-through",
                      }}
                    >
                      {formatPrice(item.originalPrice)}
                    </Text>
                  )}
                </View>
              </View>
            </Pressable>
          )}
        />
      </View>
    </ScrollView>
  );
}
