import { useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { featuredProducts, type CartItem } from "@/lib/mock-data";

function formatPrice(value: number) {
  return new Intl.NumberFormat("fr-FR").format(value) + " FCFA";
}

// Demo cart items
const initialCart: CartItem[] = [
  {
    product: featuredProducts[0],
    quantity: 2,
    selectedVariants: { Taille: "2m", Couleur: "Marron" },
  },
  {
    product: featuredProducts[3],
    quantity: 1,
    selectedVariants: { Volume: "250ml" },
  },
  {
    product: featuredProducts[4],
    quantity: 1,
    selectedVariants: { Taille: "L", Motif: "Ankara" },
  },
];

export default function CartScreen() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState(initialCart);

  const updateQuantity = (index: number, delta: number) => {
    setCartItems((items) =>
      items
        .map((item, i) =>
          i === index
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (index: number) => {
    setCartItems((items) => items.filter((_, i) => i !== index));
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const shipping = subtotal > 50000 ? 0 : 2500;
  const total = subtotal + shipping;

  if (cartItems.length === 0) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f9fafb",
          padding: 40,
        }}
      >
        <Ionicons name="cart-outline" size={64} color="#d1d5db" />
        <Text
          style={{
            fontSize: 18,
            fontWeight: "600",
            color: "#6b7280",
            marginTop: 16,
          }}
        >
          Votre panier est vide
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: "#9ca3af",
            marginTop: 8,
            textAlign: "center",
          }}
        >
          Explorez notre catalogue pour trouver des produits artisanaux uniques
        </Text>
        <Pressable
          onPress={() => router.push("/(tabs)/catalogue")}
          style={{
            marginTop: 24,
            backgroundColor: "#f97316",
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 12,
          }}
        >
          <Text style={{ color: "white", fontSize: 15, fontWeight: "600" }}>
            Explorer le catalogue
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 200 }}>
        {cartItems.map((item, index) => (
          <View
            key={`${item.product.id}-${index}`}
            style={{
              backgroundColor: "white",
              borderRadius: 12,
              padding: 14,
              marginBottom: 12,
              flexDirection: "row",
              gap: 12,
              borderWidth: 1,
              borderColor: "#f3f4f6",
            }}
          >
            {/* Image placeholder */}
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 10,
                backgroundColor: "#fed7aa",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons name="image-outline" size={28} color="#f97316" />
            </View>

            <View style={{ flex: 1 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: "#1f2937",
                    flex: 1,
                    marginRight: 8,
                  }}
                  numberOfLines={2}
                >
                  {item.product.name}
                </Text>
                <Pressable onPress={() => removeItem(index)}>
                  <Ionicons name="trash-outline" size={18} color="#ef4444" />
                </Pressable>
              </View>

              {/* Variants */}
              <Text style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>
                {Object.entries(item.selectedVariants)
                  .map(([k, v]) => `${k}: ${v}`)
                  .join(" · ")}
              </Text>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: 10,
                }}
              >
                <Text
                  style={{ fontSize: 15, fontWeight: "700", color: "#f97316" }}
                >
                  {formatPrice(item.product.price * item.quantity)}
                </Text>

                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <Pressable
                    onPress={() => updateQuantity(index, -1)}
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 8,
                      backgroundColor: "#f3f4f6",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Ionicons name="remove" size={16} color="#4b5563" />
                  </Pressable>
                  <Text
                    style={{ fontSize: 15, fontWeight: "600", color: "#1f2937" }}
                  >
                    {item.quantity}
                  </Text>
                  <Pressable
                    onPress={() => updateQuantity(index, 1)}
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 8,
                      backgroundColor: "#f3f4f6",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Ionicons name="add" size={16} color="#4b5563" />
                  </Pressable>
                </View>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Bottom summary */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "white",
          borderTopWidth: 1,
          borderTopColor: "#f3f4f6",
          padding: 20,
          paddingBottom: 36,
        }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
          <Text style={{ fontSize: 14, color: "#6b7280" }}>Sous-total</Text>
          <Text style={{ fontSize: 14, color: "#374151" }}>
            {formatPrice(subtotal)}
          </Text>
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
          <Text style={{ fontSize: 14, color: "#6b7280" }}>Livraison</Text>
          <Text style={{ fontSize: 14, color: "#374151" }}>
            {shipping === 0 ? "Gratuite" : formatPrice(shipping)}
          </Text>
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: "#f3f4f6",
            marginBottom: 16,
          }}
        >
          <Text style={{ fontSize: 17, fontWeight: "700", color: "#1f2937" }}>
            Total
          </Text>
          <Text style={{ fontSize: 17, fontWeight: "700", color: "#f97316" }}>
            {formatPrice(total)}
          </Text>
        </View>
        <Pressable
          onPress={() => router.push("/payment")}
          style={{
            backgroundColor: "#f97316",
            borderRadius: 12,
            paddingVertical: 15,
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <Ionicons name="phone-portrait-outline" size={18} color="white" />
          <Text style={{ color: "white", fontSize: 16, fontWeight: "700" }}>
            Payer avec Mobile Money
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
