// Auth + eCommerce scaffold — product catalog, cart, checkout
export const AUTH_ECOMMERCE_SCAFFOLD: Record<string, string> = {
  "app.json": `{ "expo": { "name": "KAAFI_SLOT_APP_NAME", "slug": "KAAFI_SLOT_APP_SLUG", "version": "1.0.0", "orientation": "portrait", "icon": "./assets/icon.png", "splash": { "backgroundColor": "KAAFI_SLOT_PRIMARY_COLOR" } } }`,
  "package.json": `{ "name": "KAAFI_SLOT_APP_SLUG", "main": "expo-router/entry", "scripts": { "start": "expo start" }, "dependencies": { "expo": "~52.0.0", "expo-router": "~4.0.0", "react": "18.3.1", "react-native": "0.76.5", "nativewind": "^4.0.1", "tailwindcss": "^3.4.0", "@expo/vector-icons": "^14.0.0" } }`,
  "global.css": `@tailwind base;\n@tailwind components;\n@tailwind utilities;`,
  "tailwind.config.js": `module.exports = { content: ["./app/**/*.{js,jsx,ts,tsx}"], presets: [require("nativewind/preset")], theme: { extend: { colors: { primary: "KAAFI_SLOT_PRIMARY_COLOR" } } } };`,
  "babel.config.js": `module.exports = function(api) { api.cache(true); return { presets: [["babel-preset-expo", { jsxImportSource: "nativewind" }], "nativewind/babel"] }; };`,
  "app/_layout.tsx": `import { Stack } from "expo-router"; import { StatusBar } from "expo-status-bar"; import "../global.css";
export default function RootLayout() { return (<><StatusBar style="dark" /><Stack screenOptions={{ headerShown: false }}><Stack.Screen name="(auth)" /><Stack.Screen name="(tabs)" /></Stack></>); }`,
  "app/(auth)/_layout.tsx": `import { Stack } from "expo-router"; export default function AuthLayout() { return <Stack screenOptions={{ headerShown: false }} />; }`,

  "app/(auth)/login.tsx": `import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { useState } from "react"; import { router } from "expo-router"; import { Ionicons } from "@expo/vector-icons";
export default function LoginScreen() {
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 bg-white">
      <View className="flex-1 px-6 pt-16 pb-10 justify-between">
        <View>
          <View className="w-14 h-14 rounded-2xl items-center justify-center mb-5" style={{ backgroundColor: "KAAFI_SLOT_PRIMARY_COLOR" }}>
            <Ionicons name="KAAFI_SLOT_APP_ICON" size={28} color="white" />
          </View>
          <Text className="text-3xl font-bold text-gray-900 mb-1">KAAFI_SLOT_APP_NAME</Text>
          <Text className="text-gray-500">KAAFI_SLOT_LOGIN_TAGLINE</Text>
        </View>
        <View className="gap-4">
          <TextInput value={email} onChangeText={setEmail} placeholder="Email" keyboardType="email-address" autoCapitalize="none" className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-base" />
          <TextInput value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-base" />
          <TouchableOpacity onPress={() => router.replace("/(tabs)")} className="py-4 rounded-xl items-center" style={{ backgroundColor: "KAAFI_SLOT_PRIMARY_COLOR" }}>
            <Text className="text-white font-semibold text-base">Sign in</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
            <Text className="text-center text-gray-500 text-sm">New here? <Text style={{ color: "KAAFI_SLOT_PRIMARY_COLOR" }} className="font-semibold">Create account</Text></Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}`,

  "app/(auth)/signup.tsx": `import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { useState } from "react"; import { router } from "expo-router";
export default function SignupScreen() {
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 bg-white">
      <View className="flex-1 px-6 pt-16 pb-10">
        <Text className="text-3xl font-bold text-gray-900 mb-2">Create account</Text>
        <Text className="text-gray-500 mb-8">KAAFI_SLOT_SIGNUP_TAGLINE</Text>
        <View className="gap-4">
          <TextInput value={name} onChangeText={setName} placeholder="Full name" className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-base" />
          <TextInput value={email} onChangeText={setEmail} placeholder="Email" keyboardType="email-address" autoCapitalize="none" className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-base" />
          <TextInput value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-base" />
          <TouchableOpacity onPress={() => router.replace("/(tabs)")} className="py-4 rounded-xl items-center" style={{ backgroundColor: "KAAFI_SLOT_PRIMARY_COLOR" }}>
            <Text className="text-white font-semibold text-base">Create account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}`,

  "app/(tabs)/_layout.tsx": `import { Tabs } from "expo-router"; import { Ionicons } from "@expo/vector-icons"; import { useCartStore } from "../../store/cart";
export default function TabLayout() {
  const count = useCartStore((s) => s.items.length);
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: "KAAFI_SLOT_PRIMARY_COLOR", tabBarInactiveTintColor: "#94a3b8", tabBarStyle: { backgroundColor: "#fff", borderTopColor: "#f1f5f9" } }}>
      <Tabs.Screen name="index" options={{ title: "Shop", tabBarIcon: ({ color, size }) => <Ionicons name="storefront-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="cart" options={{ title: "Cart", tabBarBadge: count > 0 ? count : undefined, tabBarIcon: ({ color, size }) => <Ionicons name="cart-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: "Profile", tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} /> }} />
    </Tabs>
  );
}`,

  "store/cart.ts": `import { create } from "zustand";
type CartItem = { id: string; name: string; price: string; emoji: string; qty: number };
type CartStore = { items: CartItem[]; add: (item: Omit<CartItem,"qty">) => void; remove: (id: string) => void; clear: () => void };
export const useCartStore = create<CartStore>((set) => ({
  items: [],
  add: (item) => set((s) => {
    const existing = s.items.find((i) => i.id === item.id);
    if (existing) return { items: s.items.map((i) => i.id === item.id ? { ...i, qty: i.qty + 1 } : i) };
    return { items: [...s.items, { ...item, qty: 1 }] };
  }),
  remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
  clear: () => set({ items: [] }),
}));`,

  "app/(tabs)/index.tsx": `// KAAFI_SLOT: Shop / product catalog — KAAFI_SLOT_APP_NAME
import { View, Text, ScrollView, TouchableOpacity, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCartStore } from "../../store/cart";
import { SAMPLE_PRODUCTS } from "../../data/seed";

export default function ShopScreen() {
  const addToCart = useCartStore((s) => s.add);
  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white px-5 pt-14 pb-4 border-b border-gray-100">
        <Text className="text-2xl font-bold text-gray-900 mb-1">KAAFI_SLOT_HEADER_TITLE</Text>
        <Text className="text-gray-500 text-sm mb-3">KAAFI_SLOT_HEADER_SUBTITLE</Text>
        <View className="flex-row items-center bg-gray-100 rounded-xl px-3 py-2.5 gap-2">
          <Ionicons name="search-outline" size={16} color="#94a3b8" />
          <TextInput placeholder="KAAFI_SLOT_SEARCH_PLACEHOLDER" className="flex-1 text-sm text-gray-900" />
        </View>
      </View>
      <ScrollView className="flex-1">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-5 py-4">
          {["KAAFI_SLOT_CAT1","KAAFI_SLOT_CAT2","KAAFI_SLOT_CAT3","KAAFI_SLOT_CAT4"].map((cat, i) => (
            <TouchableOpacity key={cat} className="px-4 py-2 rounded-full mr-2" style={{ backgroundColor: i === 0 ? "KAAFI_SLOT_PRIMARY_COLOR" : "#f1f5f9" }}>
              <Text className="text-sm font-medium" style={{ color: i === 0 ? "#fff" : "#64748b" }}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View className="px-4 pb-8 flex-row flex-wrap gap-3">
          {SAMPLE_PRODUCTS.map((product) => (
            <View key={product.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden" style={{ width: "47%" }}>
              <View className="h-28 items-center justify-center" style={{ backgroundColor: "KAAFI_SLOT_PRIMARY_COLOR" + "12" }}>
                <Text style={{ fontSize: 42 }}>{product.emoji}</Text>
              </View>
              <View className="p-3">
                <Text className="font-semibold text-gray-900 text-sm" numberOfLines={1}>{product.name}</Text>
                <Text className="text-gray-400 text-xs mt-0.5" numberOfLines={1}>{product.description}</Text>
                <View className="flex-row items-center justify-between mt-2">
                  <Text className="font-bold text-base" style={{ color: "KAAFI_SLOT_PRIMARY_COLOR" }}>{product.price}</Text>
                  <TouchableOpacity onPress={() => addToCart({ id: product.id, name: product.name, price: product.price, emoji: product.emoji })}
                    className="w-8 h-8 rounded-xl items-center justify-center" style={{ backgroundColor: "KAAFI_SLOT_PRIMARY_COLOR" }}>
                    <Ionicons name="add" size={18} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}`,

  "app/(tabs)/cart.tsx": `import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCartStore } from "../../store/cart";

export default function CartScreen() {
  const { items, remove, clear } = useCartStore();
  const total = items.reduce((sum, i) => sum + parseFloat(i.price.replace(/[^0-9.]/g, "")) * i.qty, 0);
  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white px-5 pt-14 pb-4 border-b border-gray-100 flex-row items-center justify-between">
        <Text className="text-2xl font-bold text-gray-900">My Cart</Text>
        {items.length > 0 && <TouchableOpacity onPress={clear}><Text className="text-red-400 text-sm">Clear all</Text></TouchableOpacity>}
      </View>
      {items.length === 0 ? (
        <View className="flex-1 items-center justify-center"><Ionicons name="cart-outline" size={64} color="#cbd5e1" /><Text className="text-gray-400 mt-4 text-base">Your cart is empty</Text></View>
      ) : (
        <>
          <ScrollView className="flex-1 px-4 pt-4">
            {items.map((item) => (
              <View key={item.id} className="bg-white rounded-2xl p-4 mb-3 border border-gray-100 flex-row items-center gap-3">
                <View className="w-14 h-14 rounded-xl items-center justify-center" style={{ backgroundColor: "KAAFI_SLOT_PRIMARY_COLOR" + "15" }}>
                  <Text style={{ fontSize: 28 }}>{item.emoji}</Text>
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-gray-900">{item.name}</Text>
                  <Text style={{ color: "KAAFI_SLOT_PRIMARY_COLOR" }} className="font-bold mt-0.5">{item.price} × {item.qty}</Text>
                </View>
                <TouchableOpacity onPress={() => remove(item.id)}><Ionicons name="trash-outline" size={18} color="#f87171" /></TouchableOpacity>
              </View>
            ))}
          </ScrollView>
          <View className="bg-white px-5 py-4 border-t border-gray-100">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-gray-600 font-medium">Total</Text>
              <Text className="text-xl font-bold text-gray-900">KAAFI_SLOT_CURRENCY_SYMBOL}{total.toFixed(0)}</Text>
            </View>
            <TouchableOpacity className="py-4 rounded-xl items-center" style={{ backgroundColor: "KAAFI_SLOT_PRIMARY_COLOR" }}>
              <Text className="text-white font-bold text-base">KAAFI_SLOT_CHECKOUT_LABEL</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}`,

  "app/(tabs)/profile.tsx": `import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
export default function ProfileScreen() {
  const menu = [{ label: "KAAFI_SLOT_MENU1", icon: "KAAFI_SLOT_MENU1_ICON" }, { label: "KAAFI_SLOT_MENU2", icon: "KAAFI_SLOT_MENU2_ICON" }, { label: "KAAFI_SLOT_MENU3", icon: "KAAFI_SLOT_MENU3_ICON" }, { label: "Settings", icon: "settings-outline" }, { label: "Sign out", icon: "log-out-outline" }];
  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="bg-white px-5 pt-14 pb-6 items-center border-b border-gray-100">
        <View className="w-20 h-20 rounded-full items-center justify-center mb-3" style={{ backgroundColor: "KAAFI_SLOT_PRIMARY_COLOR" }}><Text className="text-3xl">👤</Text></View>
        <Text className="text-xl font-bold text-gray-900">KAAFI_SLOT_PROFILE_NAME</Text>
        <Text className="text-gray-500 text-sm">KAAFI_SLOT_PROFILE_META</Text>
      </View>
      <View className="px-5 py-4">{menu.map((item, i) => (<TouchableOpacity key={i} className="flex-row items-center py-4 border-b border-gray-100"><View className="w-9 h-9 rounded-xl items-center justify-center mr-3" style={{ backgroundColor: "KAAFI_SLOT_PRIMARY_COLOR" + "12" }}><Ionicons name={item.icon as any} size={18} color="KAAFI_SLOT_PRIMARY_COLOR" /></View><Text className="flex-1 text-gray-800 font-medium">{item.label}</Text><Ionicons name="chevron-forward" size={16} color="#cbd5e1" /></TouchableOpacity>))}</View>
    </ScrollView>
  );
}`,

  "data/seed.ts": `export const SAMPLE_PRODUCTS = [
  { id: "1", name: "KAAFI_SLOT_ITEM1_TITLE", description: "KAAFI_SLOT_ITEM1_SUBTITLE", emoji: "KAAFI_SLOT_ITEM1_EMOJI", price: "KAAFI_SLOT_ITEM1_META" },
  { id: "2", name: "KAAFI_SLOT_ITEM2_TITLE", description: "KAAFI_SLOT_ITEM2_SUBTITLE", emoji: "KAAFI_SLOT_ITEM2_EMOJI", price: "KAAFI_SLOT_ITEM2_META" },
  { id: "3", name: "KAAFI_SLOT_ITEM3_TITLE", description: "KAAFI_SLOT_ITEM3_SUBTITLE", emoji: "KAAFI_SLOT_ITEM3_EMOJI", price: "KAAFI_SLOT_ITEM3_META" },
  { id: "4", name: "KAAFI_SLOT_ITEM4_TITLE", description: "KAAFI_SLOT_ITEM4_SUBTITLE", emoji: "KAAFI_SLOT_ITEM4_EMOJI", price: "KAAFI_SLOT_ITEM4_META" },
  { id: "5", name: "KAAFI_SLOT_ITEM5_TITLE", description: "KAAFI_SLOT_ITEM5_SUBTITLE", emoji: "KAAFI_SLOT_ITEM5_EMOJI", price: "KAAFI_SLOT_ITEM5_META" },
];`,
};
