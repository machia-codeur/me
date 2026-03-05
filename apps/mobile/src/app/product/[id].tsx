import { useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Dimensions,
  FlatList,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { featuredProducts } from "@/lib/mock-data";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

function formatPrice(value: number) {
  return new Intl.NumberFormat("fr-FR").format(value) + " FCFA";
}

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const product = featuredProducts.find((p) => p.id === id);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "#9ca3af", fontSize: 16 }}>Produit non trouvé</Text>
      </View>
    );
  }

  const handleSelectVariant = (label: string, option: string) => {
    setSelectedVariants((prev) => ({ ...prev, [label]: option }));
  };

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <ScrollView>
        {/* Image Gallery (swipeable) */}
        <View>
          <FlatList
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            data={product.images}
            keyExtractor={(_, i) => i.toString()}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(
                e.nativeEvent.contentOffset.x / SCREEN_WIDTH
              );
              setActiveImageIndex(index);
            }}
            renderItem={() => (
              <View
                style={{
                  width: SCREEN_WIDTH,
                  height: 320,
                  backgroundColor: "#fed7aa",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Ionicons name="image-outline" size={60} color="#f97316" />
              </View>
            )}
          />
          {/* Dots indicator */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              gap: 6,
              marginTop: 12,
            }}
          >
            {product.images.map((_, i) => (
              <View
                key={i}
                style={{
                  width: activeImageIndex === i ? 20 : 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: activeImageIndex === i ? "#f97316" : "#e5e7eb",
                }}
              />
            ))}
          </View>
        </View>

        <View style={{ padding: 20 }}>
          {/* Title & Price */}
          <Text style={{ fontSize: 22, fontWeight: "700", color: "#1f2937" }}>
            {product.name}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8, gap: 8 }}>
            <Ionicons name="star" size={16} color="#f59e0b" />
            <Text style={{ fontSize: 14, color: "#6b7280", fontWeight: "500" }}>
              {product.rating} ({product.reviews} avis)
            </Text>
            <Text style={{ fontSize: 14, color: "#d1d5db" }}>|</Text>
            <Text style={{ fontSize: 14, color: "#6b7280" }}>
              {product.seller}
            </Text>
          </View>

          <View style={{ flexDirection: "row", alignItems: "baseline", marginTop: 12, gap: 10 }}>
            <Text style={{ fontSize: 26, fontWeight: "800", color: "#f97316" }}>
              {formatPrice(product.price)}
            </Text>
            {product.originalPrice && (
              <Text
                style={{
                  fontSize: 16,
                  color: "#9ca3af",
                  textDecorationLine: "line-through",
                }}
              >
                {formatPrice(product.originalPrice)}
              </Text>
            )}
          </View>

          {/* Variants */}
          {product.variants.map((variant) => (
            <View key={variant.label} style={{ marginTop: 20 }}>
              <Text
                style={{ fontSize: 15, fontWeight: "600", color: "#374151", marginBottom: 10 }}
              >
                {variant.label}
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {variant.options.map((option) => {
                  const selected = selectedVariants[variant.label] === option;
                  return (
                    <Pressable
                      key={option}
                      onPress={() => handleSelectVariant(variant.label, option)}
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 10,
                        borderRadius: 10,
                        borderWidth: 2,
                        borderColor: selected ? "#f97316" : "#e5e7eb",
                        backgroundColor: selected ? "#fff7ed" : "white",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: selected ? "600" : "400",
                          color: selected ? "#f97316" : "#4b5563",
                        }}
                      >
                        {option}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ))}

          {/* Quantity */}
          <View style={{ marginTop: 20 }}>
            <Text
              style={{ fontSize: 15, fontWeight: "600", color: "#374151", marginBottom: 10 }}
            >
              Quantité
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
              <Pressable
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  backgroundColor: "#f3f4f6",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Ionicons name="remove" size={20} color="#4b5563" />
              </Pressable>
              <Text style={{ fontSize: 18, fontWeight: "600", color: "#1f2937" }}>
                {quantity}
              </Text>
              <Pressable
                onPress={() => setQuantity(quantity + 1)}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  backgroundColor: "#f3f4f6",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Ionicons name="add" size={20} color="#4b5563" />
              </Pressable>
            </View>
          </View>

          {/* Description */}
          <View style={{ marginTop: 24 }}>
            <Text
              style={{ fontSize: 15, fontWeight: "600", color: "#374151", marginBottom: 8 }}
            >
              Description
            </Text>
            <Text style={{ fontSize: 14, color: "#6b7280", lineHeight: 22 }}>
              {product.description}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View
        style={{
          flexDirection: "row",
          padding: 16,
          gap: 12,
          borderTopWidth: 1,
          borderTopColor: "#f3f4f6",
          backgroundColor: "white",
        }}
      >
        <Pressable
          style={{
            flex: 1,
            borderWidth: 2,
            borderColor: "#f97316",
            borderRadius: 12,
            paddingVertical: 14,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#f97316", fontSize: 15, fontWeight: "700" }}>
            Ajouter au panier
          </Text>
        </Pressable>
        <Pressable
          onPress={() => router.push("/payment")}
          style={{
            flex: 1,
            backgroundColor: "#f97316",
            borderRadius: 12,
            paddingVertical: 14,
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <Ionicons name="phone-portrait-outline" size={18} color="white" />
          <Text style={{ color: "white", fontSize: 15, fontWeight: "700" }}>
            Payer Mobile Money
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
