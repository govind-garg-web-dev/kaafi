// Auth + Chat scaffold — messaging, community, support apps
export const AUTH_CHAT_SCAFFOLD: Record<string, string> = {
  "app.json": `{ "expo": { "name": "KAAFI_SLOT_APP_NAME", "slug": "KAAFI_SLOT_APP_SLUG", "version": "1.0.0", "orientation": "portrait", "icon": "./assets/icon.png", "splash": { "backgroundColor": "KAAFI_SLOT_PRIMARY_COLOR" } } }`,
  "package.json": `{ "name": "KAAFI_SLOT_APP_SLUG", "main": "expo-router/entry", "scripts": { "start": "expo start" }, "dependencies": { "expo": "~52.0.0", "expo-router": "~4.0.0", "react": "18.3.1", "react-native": "0.76.5", "nativewind": "^4.0.1", "tailwindcss": "^3.4.0", "@expo/vector-icons": "^14.0.0" } }`,
  "global.css": `@tailwind base;\n@tailwind components;\n@tailwind utilities;`,
  "tailwind.config.js": `module.exports = { content: ["./app/**/*.{js,jsx,ts,tsx}"], presets: [require("nativewind/preset")], theme: { extend: { colors: { primary: "KAAFI_SLOT_PRIMARY_COLOR" } } } };`,
  "babel.config.js": `module.exports = function(api) { api.cache(true); return { presets: [["babel-preset-expo", { jsxImportSource: "nativewind" }], "nativewind/babel"] }; };`,
  "app/_layout.tsx": `import { Stack } from "expo-router"; import { StatusBar } from "expo-status-bar"; import "../global.css";
export default function RootLayout() { return (<><StatusBar style="dark" /><Stack screenOptions={{ headerShown: false }}><Stack.Screen name="(auth)" /><Stack.Screen name="(tabs)" /><Stack.Screen name="chat/[id]" /></Stack></>); }`,
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
          <TouchableOpacity onPress={() => router.push("/(auth)/signup")}><Text className="text-center text-gray-500 text-sm">New here? <Text style={{ color: "KAAFI_SLOT_PRIMARY_COLOR" }} className="font-semibold">Join now</Text></Text></TouchableOpacity>
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
        <Text className="text-3xl font-bold text-gray-900 mb-2">Join the community</Text>
        <Text className="text-gray-500 mb-8">KAAFI_SLOT_SIGNUP_TAGLINE</Text>
        <View className="gap-4">
          <TextInput value={name} onChangeText={setName} placeholder="Display name" className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-base" />
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

  "app/(tabs)/_layout.tsx": `import { Tabs } from "expo-router"; import { Ionicons } from "@expo/vector-icons";
export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: "KAAFI_SLOT_PRIMARY_COLOR", tabBarInactiveTintColor: "#94a3b8", tabBarStyle: { backgroundColor: "#fff", borderTopColor: "#f1f5f9" } }}>
      <Tabs.Screen name="index" options={{ title: "Chats", tabBarIcon: ({ color, size }) => <Ionicons name="chatbubbles-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="explore" options={{ title: "KAAFI_SLOT_TAB2_LABEL", tabBarIcon: ({ color, size }) => <Ionicons name="KAAFI_SLOT_TAB2_ICON" size={size} color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: "Profile", tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} /> }} />
    </Tabs>
  );
}`,

  "app/(tabs)/index.tsx": `// KAAFI_SLOT: Conversations list — KAAFI_SLOT_APP_NAME
import { View, Text, ScrollView, TouchableOpacity, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { SAMPLE_CONVERSATIONS } from "../../data/seed";

export default function ChatsScreen() {
  return (
    <View className="flex-1 bg-white">
      <View className="px-5 pt-14 pb-3 border-b border-gray-100">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-2xl font-bold text-gray-900">KAAFI_SLOT_HEADER_TITLE</Text>
          <TouchableOpacity className="w-9 h-9 rounded-full items-center justify-center" style={{ backgroundColor: "KAAFI_SLOT_PRIMARY_COLOR" }}>
            <Ionicons name="create-outline" size={18} color="white" />
          </TouchableOpacity>
        </View>
        <View className="flex-row items-center bg-gray-100 rounded-xl px-3 py-2.5 gap-2">
          <Ionicons name="search-outline" size={15} color="#94a3b8" />
          <TextInput placeholder="KAAFI_SLOT_SEARCH_PLACEHOLDER" className="flex-1 text-gray-900 text-sm" />
        </View>
      </View>
      <ScrollView className="flex-1">
        {SAMPLE_CONVERSATIONS.map((conv) => (
          <TouchableOpacity key={conv.id} onPress={() => router.push(\`/chat/\${conv.id}\`)}
            className="flex-row items-center px-5 py-4 border-b border-gray-50 active:bg-gray-50">
            <View className="w-12 h-12 rounded-full items-center justify-center mr-3" style={{ backgroundColor: "KAAFI_SLOT_PRIMARY_COLOR" + "20" }}>
              <Text style={{ fontSize: 22 }}>{conv.avatar}</Text>
            </View>
            <View className="flex-1 min-w-0">
              <View className="flex-row items-center justify-between mb-0.5">
                <Text className="font-semibold text-gray-900">{conv.name}</Text>
                <Text className="text-xs text-gray-400">{conv.time}</Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-gray-500 text-sm flex-1 mr-2" numberOfLines={1}>{conv.lastMessage}</Text>
                {conv.unread > 0 && (
                  <View className="w-5 h-5 rounded-full items-center justify-center" style={{ backgroundColor: "KAAFI_SLOT_PRIMARY_COLOR" }}>
                    <Text className="text-white text-xs font-bold">{conv.unread}</Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}`,

  "app/chat/[id].tsx": `// KAAFI_SLOT: Chat screen — message bubbles
import { View, Text, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SAMPLE_MESSAGES } from "../../data/seed";

export default function ChatScreen() {
  const { id } = useLocalSearchParams();
  const [text, setText] = useState("");
  const [messages, setMessages] = useState(SAMPLE_MESSAGES);
  const send = () => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { id: Date.now().toString(), text: text.trim(), mine: true, time: "now" }]);
    setText("");
  };
  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 bg-gray-50">
      <View className="bg-white px-4 pt-14 pb-3 border-b border-gray-100 flex-row items-center gap-3">
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={22} color="#374151" /></TouchableOpacity>
        <View className="w-9 h-9 rounded-full items-center justify-center" style={{ backgroundColor: "KAAFI_SLOT_PRIMARY_COLOR" + "20" }}>
          <Text style={{ fontSize: 18 }}>KAAFI_SLOT_ITEM1_EMOJI</Text>
        </View>
        <View className="flex-1">
          <Text className="font-semibold text-gray-900">KAAFI_SLOT_ITEM1_TITLE</Text>
          <Text className="text-xs text-green-500">Online</Text>
        </View>
      </View>
      <ScrollView className="flex-1 px-4 py-4">
        {messages.map((msg) => (
          <View key={msg.id} className={\`mb-3 \${msg.mine ? "items-end" : "items-start"}\`}>
            <View className="px-4 py-2.5 rounded-2xl max-w-[75%]"
              style={{ backgroundColor: msg.mine ? "KAAFI_SLOT_PRIMARY_COLOR" : "white", borderWidth: msg.mine ? 0 : 1, borderColor: "#f1f5f9" }}>
              <Text style={{ color: msg.mine ? "white" : "#374151" }} className="text-sm leading-relaxed">{msg.text}</Text>
            </View>
            <Text className="text-xs text-gray-400 mt-1 px-1">{msg.time}</Text>
          </View>
        ))}
      </ScrollView>
      <View className="bg-white px-4 py-3 border-t border-gray-100 flex-row items-end gap-2">
        <TextInput value={text} onChangeText={setText} placeholder="KAAFI_SLOT_MESSAGE_PLACEHOLDER"
          multiline className="flex-1 bg-gray-100 rounded-2xl px-4 py-2.5 text-gray-900 text-sm max-h-24" />
        <TouchableOpacity onPress={send} className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: text.trim() ? "KAAFI_SLOT_PRIMARY_COLOR" : "#e2e8f0" }}>
          <Ionicons name="send" size={16} color={text.trim() ? "white" : "#94a3b8"} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}`,

  "app/(tabs)/explore.tsx": `import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
export default function ExploreScreen() {
  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white px-5 pt-14 pb-4 border-b border-gray-100">
        <Text className="text-2xl font-bold text-gray-900">KAAFI_SLOT_TAB2_LABEL</Text>
        <Text className="text-gray-500 text-sm">KAAFI_SLOT_EXPLORE_SUBTITLE</Text>
      </View>
      <ScrollView className="flex-1 px-5 pt-5">
        <Text className="text-gray-400 text-sm text-center mt-16" style={{ fontStyle: "italic" }}>KAAFI_SLOT_EXPLORE_EMPTY_STATE</Text>
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
      <View className="px-5 py-4">{menu.map((item, i) => (<TouchableOpacity key={i} className="flex-row items-center py-4 border-b border-gray-100"><View className="w-9 h-9 rounded-xl items-center justify-center mr-3" style={{ backgroundColor: "KAAFI_SLOT_PRIMARY_COLOR" + "12" }}><Ionicons name={item.icon as any} size={18} color="KAAFI_SLOT_PRIMARY_COLOR" /></View><Text className="flex-1 text-gray-800 font-medium">{item.label}</Text><Ionicons name="chevron-forward" size={16} color="#cbd5e1" /></TouchableOpacity>))}</View>
    </ScrollView>
  );
}`,

  "data/seed.ts": `export const SAMPLE_CONVERSATIONS = [
  { id: "1", name: "KAAFI_SLOT_ITEM1_TITLE", lastMessage: "KAAFI_SLOT_ITEM1_SUBTITLE", avatar: "KAAFI_SLOT_ITEM1_EMOJI", time: "2m ago", unread: 3 },
  { id: "2", name: "KAAFI_SLOT_ITEM2_TITLE", lastMessage: "KAAFI_SLOT_ITEM2_SUBTITLE", avatar: "KAAFI_SLOT_ITEM2_EMOJI", time: "1h ago", unread: 0 },
  { id: "3", name: "KAAFI_SLOT_ITEM3_TITLE", lastMessage: "KAAFI_SLOT_ITEM3_SUBTITLE", avatar: "KAAFI_SLOT_ITEM3_EMOJI", time: "Yesterday", unread: 1 },
  { id: "4", name: "KAAFI_SLOT_ITEM4_TITLE", lastMessage: "KAAFI_SLOT_ITEM4_SUBTITLE", avatar: "KAAFI_SLOT_ITEM4_EMOJI", time: "2d ago", unread: 0 },
];
export const SAMPLE_MESSAGES = [
  { id: "1", text: "KAAFI_SLOT_MSG1", mine: false, time: "10:00 AM" },
  { id: "2", text: "KAAFI_SLOT_MSG2", mine: true, time: "10:01 AM" },
  { id: "3", text: "KAAFI_SLOT_MSG3", mine: false, time: "10:02 AM" },
  { id: "4", text: "KAAFI_SLOT_MSG4", mine: true, time: "10:03 AM" },
];`,
};
