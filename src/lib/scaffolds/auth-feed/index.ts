// Auth + Feed scaffold — covers ~30% of app prompts
// KAAFI_SLOT markers tell the AI exactly what to replace

export const AUTH_FEED_SCAFFOLD: Record<string, string> = {
  "app.json": `{
  "expo": {
    "name": "KAAFI_SLOT_APP_NAME",
    "slug": "KAAFI_SLOT_APP_SLUG",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": { "backgroundColor": "KAAFI_SLOT_PRIMARY_COLOR" },
    "ios": { "supportsTablet": false },
    "android": { "adaptiveIcon": { "foregroundImage": "./assets/adaptive-icon.png" } }
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
    "react": "18.3.1",
    "react-native": "0.76.5",
    "nativewind": "^4.0.1",
    "tailwindcss": "^3.4.0",
    "@expo/vector-icons": "^14.0.0",
    "expo-status-bar": "~2.0.0"
  }
}`,

  "tailwind.config.js": `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "KAAFI_SLOT_PRIMARY_COLOR",
        accent: "KAAFI_SLOT_ACCENT_COLOR",
      }
    }
  }
};`,

  "babel.config.js": `module.exports = function(api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel"
    ]
  };
};`,

  "app/_layout.tsx": `import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "../global.css";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}`,

  "app/(auth)/_layout.tsx": `import { Stack } from "expo-router";

export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}`,

  "app/(auth)/login.tsx": `// KAAFI_SLOT: Login screen
// App: KAAFI_SLOT_APP_NAME
// Auth method: KAAFI_SLOT_AUTH_METHOD
// Vibe: KAAFI_SLOT_VIBE
// Primary color: KAAFI_SLOT_PRIMARY_COLOR

import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    // KAAFI_SLOT: Replace with real auth logic
    router.replace("/(tabs)");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <View className="flex-1 px-6 pt-20 pb-10 justify-between">
        {/* Header */}
        <View>
          {/* KAAFI_SLOT: Replace with real logo/icon */}
          <View className="w-16 h-16 rounded-2xl items-center justify-center mb-6"
            style={{ backgroundColor: "KAAFI_SLOT_PRIMARY_COLOR" }}>
            <Ionicons name="KAAFI_SLOT_APP_ICON" size={30} color="white" />
          </View>
          <Text className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back
          </Text>
          <Text className="text-gray-500 text-base">
            KAAFI_SLOT_LOGIN_TAGLINE
          </Text>
        </View>

        {/* Form */}
        <View className="gap-4">
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-1.5">Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 text-base"
            />
          </View>
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-1.5">Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 text-base"
            />
          </View>

          <TouchableOpacity
            onPress={handleLogin}
            className="py-4 rounded-xl items-center mt-2"
            style={{ backgroundColor: "KAAFI_SLOT_PRIMARY_COLOR" }}
          >
            <Text className="text-white font-semibold text-base">Sign in</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
            <Text className="text-center text-gray-500 text-sm">
              Don&apos;t have an account?{" "}
              <Text style={{ color: "KAAFI_SLOT_PRIMARY_COLOR" }} className="font-semibold">
                Sign up
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}`,

  "app/(auth)/signup.tsx": `// KAAFI_SLOT: Signup screen — mirrors login.tsx structure
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
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
          <TextInput value={name} onChangeText={setName} placeholder="Your name"
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-base" />
          <TextInput value={email} onChangeText={setEmail} placeholder="Email"
            keyboardType="email-address" autoCapitalize="none"
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-base" />
          <TextInput value={password} onChangeText={setPassword} placeholder="Password (min 8 chars)"
            secureTextEntry className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-base" />
          <TouchableOpacity onPress={() => router.replace("/(tabs)")}
            className="py-4 rounded-xl items-center mt-2" style={{ backgroundColor: "KAAFI_SLOT_PRIMARY_COLOR" }}>
            <Text className="text-white font-semibold text-base">Create account</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-center text-gray-500 text-sm">
              Already have an account?{" "}
              <Text style={{ color: "KAAFI_SLOT_PRIMARY_COLOR" }} className="font-semibold">Sign in</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}`,

  "app/(tabs)/_layout.tsx": `import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

// KAAFI_SLOT: Tab configuration — icon names and labels from app context
export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: "KAAFI_SLOT_PRIMARY_COLOR",
      tabBarInactiveTintColor: "#94a3b8",
      tabBarStyle: { backgroundColor: "#fff", borderTopColor: "#f1f5f9" },
    }}>
      <Tabs.Screen name="index" options={{
        title: "KAAFI_SLOT_TAB1_LABEL",
        tabBarIcon: ({ color, size }) => <Ionicons name="KAAFI_SLOT_TAB1_ICON" size={size} color={color} />,
      }} />
      <Tabs.Screen name="explore" options={{
        title: "KAAFI_SLOT_TAB2_LABEL",
        tabBarIcon: ({ color, size }) => <Ionicons name="KAAFI_SLOT_TAB2_ICON" size={size} color={color} />,
      }} />
      <Tabs.Screen name="profile" options={{
        title: "Profile",
        tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
      }} />
    </Tabs>
  );
}`,

  "app/(tabs)/index.tsx": `// KAAFI_SLOT: Home / feed screen
// App context: KAAFI_SLOT_APP_NAME — KAAFI_SLOT_APP_DESCRIPTION
// Feed item type: KAAFI_SLOT_FEED_ITEM_TYPE
// Primary color: KAAFI_SLOT_PRIMARY_COLOR

import { View, Text, ScrollView, TouchableOpacity, Image, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { SAMPLE_DATA } from "../../data/seed";

export default function HomeScreen() {
  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-5 pt-14 pb-4 border-b border-gray-100">
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-gray-500 text-sm">KAAFI_SLOT_GREETING</Text>
            <Text className="text-xl font-bold text-gray-900">KAAFI_SLOT_HEADER_TITLE</Text>
          </View>
          <TouchableOpacity className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: "KAAFI_SLOT_PRIMARY_COLOR" + "18" }}>
            <Ionicons name="notifications-outline" size={20} color="KAAFI_SLOT_PRIMARY_COLOR" />
          </TouchableOpacity>
        </View>
        {/* Search */}
        <View className="flex-row items-center bg-gray-100 rounded-xl px-3 py-2.5 gap-2">
          <Ionicons name="search-outline" size={18} color="#94a3b8" />
          <TextInput placeholder="KAAFI_SLOT_SEARCH_PLACEHOLDER" className="flex-1 text-gray-900 text-sm" />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {/* Category chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-5 py-4">
          {/* KAAFI_SLOT: Category chips relevant to app */}
          {["KAAFI_SLOT_CAT1", "KAAFI_SLOT_CAT2", "KAAFI_SLOT_CAT3", "KAAFI_SLOT_CAT4"].map((cat, i) => (
            <TouchableOpacity key={cat}
              className="px-4 py-2 rounded-full mr-2"
              style={{ backgroundColor: i === 0 ? "KAAFI_SLOT_PRIMARY_COLOR" : "#f1f5f9" }}>
              <Text className="text-sm font-medium" style={{ color: i === 0 ? "#fff" : "#64748b" }}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Feed */}
        <View className="px-5 pb-8">
          <Text className="text-base font-semibold text-gray-900 mb-3">KAAFI_SLOT_FEED_TITLE</Text>
          <View className="gap-3">
            {SAMPLE_DATA.map((item) => (
              <TouchableOpacity key={item.id} onPress={() => router.push(\`/detail/\${item.id}\`)}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                {/* KAAFI_SLOT: Card layout based on feed item type */}
                <View className="p-4">
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1 mr-3">
                      <Text className="font-semibold text-gray-900 text-base mb-1">{item.title}</Text>
                      <Text className="text-gray-500 text-sm" numberOfLines={2}>{item.subtitle}</Text>
                    </View>
                    {/* KAAFI_SLOT: Badge or thumbnail */}
                    <View className="w-12 h-12 rounded-xl items-center justify-center"
                      style={{ backgroundColor: "KAAFI_SLOT_PRIMARY_COLOR" + "15" }}>
                      <Text className="text-2xl">{item.emoji}</Text>
                    </View>
                  </View>
                  <View className="flex-row items-center mt-3 gap-3">
                    <View className="flex-row items-center gap-1">
                      <Ionicons name="star" size={13} color="#f59e0b" />
                      <Text className="text-xs text-gray-500">{item.rating}</Text>
                    </View>
                    <Text className="text-xs text-gray-300">•</Text>
                    <Text className="text-xs text-gray-500">{item.meta}</Text>
                    <View className="flex-1" />
                    <TouchableOpacity className="px-3 py-1.5 rounded-lg"
                      style={{ backgroundColor: "KAAFI_SLOT_PRIMARY_COLOR" }}>
                      <Text className="text-white text-xs font-semibold">KAAFI_SLOT_CTA_LABEL</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}`,

  "app/(tabs)/explore.tsx": `// KAAFI_SLOT: Explore / discovery screen
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ExploreScreen() {
  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white px-5 pt-14 pb-4 border-b border-gray-100">
        <Text className="text-xl font-bold text-gray-900">KAAFI_SLOT_TAB2_LABEL</Text>
        <Text className="text-gray-500 text-sm mt-0.5">KAAFI_SLOT_EXPLORE_SUBTITLE</Text>
      </View>
      <ScrollView className="flex-1 px-5 pt-5">
        {/* KAAFI_SLOT: Explore content specific to app domain */}
        <Text className="text-gray-400 text-sm text-center mt-20" style={{ fontStyle: "italic" }}>
          KAAFI_SLOT_EXPLORE_EMPTY_STATE
        </Text>
      </ScrollView>
    </View>
  );
}`,

  "app/(tabs)/profile.tsx": `// KAAFI_SLOT: User profile screen
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const MENU_ITEMS = [
  // KAAFI_SLOT: Menu items relevant to app
  { label: "KAAFI_SLOT_MENU1", icon: "KAAFI_SLOT_MENU1_ICON" },
  { label: "KAAFI_SLOT_MENU2", icon: "KAAFI_SLOT_MENU2_ICON" },
  { label: "KAAFI_SLOT_MENU3", icon: "KAAFI_SLOT_MENU3_ICON" },
  { label: "Settings", icon: "settings-outline" },
  { label: "Sign out", icon: "log-out-outline" },
];

export default function ProfileScreen() {
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
        {MENU_ITEMS.map((item, i) => (
          <TouchableOpacity key={i}
            className="flex-row items-center py-4 border-b border-gray-100"
            onPress={() => {}}>
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

  "data/seed.ts": `// KAAFI_SLOT: Sample data — replace with real data types and realistic values for this app
export const SAMPLE_DATA = [
  { id: "1", title: "KAAFI_SLOT_ITEM1_TITLE", subtitle: "KAAFI_SLOT_ITEM1_SUBTITLE", emoji: "KAAFI_SLOT_ITEM1_EMOJI", rating: "4.9", meta: "KAAFI_SLOT_ITEM1_META" },
  { id: "2", title: "KAAFI_SLOT_ITEM2_TITLE", subtitle: "KAAFI_SLOT_ITEM2_SUBTITLE", emoji: "KAAFI_SLOT_ITEM2_EMOJI", rating: "4.7", meta: "KAAFI_SLOT_ITEM2_META" },
  { id: "3", title: "KAAFI_SLOT_ITEM3_TITLE", subtitle: "KAAFI_SLOT_ITEM3_SUBTITLE", emoji: "KAAFI_SLOT_ITEM3_EMOJI", rating: "4.8", meta: "KAAFI_SLOT_ITEM3_META" },
  { id: "4", title: "KAAFI_SLOT_ITEM4_TITLE", subtitle: "KAAFI_SLOT_ITEM4_SUBTITLE", emoji: "KAAFI_SLOT_ITEM4_EMOJI", rating: "4.6", meta: "KAAFI_SLOT_ITEM4_META" },
  { id: "5", title: "KAAFI_SLOT_ITEM5_TITLE", subtitle: "KAAFI_SLOT_ITEM5_SUBTITLE", emoji: "KAAFI_SLOT_ITEM5_EMOJI", rating: "5.0", meta: "KAAFI_SLOT_ITEM5_META" },
];`,

  "global.css": `@tailwind base;
@tailwind components;
@tailwind utilities;`,

  "README.md": `# KAAFI_SLOT_APP_NAME

Built with [Kaafi](https://kaafi.app) — AI-powered native mobile app builder.

## Getting started

\`\`\`bash
npm install
npx expo start
\`\`\`

## Stack
- React Native + Expo SDK 52
- Expo Router v4 (file-based navigation)
- NativeWind (Tailwind for React Native)
`,
};
