"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, Plus, LogOut, Coins, CreditCard, Menu, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/supabase/types";
import type { User } from "@supabase/supabase-js";
import { useState } from "react";

const PLAN_COLORS: Record<string, string> = {
  hobby:   "#64748b",
  builder: "#7c5cfc",
  studio:  "#f59e0b",
};

const PLAN_LABELS: Record<string, string> = {
  hobby:   "Hobby",
  builder: "Builder",
  studio:  "Studio",
};

const NAV = [
  { label: "Dashboard",   href: "/dashboard", icon: LayoutDashboard },
  { label: "New project", href: "/new",        icon: Plus },
  { label: "Billing",     href: "/billing",    icon: CreditCard },
];

function SidebarContent({
  profile,
  user,
  pathname,
  onNavigate,
}: {
  profile: Profile | null;
  user: User;
  pathname: string;
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [signingOut, setSigningOut] = useState(false);

  const plan = profile?.plan ?? "hobby";
  const credits = profile?.credits_balance ?? 0;
  const email = user.email ?? "";

  const handleSignOut = async () => {
    setSigningOut(true);
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 h-14 flex items-center border-b border-white/5 flex-shrink-0">
        <Link href="/dashboard" onClick={onNavigate} className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#7c5cfc] to-[#22d3ee] flex items-center justify-center">
            <span className="text-white font-bold text-xs" style={{ fontFamily: "var(--font-playfair)" }}>K</span>
          </div>
          <span className="text-white font-bold text-lg" style={{ fontFamily: "var(--font-playfair)" }}>Kaafi</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150"
              style={{
                background: active ? "rgba(124,92,252,0.12)" : "transparent",
                color: active ? "#a78bfa" : "#64748b",
                border: active ? "1px solid rgba(124,92,252,0.2)" : "1px solid transparent",
                fontFamily: "var(--font-inter)",
              }}
            >
              <Icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Credits widget */}
      <div className="px-3 pb-2">
        <div className="rounded-xl px-3 py-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Coins size={13} className="text-violet-400" />
              <span className="text-xs text-[#64748b]" style={{ fontFamily: "var(--font-inter)" }}>Credits</span>
            </div>
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ background: `${PLAN_COLORS[plan]}18`, color: PLAN_COLORS[plan], fontFamily: "var(--font-inter)" }}
            >
              {PLAN_LABELS[plan]}
            </span>
          </div>
          <p className="text-white font-bold text-xl" style={{ fontFamily: "var(--font-playfair)" }}>{credits}</p>
          <p className="text-[#4a5568] text-xs mt-0.5" style={{ fontFamily: "var(--font-inter)" }}>credits remaining</p>
          {plan === "hobby" && (
            <Link href="/billing" onClick={onNavigate}>
              <button className="btn-primary w-full py-2 text-xs mt-3">Upgrade — ₹499/mo →</button>
            </Link>
          )}
        </div>
      </div>

      {/* User */}
      <div className="px-3 pb-4">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl group hover:bg-white/4 transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center flex-shrink-0 text-xs text-white font-bold">
            {email[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-white text-xs font-medium truncate" style={{ fontFamily: "var(--font-inter)" }}>{email}</p>
          </div>
          {signingOut
            ? <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white/60 rounded-full animate-spin flex-shrink-0" />
            : <LogOut size={13} className="text-[#4a5568] group-hover:text-white transition-colors flex-shrink-0" />
          }
        </button>
      </div>
    </div>
  );
}

export default function AppShell({
  children,
  profile,
  user,
}: {
  children: React.ReactNode;
  profile: Profile | null;
  user: User;
}) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#07070f] flex">

      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex w-60 flex-shrink-0 border-r border-white/5 flex-col h-screen sticky top-0">
        <SidebarContent profile={profile} user={user} pathname={pathname} />
      </aside>

      {/* ── Mobile top bar ── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 h-14 flex items-center justify-between px-4 border-b border-white/5"
        style={{ background: "rgba(7,7,15,0.95)", backdropFilter: "blur(12px)" }}>
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#7c5cfc] to-[#22d3ee] flex items-center justify-center">
            <span className="text-white font-bold text-xs" style={{ fontFamily: "var(--font-playfair)" }}>K</span>
          </div>
          <span className="text-white font-bold text-lg" style={{ fontFamily: "var(--font-playfair)" }}>Kaafi</span>
        </Link>
        <button
          onClick={() => setDrawerOpen(true)}
          className="p-2 text-[#94a3b8] hover:text-white transition-colors"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* ── Mobile drawer ── */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="md:hidden fixed left-0 top-0 bottom-0 z-50 w-72 flex flex-col border-r border-white/5"
              style={{ background: "#0e0e1c" }}
            >
              {/* Close button */}
              <button
                onClick={() => setDrawerOpen(false)}
                className="absolute top-3.5 right-3.5 p-1.5 text-[#64748b] hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
              <SidebarContent
                profile={profile}
                user={user}
                pathname={pathname}
                onNavigate={() => setDrawerOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Main content ── */}
      <main className="flex-1 min-h-screen overflow-auto md:pt-0 pt-14">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="h-full"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
