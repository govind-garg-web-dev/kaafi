import type { PreviewData } from "@/lib/preview-parser";

// Generates a Snack-compatible App.js for each template type.
// Uses only react-native core + @expo/vector-icons — no NativeWind, no Expo Router.
// Tabs implemented with useState for maximum Snack compatibility.

function hex2rgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function itemsToJs(items: PreviewData["items"]) {
  return JSON.stringify(
    items.map((i) => ({
      id: i.id,
      title: i.title,
      subtitle: i.subtitle,
      emoji: i.emoji,
      meta: i.meta,
    })),
    null,
    2
  );
}

// ── Feed template ────────────────────────────────────────
function generateFeedApp(d: PreviewData): string {
  const p = d.primaryColor;
  const items = itemsToJs(d.items);
  return `import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, StyleSheet, SafeAreaView, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PRIMARY = '${p}';
const APP_NAME = '${d.appName}';
const ITEMS = ${items};

function HomeTab() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>${d.headerTitle || d.appName}</Text>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={16} color="#94a3b8" />
          <Text style={styles.searchPlaceholder}>${d.searchPlaceholder}</Text>
        </View>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        <View style={{ padding: 16, gap: 12 }}>
          {ITEMS.map(item => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardRow}>
                <View style={[styles.emoji, { backgroundColor: PRIMARY + '22' }]}>
                  <Text style={{ fontSize: 22 }}>{item.emoji}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardSubtitle} numberOfLines={1}>{item.subtitle}</Text>
                  <View style={styles.cardFooter}>
                    <Ionicons name="star" size={12} color="#f59e0b" />
                    <Text style={styles.cardMeta}>{item.meta}</Text>
                  </View>
                </View>
                <TouchableOpacity style={[styles.cta, { backgroundColor: PRIMARY }]}>
                  <Text style={styles.ctaText}>${d.ctaLabel}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ExploreTab() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore</Text>
      </View>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name="search-circle-outline" size={64} color="#e2e8f0" />
        <Text style={{ color: '#94a3b8', marginTop: 12 }}>Discover more</Text>
      </View>
    </SafeAreaView>
  );
}

function ProfileTab() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>
      <View style={{ flex: 1, alignItems: 'center', paddingTop: 40 }}>
        <View style={[styles.avatar, { backgroundColor: PRIMARY }]}>
          <Text style={{ fontSize: 32 }}>👤</Text>
        </View>
        <Text style={[styles.headerTitle, { marginTop: 12 }]}>Your Name</Text>
        <Text style={{ color: '#94a3b8', marginTop: 4 }}>Member since 2025</Text>
        {['My Activity', 'Settings', 'Help', 'Sign out'].map(item => (
          <TouchableOpacity key={item} style={styles.menuItem}>
            <Text style={styles.menuText}>{item}</Text>
            <Ionicons name="chevron-forward" size={16} color="#cbd5e1" />
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const TABS = [
  { key: 'home',    label: 'Home',    icon: 'home-outline',   comp: HomeTab },
  { key: 'explore', label: 'Explore', icon: 'search-outline', comp: ExploreTab },
  { key: 'profile', label: 'Profile', icon: 'person-outline', comp: ProfileTab },
];

export default function App() {
  const [tab, setTab] = useState('home');
  const Active = TABS.find(t => t.key === tab)?.comp ?? HomeTab;
  return (
    <View style={{ flex: 1 }}>
      <Active />
      <View style={styles.tabBar}>
        {TABS.map(t => (
          <TouchableOpacity key={t.key} style={styles.tabItem} onPress={() => setTab(t.key)}>
            <Ionicons name={t.icon} size={22} color={tab === t.key ? PRIMARY : '#94a3b8'} />
            <Text style={[styles.tabLabel, { color: tab === t.key ? PRIMARY : '#94a3b8' }]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { backgroundColor: '#fff', padding: 16, paddingTop: 8, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 10 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: 12, padding: 10, gap: 8 },
  searchPlaceholder: { color: '#94a3b8', fontSize: 13 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 14, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  cardRow: { flexDirection: 'row', alignItems: 'center' },
  emoji: { width: 46, height: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 13, fontWeight: '700', color: '#111827' },
  cardSubtitle: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 3 },
  cardMeta: { fontSize: 11, color: '#6b7280' },
  cta: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
  ctaText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  tabBar: { flexDirection: 'row', backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingBottom: 4 },
  tabItem: { flex: 1, alignItems: 'center', paddingTop: 8, gap: 2 },
  tabLabel: { fontSize: 10, fontWeight: '500' },
  avatar: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  menuItem: { flexDirection: 'row', alignItems: 'center', width: '90%', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', justifyContent: 'space-between' },
  menuText: { fontSize: 15, color: '#374151', fontWeight: '500' },
});`;
}

// ── Booking template ─────────────────────────────────────
function generateBookingApp(d: PreviewData): string {
  const p = d.primaryColor;
  const items = itemsToJs(d.items);
  return `import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PRIMARY = '${p}';
const SERVICES = ${items};

function ServicesTab() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>${d.headerTitle || d.appName}</Text>
        <Text style={{ color: '#94a3b8', fontSize: 13 }}>Book your appointment</Text>
      </View>
      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: 16, gap: 14 }}>
          {SERVICES.map(s => (
            <View key={s.id} style={styles.card}>
              <View style={styles.row}>
                <View style={[styles.icon, { backgroundColor: PRIMARY + '18' }]}>
                  <Text style={{ fontSize: 24 }}>{s.emoji}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.title}>{s.title}</Text>
                  <Text style={styles.sub}>{s.subtitle}</Text>
                  <View style={styles.footer}>
                    <Text style={[styles.price, { color: PRIMARY }]}>{s.meta}</Text>
                    <TouchableOpacity
                      style={[styles.btn, { backgroundColor: PRIMARY }]}
                      onPress={() => Alert.alert('Booking', \`Book \${s.title}?\\nWe will confirm shortly.\`)}>
                      <Text style={styles.btnText}>${d.ctaLabel}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function BookingsTab() {
  const statuses = ['upcoming', 'completed', 'cancelled'];
  const colors = { upcoming: PRIMARY, completed: '#16a34a', cancelled: '#dc2626' };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}><Text style={styles.headerTitle}>My Bookings</Text></View>
      <ScrollView style={{ flex: 1, padding: 16 }}>
        {SERVICES.slice(0, 3).map((s, i) => (
          <View key={s.id} style={[styles.card, { marginBottom: 12 }]}>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{s.title}</Text>
                <Text style={styles.sub}>{i === 0 ? 'Tomorrow · 10:00 AM' : i === 1 ? 'Last Monday · 2:30 PM' : 'Last Friday · 4:00 PM'}</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: colors[statuses[i]] + '18' }]}>
                <Text style={[styles.badgeText, { color: colors[statuses[i]] }]}>{statuses[i]}</Text>
              </View>
            </View>
            <Text style={[styles.price, { color: PRIMARY, marginTop: 8 }]}>{s.meta}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function ProfileTab() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}><Text style={styles.headerTitle}>Profile</Text></View>
      <View style={{ flex: 1, alignItems: 'center', paddingTop: 32 }}>
        <View style={[styles.avatar, { backgroundColor: PRIMARY }]}><Text style={{ fontSize: 32 }}>👤</Text></View>
        <Text style={[styles.title, { marginTop: 12, fontSize: 18 }]}>Your Name</Text>
        {['My Reviews', 'Saved Services', 'Settings', 'Sign out'].map(item => (
          <TouchableOpacity key={item} style={styles.menuItem}>
            <Text style={styles.menuText}>{item}</Text>
            <Ionicons name="chevron-forward" size={16} color="#cbd5e1" />
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const TABS = [
  { key: 'services', label: 'Services', icon: 'grid-outline', comp: ServicesTab },
  { key: 'bookings', label: 'Bookings', icon: 'calendar-outline', comp: BookingsTab },
  { key: 'profile',  label: 'Profile',  icon: 'person-outline', comp: ProfileTab },
];

export default function App() {
  const [tab, setTab] = useState('services');
  const Active = TABS.find(t => t.key === tab)?.comp ?? ServicesTab;
  return (
    <View style={{ flex: 1 }}>
      <Active />
      <View style={styles.tabBar}>
        {TABS.map(t => (
          <TouchableOpacity key={t.key} style={styles.tabItem} onPress={() => setTab(t.key)}>
            <Ionicons name={t.icon} size={22} color={tab === t.key ? PRIMARY : '#94a3b8'} />
            <Text style={[styles.tabLabel, { color: tab === t.key ? PRIMARY : '#94a3b8' }]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { backgroundColor: '#fff', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 2 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 14, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  row: { flexDirection: 'row', alignItems: 'center' },
  icon: { width: 50, height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 14, fontWeight: '700', color: '#111827' },
  sub: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  price: { fontSize: 15, fontWeight: '700' },
  btn: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  btnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  badge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  tabBar: { flexDirection: 'row', backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingBottom: 4 },
  tabItem: { flex: 1, alignItems: 'center', paddingTop: 8, gap: 2 },
  tabLabel: { fontSize: 10, fontWeight: '500' },
  avatar: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  menuItem: { flexDirection: 'row', alignItems: 'center', width: '90%', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', justifyContent: 'space-between' },
  menuText: { fontSize: 15, color: '#374151', fontWeight: '500' },
});`;
}

// ── eCommerce template ───────────────────────────────────
function generateEcommerceApp(d: PreviewData): string {
  const p = d.primaryColor;
  const items = itemsToJs(d.items);
  return `import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PRIMARY = '${p}';
const PRODUCTS = ${items};

function ShopTab({ cart, setCart }) {
  const addToCart = (p) => setCart(c => [...c, p]);
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>${d.headerTitle || d.appName}</Text>
        <Text style={{ color: '#94a3b8', fontSize: 13 }}>${d.searchPlaceholder}</Text>
      </View>
      <ScrollView style={{ flex: 1 }}>
        <View style={styles.grid}>
          {PRODUCTS.map(p => (
            <View key={p.id} style={styles.productCard}>
              <View style={[styles.productImg, { backgroundColor: PRIMARY + '15' }]}>
                <Text style={{ fontSize: 40 }}>{p.emoji}</Text>
              </View>
              <View style={{ padding: 10 }}>
                <Text style={styles.productName} numberOfLines={1}>{p.title}</Text>
                <Text style={styles.productDesc} numberOfLines={1}>{p.subtitle}</Text>
                <View style={styles.productFooter}>
                  <Text style={[styles.productPrice, { color: PRIMARY }]}>{p.meta}</Text>
                  <TouchableOpacity
                    style={[styles.addBtn, { backgroundColor: PRIMARY }]}
                    onPress={() => addToCart(p)}>
                    <Ionicons name="add" size={18} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function CartTab({ cart, setCart }) {
  const total = cart.reduce((s, i) => s + parseFloat(String(i.meta).replace(/[^0-9.]/g, '') || '0'), 0);
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}><Text style={styles.headerTitle}>My Cart ({cart.length})</Text></View>
      {cart.length === 0
        ? <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="cart-outline" size={64} color="#e2e8f0" />
            <Text style={{ color: '#94a3b8', marginTop: 12 }}>Your cart is empty</Text>
          </View>
        : <>
            <ScrollView style={{ flex: 1, padding: 16 }}>
              {cart.map((item, i) => (
                <View key={i} style={[styles.card, { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 12 }]}>
                  <Text style={{ fontSize: 30 }}>{item.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.productName}>{item.title}</Text>
                    <Text style={[styles.productPrice, { color: PRIMARY }]}>{item.meta}</Text>
                  </View>
                  <TouchableOpacity onPress={() => setCart(c => c.filter((_, j) => j !== i))}>
                    <Ionicons name="trash-outline" size={18} color="#f87171" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
            <View style={styles.checkoutBar}>
              <Text style={styles.totalText}>Total: ₹{total.toFixed(0)}</Text>
              <TouchableOpacity
                style={[styles.checkoutBtn, { backgroundColor: PRIMARY }]}
                onPress={() => { setCart([]); Alert.alert('Order placed!', 'Your order is on its way.'); }}>
                <Text style={styles.checkoutBtnText}>Place Order</Text>
              </TouchableOpacity>
            </View>
          </>
      }
    </SafeAreaView>
  );
}

const TABS_CONFIG = ['shop', 'cart', 'profile'];

export default function App() {
  const [tab, setTab] = useState('shop');
  const [cart, setCart] = useState([]);
  return (
    <View style={{ flex: 1 }}>
      {tab === 'shop' && <ShopTab cart={cart} setCart={setCart} />}
      {tab === 'cart' && <CartTab cart={cart} setCart={setCart} />}
      {tab === 'profile' && (
        <SafeAreaView style={styles.container}>
          <View style={styles.header}><Text style={styles.headerTitle}>Profile</Text></View>
          <View style={{ flex: 1, alignItems: 'center', paddingTop: 40 }}>
            <View style={[styles.avatar, { backgroundColor: PRIMARY }]}><Text style={{ fontSize: 32 }}>👤</Text></View>
            <Text style={[styles.productName, { marginTop: 12, fontSize: 17 }]}>Your Name</Text>
          </View>
        </SafeAreaView>
      )}
      <View style={styles.tabBar}>
        {[
          { key: 'shop',    label: 'Shop',    icon: 'storefront-outline' },
          { key: 'cart',    label: \`Cart\${cart.length > 0 ? \` (\${cart.length})\` : ''}\`, icon: 'cart-outline' },
          { key: 'profile', label: 'Profile', icon: 'person-outline' },
        ].map(t => (
          <TouchableOpacity key={t.key} style={styles.tabItem} onPress={() => setTab(t.key)}>
            <Ionicons name={t.icon} size={22} color={tab === t.key ? PRIMARY : '#94a3b8'} />
            <Text style={[styles.tabLabel, { color: tab === t.key ? PRIMARY : '#94a3b8' }]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { backgroundColor: '#fff', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#111827' },
  grid: { padding: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  productCard: { width: '47%', backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  productImg: { height: 90, alignItems: 'center', justifyContent: 'center' },
  productName: { fontSize: 13, fontWeight: '700', color: '#111827' },
  productDesc: { fontSize: 11, color: '#6b7280', marginTop: 2 },
  productFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  productPrice: { fontSize: 14, fontWeight: '700' },
  addBtn: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 14 },
  checkoutBar: { backgroundColor: '#fff', padding: 16, borderTopWidth: 1, borderTopColor: '#f1f5f9', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  totalText: { fontSize: 17, fontWeight: '700', color: '#111827' },
  checkoutBtn: { borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
  checkoutBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  tabBar: { flexDirection: 'row', backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingBottom: 4 },
  tabItem: { flex: 1, alignItems: 'center', paddingTop: 8, gap: 2 },
  tabLabel: { fontSize: 10, fontWeight: '500' },
  avatar: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
});`;
}

// ── Chat template ────────────────────────────────────────
function generateChatApp(d: PreviewData): string {
  const p = d.primaryColor;
  const items = itemsToJs(d.items);
  return `import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PRIMARY = '${p}';
const CONVERSATIONS = ${items};

const INITIAL_MESSAGES = [
  { id: '1', text: 'Hey! How are you?', mine: false },
  { id: '2', text: 'Doing great, thanks! How about you?', mine: true },
  { id: '3', text: 'Amazing! Did you check the latest update?', mine: false },
  { id: '4', text: 'Yes! Looks good 👍', mine: true },
];

function ChatsTab({ setActiveChat }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}><Text style={styles.headerTitle}>${d.headerTitle || d.appName}</Text></View>
      <ScrollView style={{ flex: 1 }}>
        {CONVERSATIONS.map((conv, i) => (
          <TouchableOpacity key={conv.id} style={styles.chatRow} onPress={() => setActiveChat(conv)}>
            <View style={[styles.avatar, { backgroundColor: PRIMARY + '22' }]}>
              <Text style={{ fontSize: 22 }}>{conv.emoji}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={styles.chatMeta}>
                <Text style={styles.chatName}>{conv.title}</Text>
                <Text style={styles.chatTime}>{i === 0 ? '2m' : i === 1 ? '1h' : 'Yesterday'}</Text>
              </View>
              <Text style={styles.chatLast} numberOfLines={1}>{conv.subtitle}</Text>
            </View>
            {i === 0 && (
              <View style={[styles.badge, { backgroundColor: PRIMARY }]}>
                <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>3</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function ChatScreen({ conv, onBack }) {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [text, setText] = useState('');
  const send = () => {
    if (!text.trim()) return;
    setMessages(m => [...m, { id: String(Date.now()), text: text.trim(), mine: true }]);
    setText('');
  };
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#fff' }]}>
      <View style={[styles.header, { flexDirection: 'row', alignItems: 'center', gap: 12 }]}>
        <TouchableOpacity onPress={onBack}><Ionicons name="arrow-back" size={22} color="#374151" /></TouchableOpacity>
        <Text style={{ fontSize: 22 }}>{conv.emoji}</Text>
        <View><Text style={styles.chatName}>{conv.title}</Text><Text style={{ color: '#22c55e', fontSize: 11 }}>Online</Text></View>
      </View>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView style={{ flex: 1, padding: 16 }}>
          {messages.map(msg => (
            <View key={msg.id} style={[styles.msgWrap, msg.mine && { alignItems: 'flex-end' }]}>
              <View style={[styles.bubble, msg.mine ? { backgroundColor: PRIMARY } : { backgroundColor: '#f1f5f9' }]}>
                <Text style={{ color: msg.mine ? '#fff' : '#374151', fontSize: 14 }}>{msg.text}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
        <View style={styles.inputBar}>
          <TextInput value={text} onChangeText={setText} placeholder="${d.searchPlaceholder || 'Type a message…'}" style={styles.input} />
          <TouchableOpacity onPress={send} style={[styles.sendBtn, { backgroundColor: text.trim() ? PRIMARY : '#e2e8f0' }]}>
            <Ionicons name="send" size={16} color={text.trim() ? '#fff' : '#94a3b8'} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default function App() {
  const [tab, setTab] = useState('chats');
  const [activeChat, setActiveChat] = useState(null);
  if (activeChat) return <ChatScreen conv={activeChat} onBack={() => setActiveChat(null)} />;
  return (
    <View style={{ flex: 1 }}>
      <ChatsTab setActiveChat={setActiveChat} />
      <View style={styles.tabBar}>
        {[
          { key: 'chats',   label: 'Chats',   icon: 'chatbubbles-outline' },
          { key: 'explore', label: 'Explore',  icon: 'search-outline' },
          { key: 'profile', label: 'Profile',  icon: 'person-outline' },
        ].map(t => (
          <TouchableOpacity key={t.key} style={styles.tabItem} onPress={() => setTab(t.key)}>
            <Ionicons name={t.icon} size={22} color={tab === t.key ? PRIMARY : '#94a3b8'} />
            <Text style={[styles.tabLabel, { color: tab === t.key ? PRIMARY : '#94a3b8' }]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { backgroundColor: '#fff', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#111827' },
  chatRow: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f9fafb' },
  avatar: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  chatMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  chatName: { fontSize: 14, fontWeight: '700', color: '#111827' },
  chatTime: { fontSize: 11, color: '#94a3b8' },
  chatLast: { fontSize: 12, color: '#6b7280' },
  badge: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  msgWrap: { marginBottom: 10, alignItems: 'flex-start' },
  bubble: { maxWidth: '75%', padding: 12, borderRadius: 16 },
  inputBar: { flexDirection: 'row', padding: 12, gap: 8, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f1f5f9', alignItems: 'flex-end' },
  input: { flex: 1, backgroundColor: '#f1f5f9', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, maxHeight: 100 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  tabBar: { flexDirection: 'row', backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingBottom: 4 },
  tabItem: { flex: 1, alignItems: 'center', paddingTop: 8, gap: 2 },
  tabLabel: { fontSize: 10, fontWeight: '500' },
});`;
}

// ── Map template ─────────────────────────────────────────
function generateMapApp(d: PreviewData): string {
  const p = d.primaryColor;
  const items = itemsToJs(d.items);
  return `import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PRIMARY = '${p}';
const ITEMS = ${items};

function MapTab() {
  const [selected, setSelected] = useState(null);
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>${d.headerTitle || d.appName}</Text>
        <Text style={{ color: '#94a3b8', fontSize: 13 }}>Near your location</Text>
      </View>
      <View style={styles.mapArea}>
        <Ionicons name="map" size={48} color="#94a3b8" />
        <Text style={{ color: '#94a3b8', marginTop: 8, fontSize: 13 }}>Tap a pin to see details</Text>
        {ITEMS.slice(0, 4).map((item, i) => (
          <TouchableOpacity key={item.id} onPress={() => setSelected(item)}
            style={[styles.pin, {
              top: 40 + i * 38,
              left: 50 + i * 60,
              backgroundColor: selected?.id === item.id ? PRIMARY : '#fff',
              borderColor: PRIMARY,
            }]}>
            <Text style={{ fontSize: 16 }}>{item.emoji}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {selected && (
        <View style={styles.selectedCard}>
          <Text style={styles.title}>{selected.title}</Text>
          <Text style={styles.sub}>{selected.subtitle}</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, alignItems: 'center' }}>
            <Text style={{ color: '#6b7280', fontSize: 12 }}>📍 {selected.meta}</Text>
            <TouchableOpacity style={[styles.btn, { backgroundColor: PRIMARY }]}>
              <Text style={styles.btnText}>${d.ctaLabel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      <Text style={styles.nearbyTitle}>Nearby</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingLeft: 16, paddingBottom: 12 }}>
        {ITEMS.map(item => (
          <TouchableOpacity key={item.id} onPress={() => setSelected(item)}
            style={[styles.chip, { borderColor: selected?.id === item.id ? PRIMARY : '#e2e8f0' }]}>
            <Text style={{ fontSize: 18 }}>{item.emoji}</Text>
            <Text style={{ fontSize: 11, fontWeight: '600', color: '#374151', marginTop: 4 }}>{item.title.split(' ')[0]}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function ListTab() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}><Text style={styles.headerTitle}>All Listings</Text></View>
      <ScrollView style={{ flex: 1, padding: 16 }}>
        {ITEMS.map(item => (
          <View key={item.id} style={[styles.card, { marginBottom: 12 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={[styles.icon, { backgroundColor: PRIMARY + '18' }]}>
                <Text style={{ fontSize: 24 }}>{item.emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.sub}>{item.subtitle}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                  <Ionicons name="location-outline" size={11} color="#94a3b8" />
                  <Text style={{ fontSize: 11, color: '#94a3b8' }}>{item.meta}</Text>
                </View>
              </View>
              <TouchableOpacity style={[styles.btn, { backgroundColor: PRIMARY }]}>
                <Text style={styles.btnText}>${d.ctaLabel}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

export default function App() {
  const [tab, setTab] = useState('map');
  return (
    <View style={{ flex: 1 }}>
      {tab === 'map' ? <MapTab /> : tab === 'list' ? <ListTab /> :
        <SafeAreaView style={styles.container}>
          <View style={styles.header}><Text style={styles.headerTitle}>Profile</Text></View>
          <View style={{ flex: 1, alignItems: 'center', paddingTop: 40 }}>
            <View style={[styles.icon, { backgroundColor: PRIMARY, width: 80, height: 80, borderRadius: 40 }]}>
              <Text style={{ fontSize: 32 }}>👤</Text>
            </View>
            <Text style={[styles.title, { marginTop: 12, fontSize: 17 }]}>Your Name</Text>
          </View>
        </SafeAreaView>
      }
      <View style={styles.tabBar}>
        {[
          { key: 'map',     label: 'Map',     icon: 'map-outline' },
          { key: 'list',    label: 'List',    icon: 'list-outline' },
          { key: 'profile', label: 'Profile', icon: 'person-outline' },
        ].map(t => (
          <TouchableOpacity key={t.key} style={styles.tabItem} onPress={() => setTab(t.key)}>
            <Ionicons name={t.icon} size={22} color={tab === t.key ? PRIMARY : '#94a3b8'} />
            <Text style={[styles.tabLabel, { color: tab === t.key ? PRIMARY : '#94a3b8' }]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { backgroundColor: '#fff', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#111827' },
  mapArea: { height: 200, backgroundColor: '#e0f2fe', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  pin: { position: 'absolute', width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 2, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 4, elevation: 4 },
  selectedCard: { margin: 16, backgroundColor: '#fff', borderRadius: 16, padding: 14, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  nearbyTitle: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8, fontSize: 14, fontWeight: '700', color: '#374151' },
  chip: { width: 72, alignItems: 'center', marginRight: 10, padding: 10, backgroundColor: '#fff', borderRadius: 14, borderWidth: 1 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 14, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 },
  icon: { width: 46, height: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 14, fontWeight: '700', color: '#111827' },
  sub: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  btn: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7 },
  btnText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  tabBar: { flexDirection: 'row', backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingBottom: 4 },
  tabItem: { flex: 1, alignItems: 'center', paddingTop: 8, gap: 2 },
  tabLabel: { fontSize: 10, fontWeight: '500' },
});`;
}

// ── Public router ────────────────────────────────────────
export function generateSnackCode(data: PreviewData): string {
  switch (data.templateType) {
    case "auth-booking":   return generateBookingApp(data);
    case "auth-ecommerce": return generateEcommerceApp(data);
    case "auth-chat":      return generateChatApp(data);
    case "auth-map":       return generateMapApp(data);
    default:               return generateFeedApp(data);
  }
}

export const SNACK_DEPENDENCIES = {
  "@expo/vector-icons": "*",
};
