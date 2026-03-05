import { useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { mobileMoneyProviders } from "@/lib/mock-data";

const OTP_LENGTH = 6;

export default function PaymentScreen() {
  const router = useRouter();
  const [step, setStep] = useState<"provider" | "phone" | "otp">("provider");
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const otpRefs = useRef<(TextInput | null)[]>([]);

  const provider = mobileMoneyProviders.find((p) => p.id === selectedProvider);

  const handleSelectProvider = (id: string) => {
    setSelectedProvider(id);
    setStep("phone");
  };

  const handleSubmitPhone = () => {
    if (phoneNumber.length < 8) {
      Alert.alert("Erreur", "Veuillez entrer un numéro valide");
      return;
    }
    setStep("otp");
  };

  const handleOtpChange = (text: string, index: number) => {
    if (text.length > 1) {
      // Handle paste
      const chars = text.slice(0, OTP_LENGTH).split("");
      const newOtp = [...otp];
      chars.forEach((char, i) => {
        if (index + i < OTP_LENGTH) newOtp[index + i] = char;
      });
      setOtp(newOtp);
      const nextIndex = Math.min(index + chars.length, OTP_LENGTH - 1);
      otpRefs.current[nextIndex]?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (key: string, index: number) => {
    if (key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleConfirmPayment = () => {
    const code = otp.join("");
    if (code.length < OTP_LENGTH) {
      Alert.alert("Erreur", "Veuillez entrer le code complet");
      return;
    }
    Alert.alert(
      "Paiement réussi !",
      "Votre paiement a été traité avec succès. Vous recevrez un SMS de confirmation.",
      [{ text: "OK", onPress: () => router.back() }]
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={{ flex: 1, backgroundColor: "#f9fafb" }}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      >
        {/* Progress Steps */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 32,
            gap: 8,
          }}
        >
          {["Opérateur", "Numéro", "Confirmation"].map((label, i) => {
            const stepIndex =
              step === "provider" ? 0 : step === "phone" ? 1 : 2;
            const active = i <= stepIndex;
            return (
              <View key={label} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: active ? "#f97316" : "#e5e7eb",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: active ? "white" : "#9ca3af",
                      fontSize: 12,
                      fontWeight: "700",
                    }}
                  >
                    {i + 1}
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "500",
                    color: active ? "#f97316" : "#9ca3af",
                  }}
                >
                  {label}
                </Text>
                {i < 2 && (
                  <View
                    style={{
                      width: 20,
                      height: 1,
                      backgroundColor: active ? "#f97316" : "#e5e7eb",
                    }}
                  />
                )}
              </View>
            );
          })}
        </View>

        {/* Step 1: Provider Selection */}
        {step === "provider" && (
          <View>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "700",
                color: "#1f2937",
                textAlign: "center",
                marginBottom: 8,
              }}
            >
              Choisir votre opérateur
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "#6b7280",
                textAlign: "center",
                marginBottom: 28,
              }}
            >
              Sélectionnez votre fournisseur Mobile Money
            </Text>

            <View style={{ gap: 12 }}>
              {mobileMoneyProviders.map((p) => (
                <Pressable
                  key={p.id}
                  onPress={() => handleSelectProvider(p.id)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "white",
                    padding: 18,
                    borderRadius: 14,
                    borderWidth: 2,
                    borderColor:
                      selectedProvider === p.id ? p.color : "#f3f4f6",
                    gap: 14,
                  }}
                >
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      backgroundColor: p.color + "20",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Ionicons
                      name="phone-portrait-outline"
                      size={24}
                      color={p.color}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "600",
                        color: "#1f2937",
                      }}
                    >
                      {p.name}
                    </Text>
                    <Text style={{ fontSize: 13, color: "#9ca3af", marginTop: 2 }}>
                      Préfixe: {p.prefix}
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color="#d1d5db"
                  />
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Step 2: Phone Number */}
        {step === "phone" && provider && (
          <View>
            <Pressable
              onPress={() => setStep("provider")}
              style={{ flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 20 }}
            >
              <Ionicons name="arrow-back" size={18} color="#6b7280" />
              <Text style={{ fontSize: 14, color: "#6b7280" }}>Retour</Text>
            </Pressable>

            <Text
              style={{
                fontSize: 20,
                fontWeight: "700",
                color: "#1f2937",
                textAlign: "center",
                marginBottom: 8,
              }}
            >
              Votre numéro {provider.name}
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "#6b7280",
                textAlign: "center",
                marginBottom: 28,
              }}
            >
              Entrez le numéro associé à votre compte
            </Text>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "white",
                borderRadius: 14,
                borderWidth: 2,
                borderColor: "#e5e7eb",
                paddingHorizontal: 16,
              }}
            >
              <Text
                style={{ fontSize: 16, fontWeight: "600", color: "#6b7280", marginRight: 8 }}
              >
                {provider.prefix}
              </Text>
              <View
                style={{ width: 1, height: 30, backgroundColor: "#e5e7eb", marginRight: 12 }}
              />
              <TextInput
                style={{ flex: 1, fontSize: 18, paddingVertical: 16, letterSpacing: 1 }}
                placeholder="XX XX XX XX XX"
                placeholderTextColor="#d1d5db"
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                maxLength={12}
              />
            </View>

            <Pressable
              onPress={handleSubmitPhone}
              style={{
                backgroundColor: "#f97316",
                borderRadius: 12,
                paddingVertical: 15,
                alignItems: "center",
                marginTop: 24,
              }}
            >
              <Text style={{ color: "white", fontSize: 16, fontWeight: "700" }}>
                Recevoir le code OTP
              </Text>
            </Pressable>
          </View>
        )}

        {/* Step 3: OTP */}
        {step === "otp" && provider && (
          <View>
            <Pressable
              onPress={() => setStep("phone")}
              style={{ flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 20 }}
            >
              <Ionicons name="arrow-back" size={18} color="#6b7280" />
              <Text style={{ fontSize: 14, color: "#6b7280" }}>Retour</Text>
            </Pressable>

            <Text
              style={{
                fontSize: 20,
                fontWeight: "700",
                color: "#1f2937",
                textAlign: "center",
                marginBottom: 8,
              }}
            >
              Code de confirmation
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "#6b7280",
                textAlign: "center",
                marginBottom: 8,
              }}
            >
              Entrez le code à 6 chiffres envoyé au
            </Text>
            <Text
              style={{
                fontSize: 15,
                fontWeight: "600",
                color: "#1f2937",
                textAlign: "center",
                marginBottom: 32,
              }}
            >
              {provider.prefix} {phoneNumber}
            </Text>

            {/* OTP Input - 6 cases */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                gap: 10,
                marginBottom: 24,
              }}
            >
              {Array.from({ length: OTP_LENGTH }).map((_, i) => (
                <TextInput
                  key={i}
                  ref={(ref) => {
                    otpRefs.current[i] = ref;
                  }}
                  style={{
                    width: 48,
                    height: 56,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: otp[i] ? "#f97316" : "#e5e7eb",
                    backgroundColor: otp[i] ? "#fff7ed" : "white",
                    textAlign: "center",
                    fontSize: 22,
                    fontWeight: "700",
                    color: "#1f2937",
                  }}
                  keyboardType="number-pad"
                  maxLength={1}
                  value={otp[i]}
                  onChangeText={(text) => handleOtpChange(text, i)}
                  onKeyPress={({ nativeEvent }) =>
                    handleOtpKeyPress(nativeEvent.key, i)
                  }
                />
              ))}
            </View>

            <Pressable
              onPress={handleConfirmPayment}
              style={{
                backgroundColor: "#f97316",
                borderRadius: 12,
                paddingVertical: 15,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "white", fontSize: 16, fontWeight: "700" }}>
                Confirmer le paiement
              </Text>
            </Pressable>

            <Pressable style={{ alignItems: "center", marginTop: 20 }}>
              <Text style={{ fontSize: 14, color: "#f97316", fontWeight: "600" }}>
                Renvoyer le code
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
