import { View, Text, ScrollView, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const menuSections = [
  {
    title: "Mon compte",
    items: [
      { icon: "person-outline", label: "Informations personnelles" },
      { icon: "location-outline", label: "Adresses de livraison" },
      { icon: "card-outline", label: "Moyens de paiement" },
    ],
  },
  {
    title: "Mes achats",
    items: [
      { icon: "receipt-outline", label: "Historique des commandes" },
      { icon: "heart-outline", label: "Liste de souhaits" },
      { icon: "star-outline", label: "Mes avis" },
    ],
  },
  {
    title: "Paramètres",
    items: [
      { icon: "notifications-outline", label: "Notifications" },
      { icon: "language-outline", label: "Langue" },
      { icon: "help-circle-outline", label: "Aide & Support" },
      { icon: "document-text-outline", label: "Conditions générales" },
    ],
  },
];

export default function ProfileScreen() {
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#f9fafb" }}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* Profile Header */}
      <View
        style={{
          backgroundColor: "white",
          alignItems: "center",
          paddingVertical: 32,
          borderBottomWidth: 1,
          borderBottomColor: "#f3f4f6",
        }}
      >
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: "#f97316",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <Text style={{ color: "white", fontSize: 28, fontWeight: "700" }}>
            MK
          </Text>
        </View>
        <Text style={{ fontSize: 20, fontWeight: "700", color: "#1f2937" }}>
          Machiavel KOUAME
        </Text>
        <Text style={{ fontSize: 14, color: "#6b7280", marginTop: 4 }}>
          popoin61@gmail.com
        </Text>
        <Pressable
          style={{
            marginTop: 16,
            borderWidth: 1.5,
            borderColor: "#f97316",
            borderRadius: 20,
            paddingHorizontal: 20,
            paddingVertical: 8,
          }}
        >
          <Text style={{ color: "#f97316", fontSize: 14, fontWeight: "600" }}>
            Modifier le profil
          </Text>
        </Pressable>
      </View>

      {/* Stats */}
      <View
        style={{
          flexDirection: "row",
          backgroundColor: "white",
          marginTop: 12,
          marginHorizontal: 16,
          borderRadius: 12,
          padding: 16,
          borderWidth: 1,
          borderColor: "#f3f4f6",
        }}
      >
        {[
          { value: "12", label: "Commandes" },
          { value: "3", label: "En cours" },
          { value: "2", label: "Avis" },
        ].map((stat, i) => (
          <View
            key={stat.label}
            style={{
              flex: 1,
              alignItems: "center",
              borderLeftWidth: i > 0 ? 1 : 0,
              borderLeftColor: "#f3f4f6",
            }}
          >
            <Text style={{ fontSize: 22, fontWeight: "700", color: "#f97316" }}>
              {stat.value}
            </Text>
            <Text style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
              {stat.label}
            </Text>
          </View>
        ))}
      </View>

      {/* Menu Sections */}
      {menuSections.map((section) => (
        <View key={section.title} style={{ marginTop: 24 }}>
          <Text
            style={{
              fontSize: 13,
              fontWeight: "600",
              color: "#9ca3af",
              textTransform: "uppercase",
              letterSpacing: 0.5,
              paddingHorizontal: 20,
              marginBottom: 8,
            }}
          >
            {section.title}
          </Text>
          <View
            style={{
              backgroundColor: "white",
              marginHorizontal: 16,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#f3f4f6",
              overflow: "hidden",
            }}
          >
            {section.items.map((item, i) => (
              <Pressable
                key={item.label}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  borderTopWidth: i > 0 ? 1 : 0,
                  borderTopColor: "#f3f4f6",
                  gap: 14,
                }}
              >
                <Ionicons
                  name={item.icon as any}
                  size={20}
                  color="#6b7280"
                />
                <Text
                  style={{ flex: 1, fontSize: 15, color: "#374151", fontWeight: "500" }}
                >
                  {item.label}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color="#d1d5db"
                />
              </Pressable>
            ))}
          </View>
        </View>
      ))}

      {/* Logout */}
      <Pressable
        style={{
          marginTop: 28,
          marginHorizontal: 16,
          backgroundColor: "white",
          borderRadius: 12,
          borderWidth: 1,
          borderColor: "#fecaca",
          paddingVertical: 14,
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          gap: 8,
        }}
      >
        <Ionicons name="log-out-outline" size={20} color="#ef4444" />
        <Text style={{ fontSize: 15, fontWeight: "600", color: "#ef4444" }}>
          Se déconnecter
        </Text>
      </Pressable>
    </ScrollView>
  );
}
