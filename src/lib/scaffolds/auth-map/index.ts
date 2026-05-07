// Auth + Map scaffold — location-based apps (delivery, gig, services marketplace)
export const AUTH_MAP_SCAFFOLD: Record<string, string> = {
  "app.json": `{
  "expo": {
    "name": "KAAFI_SLOT_APP_NAME",
    "slug": "KAAFI_SLOT_APP_SLUG",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": { "backgroundColor": "KAAFI_SLOT_PRIMARY_COLOR" },
    "ios": { "supportsTablet": false, "infoPlist": { "NSLocationWhenInUseUsageDescription": "We need your location to show nearby KAAFI_SLOT_ITEM_TYPE." } },
    "android": { "adaptiveIcon": { "foregroundImage": "./assets/adaptive-icon.png" }, "permissions": ["ACCESS_FINE_LOCATION"] }
  }
}`,

  "package.json": `{
  "name": "KAAFI_SLOT_APP_SLUG",
  "version": "1.0.0",
  "main": "expo-router/entry",
  "scripts": { "start": "expo start", "android": "expo start --android", "ios": "expo start --ios" },
  "dependencies": {
    "expo": "~52.0.0",
    "expo-router": "~4.0.0",
    "expo-location": "~18.0.0",
    "react": "18.3.1",
    "react-native": "0.76.5",
    "react-native-maps": "1.18.0",
    "nativewind": "^4.0.1",
    "tailwindcss": "^3.4.0",
    "@expo/vector-icons": "^14.0.0"
  }
}`,

  "app/_layout.tsx": `import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "../global.css";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}`,

  "app/(auth)/login.tsx": `// KAAFI_SLOT: Login — App: KAAFI_SLOT_APP_NAME | Vibe: KAAFI_SLOT_VIBE
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 bg-white">
      <View className="flex-1 px-6 pt-16 pb-10 justify-between">
        <View>
          <View className="w-14 h-14 rounded-2xl items-center justify-center mb-5"
            style={{ backgroundColor: "KAAFI_SLOT_PRIMARY_COLOR" }}>
            <Ionicons name="KAAFI_SLOT_APP_ICON" size={28} color="white" />
          </View>
          <Text className="text-3xl font-bold text-gray-900 mb-1">KAAFI_SLOT_APP_NAME</Text>
          <Text className="text-gray-500 text-base">KAAFI_SLOT_LOGIN_TAGLINE</Text>
        </View>
        <View className="gap-4">
          <TextInput value={email} onChangeText={setEmail} placeholder="Email"
            keyboardType="email-address" autoCapitalize="none"
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-base" />
          <TextInput value={password} onChangeText={setPassword} placeholder="Password"
            secureTextEntry className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-base" />
          <TouchableOpacity onPress={() => router.replace("/(tabs)")}
            className="py-4 rounded-xl items-center" style={{ backgroundColor: "KAAFI_SLOT_PRIMARY_COLOR" }}>
            <Text className="text-white font-semibold text-base">Sign in</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
            <Text className="text-center text-gray-500 text-sm">
              New here? <Text style={{ color: "KAAFI_SLOT_PRIMARY_COLOR" }} className="font-semibold">Create account</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}`,

  "app/(auth)/signup.tsx": `import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { useState } from "react";
import { router } from "expo-router";

export default function SignupScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 bg-white">
      <View className="flex-1 px-6 pt-16 pb-10">
        <Text className="text-3xl font-bold text-gray-900 mb-2">Create account</Text>
        <Text className="text-gray-500 mb-8">KAAFI_SLOT_SIGNUP_TAGLINE</Text>
        <View className="gap-4">
          <TextInput value={name} onChangeText={setName} placeholder="Full name"
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-base" />
          <TextInput value={email} onChangeText={setEmail} placeholder="Email"
            keyboardType="email-address" autoCapitalize="none"
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-base" />
          <TextInput value={password} onChangeText={setPassword} placeholder="Password"
            secureTextEntry className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-base" />
          <TouchableOpacity onPress={() => router.replace("/(tabs)")}
            className="py-4 rounded-xl items-center" style={{ backgroundColor: "KAAFI_SLOT_PRIMARY_COLOR" }}>
            <Text className="text-white font-semibold text-base">Create account</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-center text-gray-500 text-sm">
              Already have an account? <Text style={{ color: "KAAFI_SLOT_PRIMARY_COLOR" }} className="font-semibold">Sign in</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}`,

  "app/(auth)/_layout.tsx": `import { Stack } from "expo-router";
export default function AuthLayout() { return <Stack screenOptions={{ headerShown: false }} />; }`,

  "app/(tabs)/_layout.tsx": `import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: "KAAFI_SLOT_PRIMARY_COLOR",
      tabBarInactiveTintColor: "#94a3b8",
      tabBarStyle: { backgroundColor: "#fff", borderTopColor: "#f1f5f9" },
    }}>
      <Tabs.Screen name="index" options={{
        title: "Map",
        tabBarIcon: ({ color, size }) => <Ionicons name="map-outline" size={size} color={color} />,
      }} />
      <Tabs.Screen name="list" options={{
        title: "KAAFI_SLOT_LIST_LABEL",
        tabBarIcon: ({ color, size }) => <Ionicons name="list-outline" size={size} color={color} />,
      }} />
      <Tabs.Screen name="profile" options={{
        title: "Profile",
        tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
      }} />
    </Tabs>
  );
}`,

  "app/(tabs)/index.tsx": `// KAAFI_SLOT: Map screen — KAAFI_SLOT_APP_NAME
// Shows nearby KAAFI_SLOT_ITEM_TYPE on an interactive map
import { View, Text, TouchableOpacity, ScrollView, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { SAMPLE_DATA } from "../../data/seed";

export default function MapScreen() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-5 pt-14 pb-4 border-b border-gray-100">
        <View className="flex-row items-center justify-between mb-3">
          <View>
            <Text className="text-gray-500 text-sm">KAAFI_SLOT_LOCATION_LABEL</Text>
            <Text className="text-xl font-bold text-gray-900">KAAFI_SLOT_HEADER_TITLE</Text>
          </View>
          <View className="w-9 h-9 rounded-full items-center justify-center"
            style={{ backgroundColor: "KAAFI_SLOT_PRIMARY_COLOR" + "18" }}>
            <Ionicons name="location-outline" size={18} color="KAAFI_SLOT_PRIMARY_COLOR" />
          </View>
        </View>
        <View className="flex-row items-center bg-gray-100 rounded-xl px-3 py-2.5 gap-2">
          <Ionicons name="search-outline" size={16} color="#94a3b8" />
          <TextInput placeholder="KAAFI_SLOT_SEARCH_PLACEHOLDER" className="flex-1 text-gray-900 text-sm" />
        </View>
      </View>

      {/* Map placeholder */}
      <View className="h-56 items-center justify-center relative"
        style={{ backgroundColor: "#e8f4f8" }}>
        <Ionicons name="map" size={48} color="#94a3b8" />
        <Text className="text-gray-400 text-sm mt-2">Map view — KAAFI_SLOT_MAP_LABEL</Text>
        {/* Marker pins */}
        {SAMPLE_DATA.slice(0, 3).map((item, i) => (
          <TouchableOpacity key={item.id} onPress={() => setSelected(item.id)}
            className="absolute w-8 h-8 rounded-full items-center justify-center shadow-sm"
            style={{
              backgroundColor: selected === item.id ? "KAAFI_SLOT_PRIMARY_COLOR" : "white",
              top: 40 + i * 40, left: 60 + i * 70,
              borderWidth: 2, borderColor: "KAAFI_SLOT_PRIMARY_COLOR"
            }}>
            <Text style={{ fontSize: 14 }}>{item.emoji}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Nearby list */}
      <ScrollView className="flex-1 px-4 pt-4">
        <Text className="text-base font-semibold text-gray-900 mb-3">KAAFI_SLOT_NEARBY_LABEL</Text>
        {SAMPLE_DATA.map((item) => (
          <TouchableOpacity key={item.id}
            onPress={() => setSelected(item.id)}
            className="bg-white rounded-2xl p-4 mb-3 border shadow-sm"
            style={{ borderColor: selected === item.id ? "KAAFI_SLOT_PRIMARY_COLOR" : "#f1f5f9" }}>
            <View className="flex-row items-center gap-3">
              <View className="w-12 h-12 rounded-xl items-center justify-center"
                style={{ backgroundColor: "KAAFI_SLOT_PRIMARY_COLOR" + "15" }}>
                <Text style={{ fontSize: 22 }}>{item.emoji}</Text>
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-gray-900">{item.title}</Text>
                <Text className="text-gray-500 text-sm" numberOfLines={1}>{item.subtitle}</Text>
                <View className="flex-row items-center gap-2 mt-1">
                  <Ionicons name="location-outline" size={11} color="#94a3b8" />
                  <Text className="text-xs text-gray-400">{item.meta}</Text>
                  <Text className="text-xs text-gray-300">•</Text>
                  <Ionicons name="star" size={11} color="#f59e0b" />
                  <Text className="text-xs text-gray-500">{item.rating}</Text>
                </View>
              </View>
              <TouchableOpacity className="px-3 py-1.5 rounded-lg"
                style={{ backgroundColor: "KAAFI_SLOT_PRIMARY_COLOR" }}>
                <Text className="text-white text-xs font-semibold">KAAFI_SLOT_CTA_LABEL</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}`,

  "app/(tabs)/list.tsx": `import { View, Text, ScrollView, TouchableOpacity, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SAMPLE_DATA } from "../../data/seed";

export default function ListScreen() {
  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white px-5 pt-14 pb-4 border-b border-gray-100">
        <Text className="text-xl font-bold text-gray-900 mb-3">KAAFI_SLOT_LIST_LABEL</Text>
        <View className="flex-row items-center bg-gray-100 rounded-xl px-3 py-2.5 gap-2">
          <Ionicons name="funnel-outline" size={15} color="#94a3b8" />
          <TextInput placeholder="Filter KAAFI_SLOT_ITEM_TYPE..." className="flex-1 text-gray-900 text-sm" />
        </View>
      </View>
      <ScrollView className="flex-1 px-4 pt-4">
        {SAMPLE_DATA.map((item) => (
          <TouchableOpacity key={item.id}
            className="bg-white rounded-2xl p-4 mb-3 border border-gray-100 shadow-sm">
            <View className="flex-row items-center gap-3">
              <View className="w-12 h-12 rounded-xl items-center justify-center"
                style={{ backgroundColor: "KAAFI_SLOT_PRIMARY_COLOR" + "15" }}>
                <Text style={{ fontSize: 22 }}>{item.emoji}</Text>
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-gray-900">{item.title}</Text>
                <Text className="text-gray-500 text-sm">{item.subtitle}</Text>
                <Text className="text-xs text-gray-400 mt-0.5">{item.meta}</Text>
              </View>
              <View className="items-end gap-1">
                <View className="flex-row items-center gap-1">
                  <Ionicons name="star" size={12} color="#f59e0b" />
                  <Text className="text-xs font-semibold text-gray-700">{item.rating}</Text>
                </View>
                <TouchableOpacity className="px-3 py-1.5 rounded-lg"
                  style={{ backgroundColor: "KAAFI_SLOT_PRIMARY_COLOR" }}>
                  <Text className="text-white text-xs font-semibold">KAAFI_SLOT_CTA_LABEL</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}`,

  "app/(tabs)/profile.tsx": `import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ProfileScreen() {
  const menuItems = [
    { label: "KAAFI_SLOT_MENU1", icon: "KAAFI_SLOT_MENU1_ICON" },
    { label: "KAAFI_SLOT_MENU2", icon: "KAAFI_SLOT_MENU2_ICON" },
    { label: "KAAFI_SLOT_MENU3", icon: "KAAFI_SLOT_MENU3_ICON" },
    { label: "Settings", icon: "settings-outline" },
    { label: "Sign out", icon: "log-out-outline" },
  ];
  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="bg-white px-5 pt-14 pb-6 items-center border-b border-gray-100">
        <View className="w-20 h-20 rounded-full items-center justify-center mb-3"
          style={{ backgroundColor: "KAAFI_SLOT_PRIMARY_COLOR" }}>
          <Text className="text-3xl">👤</Text>
        </View>
        <Text className="text-xl font-bold text-gray-900">KAAFI_SLOT_PROFILE_NAME</Text>
        <Text className="text-gray-500 text-sm">KAAFI_SLOT_PROFILE_META</Text>
      </View>
      <View className="px-5 py-4">
        {menuItems.map((item, i) => (
          <TouchableOpacity key={i} className="flex-row items-center py-4 border-b border-gray-100">
            <View className="w-9 h-9 rounded-xl items-center justify-center mr-3"
              style={{ backgroundColor: "KAAFI_SLOT_PRIMARY_COLOR" + "12" }}>
              <Ionicons name={item.icon as any} size={18} color="KAAFI_SLOT_PRIMARY_COLOR" />
            </View>
            <Text className="flex-1 text-gray-800 font-medium">{item.label}</Text>
            <Ionicons name="chevron-forward" size={16} color="#cbd5e1" />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}`,

  "data/seed.ts": `export const SAMPLE_DATA = [
  { id: "1", title: "KAAFI_SLOT_ITEM1_TITLE", subtitle: "KAAFI_SLOT_ITEM1_SUBTITLE", emoji: "KAAFI_SLOT_ITEM1_EMOJI", rating: "4.9", meta: "KAAFI_SLOT_ITEM1_META" },
  { id: "2", title: "KAAFI_SLOT_ITEM2_TITLE", subtitle: "KAAFI_SLOT_ITEM2_SUBTITLE", emoji: "KAAFI_SLOT_ITEM2_EMOJI", rating: "4.7", meta: "KAAFI_SLOT_ITEM2_META" },
  { id: "3", title: "KAAFI_SLOT_ITEM3_TITLE", subtitle: "KAAFI_SLOT_ITEM3_SUBTITLE", emoji: "KAAFI_SLOT_ITEM3_EMOJI", rating: "4.8", meta: "KAAFI_SLOT_ITEM3_META" },
  { id: "4", title: "KAAFI_SLOT_ITEM4_TITLE", subtitle: "KAAFI_SLOT_ITEM4_SUBTITLE", emoji: "KAAFI_SLOT_ITEM4_EMOJI", rating: "4.6", meta: "KAAFI_SLOT_ITEM4_META" },
  { id: "5", title: "KAAFI_SLOT_ITEM5_TITLE", subtitle: "KAAFI_SLOT_ITEM5_SUBTITLE", emoji: "KAAFI_SLOT_ITEM5_EMOJI", rating: "5.0", meta: "KAAFI_SLOT_ITEM5_META" },
];`,
  "global.css": `@tailwind base;\n@tailwind components;\n@tailwind utilities;`,
  "tailwind.config.js": `module.exports = { content: ["./app/**/*.{js,jsx,ts,tsx}"], presets: [require("nativewind/preset")], theme: { extend: { colors: { primary: "KAAFI_SLOT_PRIMARY_COLOR" } } } };`,
  "babel.config.js": `module.exports = function(api) { api.cache(true); return { presets: [["babel-preset-expo", { jsxImportSource: "nativewind" }], "nativewind/babel"] }; };`,
};
