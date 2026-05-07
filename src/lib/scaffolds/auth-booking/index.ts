// Auth + Booking scaffold — appointment-based apps (salons, doctors, tutors, services)
export const AUTH_BOOKING_SCAFFOLD: Record<string, string> = {
  "app.json": `{ "expo": { "name": "KAAFI_SLOT_APP_NAME", "slug": "KAAFI_SLOT_APP_SLUG", "version": "1.0.0", "orientation": "portrait", "icon": "./assets/icon.png", "splash": { "backgroundColor": "KAAFI_SLOT_PRIMARY_COLOR" }, "ios": { "supportsTablet": false }, "android": { "adaptiveIcon": { "foregroundImage": "./assets/adaptive-icon.png" } } } }`,
  "package.json": `{ "name": "KAAFI_SLOT_APP_SLUG", "main": "expo-router/entry", "scripts": { "start": "expo start" }, "dependencies": { "expo": "~52.0.0", "expo-router": "~4.0.0", "react": "18.3.1", "react-native": "0.76.5", "nativewind": "^4.0.1", "tailwindcss": "^3.4.0", "@expo/vector-icons": "^14.0.0" } }`,
  "global.css": `@tailwind base;\n@tailwind components;\n@tailwind utilities;`,
  "tailwind.config.js": `module.exports = { content: ["./app/**/*.{js,jsx,ts,tsx}"], presets: [require("nativewind/preset")], theme: { extend: { colors: { primary: "KAAFI_SLOT_PRIMARY_COLOR" } } } };`,
  "babel.config.js": `module.exports = function(api) { api.cache(true); return { presets: [["babel-preset-expo", { jsxImportSource: "nativewind" }], "nativewind/babel"] }; };`,

  "app/_layout.tsx": `import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "../global.css";
export default function RootLayout() {
  return (<><StatusBar style="dark" /><Stack screenOptions={{ headerShown: false }}><Stack.Screen name="(auth)" /><Stack.Screen name="(tabs)" /></Stack></>);
}`,

  "app/(auth)/_layout.tsx": `import { Stack } from "expo-router";
export default function AuthLayout() { return <Stack screenOptions={{ headerShown: false }} />; }`,

  "app/(auth)/login.tsx": `import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
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
          <View className="w-14 h-14 rounded-2xl items-center justify-center mb-5" style={{ backgroundColor: "KAAFI_SLOT_PRIMARY_COLOR" }}>
            <Ionicons name="KAAFI_SLOT_APP_ICON" size={28} color="white" />
          </View>
          <Text className="text-3xl font-bold text-gray-900 mb-1">KAAFI_SLOT_APP_NAME</Text>
          <Text className="text-gray-500 text-base">KAAFI_SLOT_LOGIN_TAGLINE</Text>
        </View>
        <View className="gap-4">
          <TextInput value={email} onChangeText={setEmail} placeholder="Email" keyboardType="email-address" autoCapitalize="none" className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-base" />
          <TextInput value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-base" />
          <TouchableOpacity onPress={() => router.replace("/(tabs)")} className="py-4 rounded-xl items-center" style={{ backgroundColor: "KAAFI_SLOT_PRIMARY_COLOR" }}>
            <Text className="text-white font-semibold text-base">Sign in</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
            <Text className="text-center text-gray-500 text-sm">No account? <Text style={{ color: "KAAFI_SLOT_PRIMARY_COLOR" }} className="font-semibold">Sign up</Text></Text>
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
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 bg-white">
      <View className="flex-1 px-6 pt-16 pb-10">
        <Text className="text-3xl font-bold text-gray-900 mb-2">Join KAAFI_SLOT_APP_NAME</Text>
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

  "app/(tabs)/_layout.tsx": `import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: "KAAFI_SLOT_PRIMARY_COLOR", tabBarInactiveTintColor: "#94a3b8", tabBarStyle: { backgroundColor: "#fff", borderTopColor: "#f1f5f9" } }}>
      <Tabs.Screen name="index" options={{ title: "Services", tabBarIcon: ({ color, size }) => <Ionicons name="grid-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="bookings" options={{ title: "My Bookings", tabBarIcon: ({ color, size }) => <Ionicons name="calendar-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: "Profile", tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} /> }} />
    </Tabs>
  );
}`,

  "app/(tabs)/index.tsx": `// KAAFI_SLOT: Services / home screen — KAAFI_SLOT_APP_NAME
import { View, Text, ScrollView, TouchableOpacity, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { SAMPLE_SERVICES } from "../../data/seed";

export default function ServicesScreen() {
  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white px-5 pt-14 pb-4 border-b border-gray-100">
        <Text className="text-2xl font-bold text-gray-900 mb-1">KAAFI_SLOT_HEADER_TITLE</Text>
        <Text className="text-gray-500 text-sm mb-3">KAAFI_SLOT_HEADER_SUBTITLE</Text>
        <View className="flex-row items-center bg-gray-100 rounded-xl px-3 py-2.5 gap-2">
          <Ionicons name="search-outline" size={16} color="#94a3b8" />
          <TextInput placeholder="KAAFI_SLOT_SEARCH_PLACEHOLDER" className="flex-1 text-gray-900 text-sm" />
        </View>
      </View>
      <ScrollView className="flex-1">
        {/* Category chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-5 py-4">
          {["KAAFI_SLOT_CAT1","KAAFI_SLOT_CAT2","KAAFI_SLOT_CAT3","KAAFI_SLOT_CAT4"].map((cat, i) => (
            <TouchableOpacity key={cat} className="px-4 py-2 rounded-full mr-2"
              style={{ backgroundColor: i === 0 ? "KAAFI_SLOT_PRIMARY_COLOR" : "#f1f5f9" }}>
              <Text className="text-sm font-medium" style={{ color: i === 0 ? "#fff" : "#64748b" }}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View className="px-5 pb-8 gap-3">
          {SAMPLE_SERVICES.map((service) => (
            <TouchableOpacity key={service.id} onPress={() => router.push("/book")}
              className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <View className="flex-row items-start gap-3">
                <View className="w-14 h-14 rounded-2xl items-center justify-center"
                  style={{ backgroundColor: "KAAFI_SLOT_PRIMARY_COLOR" + "15" }}>
                  <Text style={{ fontSize: 26 }}>{service.emoji}</Text>
                </View>
                <View className="flex-1">
                  <Text className="font-bold text-gray-900 text-base">{service.name}</Text>
                  <Text className="text-gray-500 text-sm mt-0.5">{service.description}</Text>
                  <View className="flex-row items-center justify-between mt-2">
                    <View className="flex-row items-center gap-1">
                      <Ionicons name="star" size={13} color="#f59e0b" />
                      <Text className="text-xs text-gray-600 font-medium">{service.rating}</Text>
                      <Text className="text-xs text-gray-400 ml-1">{service.reviews} reviews</Text>
                    </View>
                    <Text className="font-bold" style={{ color: "KAAFI_SLOT_PRIMARY_COLOR" }}>{service.price}</Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity className="mt-3 py-2.5 rounded-xl items-center"
                style={{ backgroundColor: "KAAFI_SLOT_PRIMARY_COLOR" }}>
                <Text className="text-white font-semibold text-sm">KAAFI_SLOT_CTA_LABEL</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}`,

  "app/(tabs)/bookings.tsx": `import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SAMPLE_BOOKINGS } from "../../data/seed";

const STATUS_COLORS: Record<string, string> = { upcoming: "#7c3aed", completed: "#16a34a", cancelled: "#dc2626" };

export default function BookingsScreen() {
  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white px-5 pt-14 pb-4 border-b border-gray-100">
        <Text className="text-2xl font-bold text-gray-900">My Bookings</Text>
        <Text className="text-gray-500 text-sm mt-0.5">Your upcoming & past appointments</Text>
      </View>
      <ScrollView className="flex-1 px-4 pt-4">
        {SAMPLE_BOOKINGS.map((booking) => (
          <View key={booking.id} className="bg-white rounded-2xl p-4 mb-3 border border-gray-100 shadow-sm">
            <View className="flex-row items-start justify-between mb-3">
              <View className="flex-1">
                <Text className="font-bold text-gray-900 text-base">{booking.service}</Text>
                <Text className="text-gray-500 text-sm">{booking.provider}</Text>
              </View>
              <View className="px-2.5 py-1 rounded-full" style={{ backgroundColor: STATUS_COLORS[booking.status] + "18" }}>
                <Text className="text-xs font-semibold capitalize" style={{ color: STATUS_COLORS[booking.status] }}>{booking.status}</Text>
              </View>
            </View>
            <View className="flex-row items-center gap-4">
              <View className="flex-row items-center gap-1.5">
                <Ionicons name="calendar-outline" size={14} color="#94a3b8" />
                <Text className="text-gray-500 text-xs">{booking.date}</Text>
              </View>
              <View className="flex-row items-center gap-1.5">
                <Ionicons name="time-outline" size={14} color="#94a3b8" />
                <Text className="text-gray-500 text-xs">{booking.time}</Text>
              </View>
              <View className="flex-1" />
              <Text className="font-bold" style={{ color: "KAAFI_SLOT_PRIMARY_COLOR" }}>{booking.price}</Text>
            </View>
            {booking.status === "upcoming" && (
              <View className="flex-row gap-2 mt-3">
                <TouchableOpacity className="flex-1 py-2 rounded-lg border items-center" style={{ borderColor: "KAAFI_SLOT_PRIMARY_COLOR" }}>
                  <Text className="text-xs font-semibold" style={{ color: "KAAFI_SLOT_PRIMARY_COLOR" }}>Reschedule</Text>
                </TouchableOpacity>
                <TouchableOpacity className="flex-1 py-2 rounded-lg border border-red-200 items-center">
                  <Text className="text-xs font-semibold text-red-500">Cancel</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
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
      <View className="px-5 py-4">
        {menu.map((item, i) => (
          <TouchableOpacity key={i} className="flex-row items-center py-4 border-b border-gray-100">
            <View className="w-9 h-9 rounded-xl items-center justify-center mr-3" style={{ backgroundColor: "KAAFI_SLOT_PRIMARY_COLOR" + "12" }}>
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

  "data/seed.ts": `export const SAMPLE_SERVICES = [
  { id: "1", name: "KAAFI_SLOT_ITEM1_TITLE", description: "KAAFI_SLOT_ITEM1_SUBTITLE", emoji: "KAAFI_SLOT_ITEM1_EMOJI", rating: "4.9", reviews: "128", price: "KAAFI_SLOT_ITEM1_META" },
  { id: "2", name: "KAAFI_SLOT_ITEM2_TITLE", description: "KAAFI_SLOT_ITEM2_SUBTITLE", emoji: "KAAFI_SLOT_ITEM2_EMOJI", rating: "4.7", reviews: "89", price: "KAAFI_SLOT_ITEM2_META" },
  { id: "3", name: "KAAFI_SLOT_ITEM3_TITLE", description: "KAAFI_SLOT_ITEM3_SUBTITLE", emoji: "KAAFI_SLOT_ITEM3_EMOJI", rating: "4.8", reviews: "203", price: "KAAFI_SLOT_ITEM3_META" },
  { id: "4", name: "KAAFI_SLOT_ITEM4_TITLE", description: "KAAFI_SLOT_ITEM4_SUBTITLE", emoji: "KAAFI_SLOT_ITEM4_EMOJI", rating: "4.6", reviews: "56", price: "KAAFI_SLOT_ITEM4_META" },
];
export const SAMPLE_BOOKINGS = [
  { id: "1", service: "KAAFI_SLOT_ITEM1_TITLE", provider: "KAAFI_SLOT_PROVIDER1", date: "Tomorrow", time: "10:00 AM", price: "KAAFI_SLOT_ITEM1_META", status: "upcoming" },
  { id: "2", service: "KAAFI_SLOT_ITEM2_TITLE", provider: "KAAFI_SLOT_PROVIDER2", date: "Last Monday", time: "2:30 PM", price: "KAAFI_SLOT_ITEM2_META", status: "completed" },
  { id: "3", service: "KAAFI_SLOT_ITEM3_TITLE", provider: "KAAFI_SLOT_PROVIDER3", date: "Last Friday", time: "4:00 PM", price: "KAAFI_SLOT_ITEM3_META", status: "cancelled" },
];`,
};
