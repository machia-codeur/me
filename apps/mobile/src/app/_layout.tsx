import { Stack } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#ffffff" },
          headerTintColor: "#1f2937",
          headerTitleStyle: { fontWeight: "600" },
        }}
      >
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="product/[id]"
          options={{ title: "Détail Produit", headerBackTitle: "Retour" }}
        />
        <Stack.Screen
          name="payment"
          options={{ title: "Paiement", presentation: "modal" }}
        />
      </Stack>
    </QueryClientProvider>
  );
}
