"use client";

import { useEffect, useState, useRef, ChangeEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import {
  Plus,
  Settings,
  Trash2,
  LogIn,
  LogOut,
  Sun,
  Moon,
  UploadCloud,
  Bell,
  Users,
  Download,
  Link as LinkIcon,
  Edit,
  UserPlus,
  Eye,
  EyeOff,
  List as ListIcon,
  PieChart as PieChartIcon,
  AlertTriangle as AlertTriangleIcon,
  Palette as PaletteIcon,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { loadStripe } from "@stripe/stripe-js";
import Image from "next/image";
import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import UserAvatar from "@/components/UserAvatar";
import jsPDF from "jspdf";
// ✅ NEW: session guard hook
const DEV_EMAIL = process.env.NEXT_PUBLIC_DEV_EMAIL;
export function useRequireSession() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    const legal = searchParams?.get("legal"); // ✅ moved outside

    // ✅ Initial session check
    supabase.auth.getSession().then(({ data }) => {
      if (
  !data.session &&
  !(legal === "privacy" || legal === "terms")
) {
  router.replace("/");
} else if (mounted) {
        setReady(true);
      }
    });

    // ✅ Keep listening for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session && !legal) {
        router.replace("/");
      } else if (mounted) {
        setReady(true);
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [router, searchParams]);

  return ready;
}



// Replace with your publishable key from environment variables
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string
);

// Subscription type definition
interface Subscription {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  currency: string;
  cadence: "monthly" | "yearly";
  next_charge_date: string | null;
  vendor_id: string | null;
  vendors?: { name: string };
  cancel_url?: string | null;
  created_at?: string;
}

// Free plan limit for active services (by subscription count)
const FREE_LIMIT = 3;

// Sort option type
type SortOption = "name" | "amountAsc" | "amountDesc" | "renewalAsc" | "renewalDesc";

// Metadata shapes (to avoid any)
interface UserMeta {
  isPro?: boolean;
  plan?: string;
}

interface StripeSubscriptionRow {
  status?: string | null;
}

interface AlertSettingsRow {
  renewal?: boolean;
  free_trial?: boolean;
  overspending?: boolean;
  overspending_threshold?: number;
}

export default function DashboardContent() {
  const ready = useRequireSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    amount: "",
    currency: "USD",
    cadence: "monthly" as "monthly" | "yearly",
    next_charge_date: "",
    vendor: "",
  });
  const [customName, setCustomName] = useState(""); // NEW state for custom service name
  const [saving, setSaving] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [subscriptionToDelete, setSubscriptionToDelete] = useState<Subscription | null>(null);
  const [sideBySide, setSideBySide] = useState(true); // default to side‑by‑side for charts

  // Editing subscription state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);

  // Search and sort state for subscriptions list
  const [filterTerm, setFilterTerm] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("name");

  // Login modal state
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loginSaving, setLoginSaving] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // New signup modal state
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [signUpForm, setSignUpForm] = useState({ email: "", password: "" });
  const [signUpSaving, setSignUpSaving] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Forgot password modal state
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSaving, setForgotSaving] = useState(false);

  // Footer modal state
  const [activeFooterModal, setActiveFooterModal] = useState<null | "about" | "contact" | "privacy" | "terms">(null);
useEffect(() => {
  const handler = (e: any) => setActiveFooterModal(e.detail);
  window.addEventListener("openFooterModal", handler);
  return () => window.removeEventListener("openFooterModal", handler);
}, []);

// Auto-open Privacy/Terms modal if we arrive with ?legal=privacy|terms
useEffect(() => {
  const legal = searchParams?.get("legal");
  if (legal === "privacy" || legal === "terms") {
    setActiveFooterModal(legal);
    // Clean up URL so it’s just /dashboard after opening
    router.replace("/dashboard");
  }
}, [searchParams, router]);

  // Theme state
const [theme, setTheme] = useState<string>("dark");

useEffect(() => {
  if (typeof window !== "undefined") {
    setTheme(localStorage.getItem("theme") || "dark");
  }
}, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", theme);
    }
  }, [theme]);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement>(null);
  // Close theme menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target as Node)) {
        setIsThemeMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Feature modal states
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [linkedAccounts, setLinkedAccounts] = useState<string[]>([]);
  const [alertSettings, setAlertSettings] = useState({
    renewal: true,
    overspending: false,
    overspendingThreshold: 0,
    freeTrial: true,
  });
  const [shareEmail, setShareEmail] = useState("");

  // Track whether the user is on a Pro plan. Default false.
  const [isPro, setIsPro] = useState(false);

  // Check auth and fetch data on mount
useEffect(() => {
  const run = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      setUserEmail(user.email ?? null);
      await fetchData(user.id);
    }
  };
  run();
}, [ready]);


  // ✅ Apply Stripe success upgrade if redirected with ?session_id=...
  useEffect(() => {
    const run = async () => {
      const sessionId = searchParams?.get("session_id");
      if (!sessionId) return;
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      try {
        const res = await fetch("/api/checkout-success", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id: sessionId, user_id: user.id }),
        });
        if (!res.ok) throw new Error("checkout-success failed");
        // Re-check Pro status
        await checkProStatus();
        toast.success("Pro plan activated — thank you!");
        router.replace("/dashboard"); // clean URL
      } catch (err) {
        console.error(err);
      }
    };
    run();
  }, [searchParams, router]);

// 🚑 Fix for Stripe back button React crash
useEffect(() => {
  if (typeof document !== "undefined" &&
      document.referrer.includes("checkout.stripe.com")) {
    window.location.replace("/dashboard"); // hard reload
  }
}, []);


  // Detect Pro plan status
const checkProStatus = async () => {
  setIsPro(false); // default free
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    let pro = false;

    // 🔑 Check dev-only user_flags override first
    try {
      const { data: flag } = await supabase
        .from("user_flags")
        .select("is_pro")
        .eq("user_id", user.id)
        .maybeSingle();

      if (flag?.is_pro) {
        setIsPro(true);
        return; // skip rest, override
      }
    } catch {
      // ignore if table missing
    }

    // Fallback: metadata flags
    const um = (user as User | null)?.user_metadata as UserMeta | undefined;
    const am = (user as User | null)?.app_metadata as UserMeta | undefined;

    if (um?.isPro || um?.plan === "pro" || am?.isPro || am?.plan === "pro") {
      pro = true;
    }

    // Fallback: Stripe subs
    if (!pro) {
      try {
        const { data, error } = await supabase
          .from("stripe_subscriptions")
          .select("status")
          .eq("user_id", user.id)
          .maybeSingle();
        const sub = (data as StripeSubscriptionRow | null) ?? null;
        if (!error && sub?.status && ["trialing", "active", "past_due"].includes(sub.status)) {
          pro = true;
        }
      } catch {
        // ignore
      }
    }

    setIsPro(pro);
  } catch {
    // ignore
  }
};

  // Re-check Pro when user changes
  useEffect(() => {
    if (userEmail) {
      checkProStatus();
    }
  }, [userEmail]);

  // Load saved alert settings from Supabase on mount
  useEffect(() => {
    const loadAlertSettings = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase.from("alert_settings").select("*").eq("user_id", user.id).maybeSingle();
      if (error) {
        console.error("Failed to load alert settings:", error.message);
        return;
      }
      if (data) {
        const row = data as AlertSettingsRow;
        setAlertSettings({
          renewal: row.renewal ?? true,
          freeTrial: row.free_trial ?? true,
          overspending: row.overspending ?? false,
          overspendingThreshold: row.overspending_threshold ?? 0,
        });
      }
    };
    loadAlertSettings();
  }, []);

  // 🔔 Renewal banner reminders (Pro only, respects alert settings)
useEffect(() => {
  if (!isPro || !alertSettings.renewal || subscriptions.length === 0) return;

  const today = new Date();

  subscriptions.forEach((sub) => {
    const next = computeNextRenewal(sub);
    if (!next) return;
    const diffDays = Math.ceil((next.getTime() - today.getTime()) / 86400000);

    if (diffDays > 0 && diffDays <= 5) {
      const key = `${sub.id}-${diffDays}`;
      if (!sessionStorage.getItem(key)) {
        toast.success(
          `Reminder: ${sub.name} renews in ${diffDays} day${diffDays > 1 ? "s" : ""}`,
          { duration: 10000 }
        );
        sessionStorage.setItem(key, "shown");
      }
    }
  });
}, [subscriptions, isPro, alertSettings.renewal]);

const fetchData = async (userId: string) => {
  const { data: subs, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    console.error(error.message);
    toast.error("Failed to load subscriptions");
  }

  setSubscriptions((subs as Subscription[]) || []);
  setLoading(false);

  return (subs as Subscription[]) ?? [];  // 👈 add this return
};

if (!ready) return <div>Loading...</div>; // show spinner/blank while checking
  // Derived stats
  const totalSubscriptions = subscriptions.length;
  const activeSubscriptions = subscriptions.filter((s) => !s.cancel_url);
  // Number of active subscriptions (total), used for free plan counter
  const activeCount = activeSubscriptions.length;
  const activeServices = activeCount; // renamed for clarity
  // Determine per-plan limit (Infinity for Pro)
  const planLimit = isPro ? Infinity : FREE_LIMIT;
  const hasFreeLimitReached = activeCount >= planLimit;
  // For the progress bar, only compute using FREE_LIMIT if on free plan. Pro shows a full bar.
  const freeProgress = isPro ? 100 : Math.min(activeCount / FREE_LIMIT, 1) * 100;
  const monthlySpending = activeSubscriptions.reduce((sum, s) => {
    if (s.cadence === "monthly") return sum + s.amount;
    return sum;
  }, 0);
  const yearlyProjection = activeSubscriptions.reduce((sum, s) => {
    if (s.cadence === "monthly") return sum + s.amount * 12;
    return sum + s.amount;
  }, 0);
  const now = new Date();
  // Date helpers
  const parseLocalDate = (s?: string | null): Date | null => {
    if (!s) return null;
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
    if (m) {
      const [, y, mo, d] = m;
      return new Date(Number(y), Number(mo) - 1, Number(d));
    }
    const t = Date.parse(s);
    return Number.isNaN(t) ? null : new Date(t);
  };
  const addMonthsSafe = (date: Date, months: number) => {
    const d = new Date(date.getTime());
    const day = d.getDate();
    d.setMonth(d.getMonth() + months);
    if (d.getDate() < day) d.setDate(0);
    return d;
  };
  const nextCycleAfter = (start: Date, cadence: "monthly" | "yearly"): Date => {
    const now = new Date();
    let next = new Date(start.getTime());
    if (cadence === "yearly") {
      while (next <= now) {
        next.setFullYear(next.getFullYear() + 1);
      }
    } else {
      while (next <= now) {
        next = addMonthsSafe(next, 1);
      }
    }
    return next;
  };
  const computeNextRenewal = (s: Subscription): Date | null => {
    const start = parseLocalDate(s.next_charge_date) ?? parseLocalDate(s.created_at ?? null);
    if (!start) return null;
    return nextCycleAfter(start, s.cadence ?? "monthly");
  };
  // 🔔 Trigger toast reminders for upcoming renewals
function showRenewalReminders(subs: Subscription[]) {
  if (!subs || subs.length === 0) return;

  const today = new Date();

  subs.forEach((sub) => {
    const next = computeNextRenewal(sub);
    if (!next) return;

    const diffDays = Math.ceil((next.getTime() - today.getTime()) / 86400000);

    if (diffDays > 0 && diffDays <= 5) {
      const key = `${sub.id}-${diffDays}`;
      if (!sessionStorage.getItem(key)) {
        toast.success(
          `Reminder: ${sub.name} renews in ${diffDays} day${diffDays > 1 ? "s" : ""}`,
          { duration: 10000 }
        );
        sessionStorage.setItem(key, "shown");
      }
    }
  });
}
  const renewalMeta = (s: Subscription) => {
    const next = computeNextRenewal(s);
    if (!next) return { next: null as Date | null, dueLabel: "—", isOverdue: false };
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(next);
    d.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((d.getTime() - today.getTime()) / 86400000);
    const isOverdue = diffDays <= 0;
    const dueLabel = isOverdue
      ? "Needs renewal"
      : `Renews ${d.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}`;
    return { next, dueLabel, isOverdue };
  };

  // Upcoming payments (aggregated by service+date)
  interface UpcomingItem {
    name: string;
    next: Date;
    currency: string;
    amount: number;
    dueLabel: string;
    isOverdue: boolean;
  }
  const upcomingGrouped: Record<string, UpcomingItem> = {};
  subscriptions.forEach((sub) => {
    const meta = renewalMeta(sub);
    if (!meta.next) return;
    const dateKey = meta.next.toISOString().split("T")[0];
    const key = `${sub.name}_${dateKey}`;
    if (!upcomingGrouped[key]) {
      upcomingGrouped[key] = {
        name: sub.name,
        next: meta.next,
        currency: sub.currency,
        amount: sub.amount,
        dueLabel: meta.dueLabel,
        isOverdue: meta.isOverdue,
      };
    } else {
      upcomingGrouped[key].amount += sub.amount;
    }
  });
  const upcoming: UpcomingItem[] = Object.values(upcomingGrouped)
    .sort((a, b) => a.next.getTime() - b.next.getTime())
    .slice(0, isPro ? undefined : 3);

  // Chart data - aggregate same‑name services
  const aggregatedChartMap: Record<string, number> = {};
  subscriptions.forEach((sub) => {
    if (sub.cancel_url) return;
    aggregatedChartMap[sub.name] = (aggregatedChartMap[sub.name] || 0) + sub.amount;
  });
  const chartData = Object.entries(aggregatedChartMap).map(([name, amount]) => ({ name, amount }));
  const maxBarValue = chartData.length ? Math.max(...chartData.map((d) => d.amount)) : 0;
  const barYAxisMax = Math.max(Math.ceil(maxBarValue / 5) * 5, 5);
  const barYAxisTicks = Array.from({ length: 6 }, (_, i) => (barYAxisMax / 5) * i);

  // Projection data
  const monthlyAmounts = activeSubscriptions
    .filter((s) => s.cadence === "monthly")
    .reduce((sum, s) => sum + s.amount, 0);
  const projectionWindow = 13;
  const yearlySpikes: number[] = Array.from({ length: projectionWindow }, () => 0);
  for (const s of activeSubscriptions) {
    if (s.cadence === "yearly") {
      const next = computeNextRenewal(s);
      if (!next) continue;
      const monthDiff = (next.getFullYear() - now.getFullYear()) * 12 + (next.getMonth() - now.getMonth());
      if (monthDiff < 0) continue;
      const index = Math.min(monthDiff, projectionWindow - 1);
      yearlySpikes[index] += s.amount;
    }
  }
  const projectionData = Array.from({ length: projectionWindow }, (_, idx) => {
    const monthDate = new Date(now.getFullYear(), now.getMonth() + idx, 1);
    const monthName = monthDate.toLocaleString("default", { month: "short" });
    return {
      month: monthName,
      spending: monthlyAmounts + yearlySpikes[idx],
    };
  });
  const maxLineValue = projectionData.reduce((m, d) => Math.max(m, d.spending), 0);
  const lineYAxisMax = Math.ceil(maxLineValue / 5) * 5 || 5;
  const lineYAxisTicks = Array.from({ length: 6 }, (_, i) => (lineYAxisMax / 5) * i);

  // Duplicate subscriptions suggestions
  const duplicateServices = Object.entries(aggregatedChartMap).filter(
    ([name]) => subscriptions.filter((s) => s.name === name).length > 1
  );

  // Cancel duplicates: keep the earliest subscription by created_at and delete the rest
  const handleCancelDuplicates = async (name: string) => {
    const duplicates = subscriptions
      .filter((s) => s.name === name)
      .sort((a, b) => {
        const aDate = (a.created_at ? new Date(a.created_at) : new Date(0)).getTime();
        const bDate = (b.created_at ? new Date(b.created_at) : new Date(0)).getTime();
        return aDate - bDate;
      });
    if (duplicates.length <= 1) return;
    // the earliest one is the first
    const [earliest, ...others] = duplicates;
    // delete all others
    for (const sub of others) {
      await supabase.from("subscriptions").delete().eq("id", sub.id);
    }
    // update state: keep earliest only
    setSubscriptions((prev) => prev.filter((s) => s.name !== name || s.id === earliest.id));
    toast.success(`Cancelled duplicate ${name} subscriptions`);
  };

  // Edit subscription handlers
  const handleEditSubscription = (sub: Subscription) => {
    setEditingSubscription(sub);
    setForm({
      name: sub.name,
      amount: String(sub.amount),
      currency: sub.currency,
      cadence: sub.cadence,
      next_charge_date: sub.next_charge_date || "",
      vendor: "",
    });
    setIsEditModalOpen(true);
  };
  const handleUpdateSubscription = async () => {
    if (!editingSubscription) return;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast.error("You must be logged in");
      return;
    }
    const amt = Number(form.amount);
    if (!Number.isFinite(amt) || amt <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    const nameToSave = form.name === "Custom" ? customName.trim() : form.name.trim();
    if (!nameToSave) {
      toast.error("Please enter a service name");
      return;
    }

    const { error: updateErr, data: updated } = await supabase
      .from("subscriptions")
      .update({
        name: nameToSave,
        amount: amt,
        currency: form.currency,
        cadence: form.cadence,
        next_charge_date: form.next_charge_date || null,
      })
      .eq("id", editingSubscription.id)
      .select()
      .single();
    if (updateErr || !updated) {
      console.error("Update error:", updateErr?.message);
      toast.error(updateErr?.message || "Failed to update subscription");
      return;
    }
    setSubscriptions((prev) => prev.map((s) => (s.id === (updated as Subscription).id ? (updated as Subscription) : s)));
    toast.success(`${(updated as Subscription).name} updated`);
    setIsEditModalOpen(false);
    setEditingSubscription(null);
    setForm({
      name: "",
      amount: "",
      currency: "USD",
      cadence: "monthly",
      next_charge_date: "",
      vendor: "",
    });
  };

  // Calculate total spending in next 30 days
  const next30DaysSpending = activeSubscriptions.reduce((sum, s) => {
    const next = computeNextRenewal(s);
    if (!next) return sum;
    const diffDays = (next.getTime() - now.getTime()) / 86400000;
    if (diffDays >= 0 && diffDays <= 30) {
      return sum + s.amount;
    }
    return sum;
  }, 0);

  // Filter and sort subscriptions
  const filteredSubscriptions = subscriptions.filter((s) => s.name.toLowerCase().includes(filterTerm.trim().toLowerCase()));
  const displaySubscriptions = [...filteredSubscriptions].sort((a, b) => {
    switch (sortOption) {
      case "amountAsc":
        return a.amount - b.amount;
      case "amountDesc":
        return b.amount - a.amount;
      case "renewalAsc": {
        const aNext = computeNextRenewal(a);
        const bNext = computeNextRenewal(b);
        const aTime = aNext ? aNext.getTime() : Number.MAX_VALUE;
        const bTime = bNext ? bNext.getTime() : Number.MAX_VALUE;
        return aTime - bTime;
      }
      case "renewalDesc": {
        const aNext = computeNextRenewal(a);
        const bNext = computeNextRenewal(b);
        const aTime = aNext ? aNext.getTime() : -Infinity;
        const bTime = bNext ? bNext.getTime() : -Infinity;
        return bTime - aTime;
      }
      case "name":
      default:
        return a.name.localeCompare(b.name);
    }
  });

  // Create subscription
  const handleAddSubscription = async () => {
    if (!isPro && hasFreeLimitReached) {
      toast.error(`Free plan users can add up to ${FREE_LIMIT} subscriptions. Upgrade to Pro for unlimited subscriptions.`);
      return;
    }
    setSaving(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast.error("You must be logged in");
      setSaving(false);
      return;
    }
    const amt = Number(form.amount);
    if (!Number.isFinite(amt) || amt <= 0) {
      toast.error("Please enter a valid amount");
      setSaving(false);
      return;
    }
    const nameToSave = form.name === "Custom" ? customName.trim() : form.name.trim();
    if (!nameToSave) {
      toast.error("Please enter a service name");
      setSaving(false);
      return;
    }
    const { data: newSub, error: subErr } = await supabase
      .from("subscriptions")
      .insert([
        {
          user_id: user.id,
          name: nameToSave,
          amount: amt,
          currency: form.currency,
          cadence: form.cadence,
          next_charge_date: form.next_charge_date || null,
          vendor_id: null,
        },
      ])
      .select()
      .single();
    if (subErr || !newSub) {
      console.error("Insert error:", subErr?.message);
      toast.error(subErr?.message || "Failed to add subscription");
      setSaving(false);
      return;
    }
    setSubscriptions((prev) => [...prev, newSub as Subscription]);
    toast.success(`${(newSub as Subscription).name} added`);
    setIsModalOpen(false);
    setForm({
      name: "",
      amount: "",
      currency: "USD",
      cadence: "monthly",
      next_charge_date: "",
      vendor: "",
    });
    setSaving(false);
  };

  // Delete subscription
  const handleDeleteSubscription = async (id: string, name: string) => {
    setDeletingId(id);
    await supabase.from("notifications").delete().eq("subscription_id", id);
    const { error: subErr } = await supabase.from("subscriptions").delete().eq("id", id);
    if (subErr) {
      toast.error(`Failed to delete ${name}`);
      setDeletingId(null);
      return;
    }
    setSubscriptions((prev) => prev.filter((s) => s.id !== id));
    toast.success(`${name} deleted permanently`);
    setDeletingId(null);
  };
  const handleInitiateDelete = (sub: Subscription) => {
    setSubscriptionToDelete(sub);
    setIsDeleteModalOpen(true);
  };
  const handleConfirmDelete = async () => {
    if (subscriptionToDelete) {
      await handleDeleteSubscription(subscriptionToDelete.id, subscriptionToDelete.name);
    }
    setIsDeleteModalOpen(false);
    setSubscriptionToDelete(null);
  };
  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setSubscriptionToDelete(null);
  };

  // Upgrade to pro
  const handleUpgrade = async () => {
    const stripe = await stripePromise;
    if (!stripe) {
      toast.error("Payment system failed to load. Please refresh and try again.");
      return;
    }
    const res = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: "pro", automaticTax: true, billingAddressCollection: "auto" }),
    });
    const session = await res.json();
    // Support either URL or sessionId response shapes
    if (session?.url) {
      window.location.href = session.url as string;
      return;
    }
    const result = await stripe.redirectToCheckout({ sessionId: session.id });
    if (result.error) {
      toast.error(result.error.message || "Checkout failed. Please try again.");
    }
  };

  // Handle login
  const handleLogin = async () => {
    setLoginSaving(true);
    const { email, password } = loginForm;
    if (!email || !password) {
      toast.error("Please provide both email and password");
      setLoginSaving(false);
      return;
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data?.user) {
      toast.error(error?.message || "Invalid email or password. Please try again.");
      setLoginSaving(false);
      return;
    }
    setUserEmail(data.user.email ?? null);
    setIsLoginOpen(false);
    const subs = await fetchData(data.user.id); // ✅ fetch + return subscriptions
    showRenewalReminders(subs);                 // ✅ trigger renewal toasts
    setLoginSaving(false);
    toast.success("Welcome back!");
  };
  // Handle signup
const handleSignUp = async () => {
  setSignUpSaving(true);
  const { email, password } = signUpForm;
  if (!email || !password) {
    toast.error("Please provide both email and password");
    setSignUpSaving(false);
    return;
  }

  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error || !data?.user) {
    toast.error(error?.message || "Couldn’t create account. Please check your details and try again.");
    setSignUpSaving(false);
    return;
  }

  // --- SUCCESS ---
  setUserEmail(data.user.email ?? null);
  await fetchData(data.user.id);

  // ✅ Toast happens ONCE, right after signup succeeds
  toast.success("Account created successfully — welcome to CashDuezy!");

  setIsSignUpOpen(false);
  setSignUpSaving(false);

  // --- REDIRECT LOGIC ---
  const { data: sessionData } = await supabase.auth.getSession();
  if (sessionData.session) {
    router.push("/dashboard");
  } else {
    // fallback: retry if session not yet persisted
    setTimeout(() => router.push("/dashboard"), 500);
  }
};
  
  // Handle logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUserEmail(null);
    setSubscriptions([]);
    setIsPro(false);
    toast.success("You’ve been logged out.");

      // 🚪 Send them back to homepage
    router.push("/");
  };
  // Feature handlers
  const handleLinkBank = () => {
    setLinkedAccounts((prev) => [...prev, `Linked account ${prev.length + 1}`]);
    toast.success("Bank account linked successfully");
    setIsLinkModalOpen(false);
  };
  const handleImportCSV = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const text = await file.text();
    const rows = text.trim().split(/\r?\n/);
    let imported = 0;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast.error("You must be logged in to import");
      return;
    }
    for (const row of rows) {
      const parts = row.split(",").map((p) => p.trim());
      if (parts.length < 2) continue;
      const [name, amountStr, currency = "USD", cadence = "monthly"] = parts;
      const amt = Number(amountStr);
      if (!name || !Number.isFinite(amt) || amt <= 0) continue;
      // Respect free limit during bulk import
      if (!isPro && activeServices + imported >= FREE_LIMIT) {
        break;
      }
      const { error, data } = await supabase
        .from("subscriptions")
        .insert([
          {
            user_id: user.id,
            name,
            amount: amt,
            currency,
            cadence: cadence === "yearly" ? "yearly" : "monthly",
            next_charge_date: null,
            vendor_id: null,
          },
        ])
        .select()
        .single();
      if (!error && data) {
        imported += 1;
        setSubscriptions((prev) => [...prev, data as Subscription]);
      }
    }
    toast.success(`Imported ${imported} subscription${imported === 1 ? "" : "s"}`);
    setIsUploadModalOpen(false);
  };
  const handleSaveAlerts = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast.error("You must be logged in to save alerts");
      return;
    }
    const { error } = await supabase.from("alert_settings").upsert({
      user_id: user.id,
      renewal: alertSettings.renewal,
      free_trial: alertSettings.freeTrial,
      overspending: alertSettings.overspending,
      overspending_threshold: alertSettings.overspendingThreshold,
      updated_at: new Date().toISOString(),
    });
    if (error) {
      toast.error("Failed to save alert preferences");
      console.error(error);
    } else {
      toast.success("Alert preferences saved");
      setIsAlertsModalOpen(false);
    }
  };
const handleInviteUser = async () => {
  if (!shareEmail) {
    toast.error("Please enter an email to share with");
    return;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    toast.error("You must be logged in to share");
    return;
  }

  // Get inviter's group_id
  const { data: inviterProfile, error: profileErr } = await supabase
    .from("profiles")
    .select("group_id")
    .eq("id", user.id)
    .single();

  if (profileErr || !inviterProfile) {
    toast.error("Failed to load profile");
    return;
  }

  const groupId = inviterProfile.group_id;

  // Count members in this group
  const { data: members, error: membersErr } = await supabase
    .from("profiles")
    .select("id")
    .eq("group_id", groupId);

  if (membersErr) {
    toast.error("Failed to check group size");
    return;
  }

  if (members && members.length >= 3) {
    toast.error("Pro plan allows up to 3 members. Upgrade coming soon!");
    return;
  }

  // Here you would normally send an invite email or link.
  // For now, just simulate attaching the invited user to the group.
  await supabase
    .from("profiles")
    .update({ group_id: groupId, role: "member" })
    .eq("email", shareEmail);

  toast.success(`Invitation sent to ${shareEmail}`);
  setShareEmail("");
  setIsShareModalOpen(false);
};
const handleExportCSV = () => {
  if (!isPro) {
    toast.error("CSV export is only available on Pro. Upgrade to unlock this feature.");
    setIsExportModalOpen(false);
    return;
  }

  const header = ["Name", "Amount", "Currency", "Cadence", "Next Charge Date"];
  const lines = subscriptions.map((s) =>
    [s.name, s.amount, s.currency, s.cadence, s.next_charge_date ?? ""].join(",")
  );
  const csv = [header.join(","), ...lines].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "subscriptions.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  toast.success("CSV downloaded");
  setIsExportModalOpen(false);
};

const handleExportPDF = () => {
  if (!isPro) {
    toast.error("PDF export is only available on Pro. Upgrade to unlock this feature.");
    setIsExportModalOpen(false);
    return;
  }

  try {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(16);
    doc.text("CashDuezy - Subscriptions Export", 14, 20);

    // Table header + rows
    const header = ["Name", "Amount", "Currency", "Cadence", "Next Charge Date"];
    const rows = subscriptions.map((s) => [
      s.name,
      s.amount.toFixed(2),
      s.currency,
      s.cadence,
      s.next_charge_date ?? "",
    ]);

    // Draw header
    let startY = 30;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    header.forEach((h, i) => doc.text(h, 14 + i * 40, startY));

    // Draw rows
    doc.setFont("helvetica", "normal");
    rows.forEach((row, rowIndex) => {
      const y = startY + (rowIndex + 1) * 10;
      row.forEach((cell, i) => {
        doc.text(String(cell), 14 + i * 40, y);
      });
    });

    doc.save("subscriptions.pdf");
    toast.success("PDF downloaded");
  } catch (err) {
    console.error(err);
    toast.error("Failed to export PDF");
  }

  setIsExportModalOpen(false);
};

  // Forgot password handler
  const handleForgotPassword = async () => {
    setForgotSaving(true);
    const emailToUse = forgotEmail.trim() || loginForm.email.trim();
    if (!emailToUse) {
      toast.error("Please enter your email");
      setForgotSaving(false);
      return;
    }
    try {
      const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/update-password` : undefined;
      const { error } = await supabase.auth.resetPasswordForEmail(emailToUse, { redirectTo });
      if (error) {
        console.error("Reset password error:", error);
      }
      toast.success("If an account with that email exists, a reset link will be sent shortly");
      setIsForgotOpen(false);
    } catch (err) {
      console.error(err);
      toast.success("If an account with that email exists, a reset link will be sent shortly");
      setIsForgotOpen(false);
    } finally {
      setForgotSaving(false);
    }
  };
  // Theme classes
  const isDark = theme === "dark";
  const pageBg = isDark ? "bg-gray-950" : "bg-gray-50";
  const pageText = isDark ? "text-gray-100" : "text-gray-800";
  const headerBg = isDark ? "bg-gray-900/80" : "bg-white/80";
  const headerBorder = isDark ? "border-gray-800" : "border-gray-200";
  const cardBg = isDark ? "bg-gray-900" : "bg-white";
  const cardBorder = isDark ? "border-gray-800" : "border-gray-200";
  const statTextColours: Record<string, string> = {
    violet: isDark ? "text-violet-300" : "text-indigo-600",
    blue: isDark ? "text-sky-300" : "text-blue-600",
    emerald: isDark ? "text-emerald-300" : "text-green-600",
    rose: isDark ? "text-rose-300" : "text-red-600",
  };
  const accentButton = (colour: "violet" | "emerald" | "rose") => {
    if (colour === "violet") {
      return isDark ? "bg-violet-600 hover:bg-violet-500 text-white" : "bg-indigo-600 hover:bg-indigo-500 text-white";
    }
    if (colour === "emerald") {
      return isDark ? "bg-emerald-600 hover:bg-emerald-500 text-white" : "bg-green-600 hover:bg-green-500 text-white";
    }
    if (colour === "rose") {
      return isDark ? "bg-rose-600 hover:bg-rose-500 text-white" : "bg-red-600 hover:bg-red-500 text-white";
    }
    return "";
  };
  const neutralButton = isDark ? "bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700" : "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300";
  const neutralPanel = isDark ? "bg-gray-900 border border-gray-800" : "bg-white border border-gray-200";
  // Features for login page with icons
  const features = [
    { title: "Track Subscriptions", description: "Manage and track all your recurring services in one place.", icon: ListIcon },
    { title: "Spending Insights", description: "Visualize your spending with interactive charts and projections.", icon: PieChartIcon },
    { title: "Duplicate Alerts", description: "Identify and cancel duplicate subscriptions easily.", icon: AlertTriangleIcon },
    { title: "Customizable Theme", description: "Switch between light and dark mode to suit your preference.", icon: PaletteIcon },
  ];
  // Footer modal content
  const aboutContent = (
    <div className="space-y-3 text-sm">
      <p>
        CashDuezy is a subscription management platform that helps you track and manage your recurring services. Our goal is to simplify your financial life by consolidating all your subscriptions, monitoring spending, and providing clear insights into upcoming payments.
      </p>
    </div>
  );
  const contactContent = (
    <div className="space-y-3 text-sm">
      <p>
        For support or general inquiries, please contact us at{" "}
        <a href="mailto:support@cashduezy.com" className="underline">
          support@cashduezy.com
        </a>
        .
      </p>
    </div>
  );
  const privacyContent = (
    <div className="space-y-3 text-sm">
      <p>
        This Privacy Policy describes how CashDuezy (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) collects, uses, and shares your personal information when you use our services. Personal information is any data that can identify an individual. We collect personal information (such as names, email addresses, billing and shipping details, and payment information) when you sign up and use our subscription management services. We use this information to provide and improve our services, process payments, communicate with you, and comply with legal obligations. We may share your personal information with third-party service providers, such as payment processors, only as necessary to provide the service. We do not sell or rent your personal data. We retain personal data only as long as needed for the purposes described and in accordance with applicable laws. We implement reasonable technical and organizational measures to protect your personal information. You have the right to access, correct, or delete your personal information and to object to or restrict its processing. To exercise these rights, please contact us at{" "}
        <a href="mailto:support@cashduezy.com" className="underline">
          support@cashduezy.com
        </a>
        . By using CashDuezy, you agree to this Privacy Policy and any updates we may make. We will post any changes to this Policy on this page. If you continue to use the service after changes are posted, you consent to the updated policy.
      </p>
    </div>
  );
  const termsContent = (
    <div className="space-y-3 text-sm">
      <p>
        These Terms of Service (&quot;Terms&quot;) constitute a legal agreement between you (&quot;you&quot; or &quot;user&quot;) and CashDuezy (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) that governs your use of the CashDuezy subscription management service. By creating an account or using our services, you agree to these Terms. If you do not agree to these Terms, do not use the service.
      </p>
      <p>
        <strong>Service Description.</strong> CashDuezy provides software that allows users to track subscriptions, monitor spending, view upcoming payments, and manage subscription information. We do not provide financial advice.
      </p>
      <p>
        <strong>Account and Responsibilities.</strong> You must be at least 18 years old to use the service. You agree to provide accurate and complete information and keep it updated. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. You agree not to use the service for illegal or unauthorized purposes.
      </p>
      <p>
        <strong>Free and Paid Plans.</strong> We offer a free plan that allows a limited number of unique services. Paid plans (such as Pro) offer additional features and require payment of applicable fees and taxes. Fees are charged via our payment provider (Stripe) and are non-refundable unless required by law.
      </p>
      <p>
        <strong>Automatic Payments and Taxes.</strong> If you purchase a paid plan, you authorize us (through our payment partner) to charge your payment method on a recurring basis until you cancel. Taxes may be calculated and collected based on your location. You may cancel your subscription at any time; however, you will continue to have access until the end of the current billing period, and no refunds will be issued for partial periods.
      </p>
      <p>
        <strong>Intellectual Property.</strong> The service, including its content and software, is owned by us and protected by intellectual property laws. You agree not to reproduce, distribute, modify, or create derivative works of the service without our permission.
      </p>
      <p>
        <strong>User Content.</strong> You retain ownership of any content you submit but grant us a worldwide, non-exclusive license to use, store, and display it solely to operate and improve the service.
      </p>
      <p>
        <strong>Termination.</strong> We may suspend or terminate your account if you violate these Terms or use the service in a harmful way. You may terminate your account at any time by discontinuing the use of the service.
      </p>
      <p>
        <strong>Disclaimer and Limitation of Liability.</strong> The service is provided &quot;as is&quot; without warranty of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the service. Our total liability to you for any claims arising from the service is limited to the amount you have paid us in the twelve months preceding the claim.
      </p>
      <p>
        <strong>Changes to Terms.</strong> We may modify these Terms at any time. We will notify you by posting the updated Terms on our website. Continued use of the service after changes become effective constitutes your acceptance of the new Terms.
      </p>
      <p>
        <strong>Governing Law.</strong> These Terms are governed by the laws of the jurisdiction where CashDuezy operates, without regard to conflict of law principles.
      </p>
      <p>
        <strong>Contact.</strong> If you have questions or concerns about these Terms, please contact us at{" "}
        <a href="mailto:support@cashduezy.com" className="underline">
          support@cashduezy.com
        </a>
        .
      </p>
    </div>
  );

  // Loading state
  if (loading) {
    return <div className={`min-h-screen flex items-center justify-center ${pageBg} ${pageText}`}>Loading...</div>;
  }

  return (
    <div className={`min-h-screen flex flex-col ${pageBg} ${pageText} font-sans`}>
      {/* ===== Header ===== */}
      <header className={`sticky top-0 z-40 w-full ${headerBg} backdrop-blur border-b ${headerBorder}`}>
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={`p-2 rounded-md ${isDark ? "bg-violet-900/30 border-violet-800/40 text-violet-300" : "bg-indigo-100 border-indigo-300 text-indigo-600"} border`}>
              <Image src="/cashduezy_logo.png" alt="CashDuezy Icon" width={40} height={40} className="w-10 h-10 object-cover object-left" />
            </span>
            <h1 className="text-xl font-semibold">CashDuezy</h1>
          </div>
          <div className="flex items-center gap-3 relative">
            {userEmail && (
              <div
                className={`hidden sm:flex flex-col items-start gap-1 px-2 py-1 ${isDark ? "bg-gray-800 border-gray-700 text-gray-300" : "bg-gray-100 border-gray-300 text-gray-600"} border rounded-lg text-xs w-32`}
              >
                <div className="flex justify-between w-full items-center">
                  {isPro ? <span>Pro: Unlimited</span> : <span>{Math.min(activeServices, FREE_LIMIT)}/{FREE_LIMIT} free</span>}
                  {!isPro && hasFreeLimitReached && <span className={`${isDark ? "text-rose-400" : "text-red-500"} font-semibold text-xs`}>!</span>}
                </div>
                {!isPro && (
                  <div className="w-full h-1.5 rounded bg-gray-700/40 dark:bg-gray-700/40 overflow-hidden">
                    <div className={`${isDark ? "bg-violet-500" : "bg-indigo-500"}`} style={{ width: `${freeProgress}%`, height: "100%" }} />
                  </div>
                )}
              </div>
            )}
            {/* Upgrade only when not Pro */}

{userEmail && !isPro && (
  <div className="flex items-center gap-2">
    <Link
      href="/pricing"
      className={`px-3 py-1.5 rounded-md text-sm whitespace-nowrap ${accentButton("emerald")}`}
    >
      Upgrade to Pro
    </Link>
    <span
      className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"} italic`}
    >
      Upgrade to Pro — only $5/month
    </span>
  </div>
)}
            {userEmail && (
              <button onClick={() => setIsModalOpen(true)} className={`px-3 py-1.5 rounded-md text-sm flex items-center gap-1 ${accentButton("violet")}`}>
                <Plus className="w-4 h-4" /> Add
              </button>
            )}
            <div className="relative" ref={themeMenuRef}>
              <button onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)} className={`p-2 rounded-md ${neutralButton}`} aria-label="Theme settings">
                <Settings className="w-4 h-4" />
              </button>
              {isThemeMenuOpen && (
                <div className={`absolute right-0 mt-2 w-32 rounded-md shadow-lg ${neutralPanel} z-50`}>
                  <button onClick={() => { setTheme("light"); setIsThemeMenuOpen(false); }} className="w-full px-3 py-2 flex items-center gap-2 text-sm hover:bg-gray-200 dark:hover:bg-gray-700">
                    <Sun className="w-4 h-4" /> Light
                  </button>
                  <button onClick={() => { setTheme("dark"); setIsThemeMenuOpen(false); }} className="w-full px-3 py-2 flex items-center gap-2 text-sm hover:bg-gray-200 dark:hover:bg-gray-700">
                    <Moon className="w-4 h-4" /> Dark
                  </button>
                </div>
              )}
            </div>
{userEmail ? (
<div className="flex items-center justify-end gap-3">
  {/* Avatar with initial */}
<UserAvatar email={userEmail} isPro={isPro} size={32} />



  {/* User email */}
  <span className="hidden sm:block text-sm text-gray-300">{userEmail}</span>

  {/* Dev-only toggle */}
  {process.env.NODE_ENV !== "production" && userEmail === DEV_EMAIL && (
    <button
      onClick={async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { error } = await supabase
          .from("user_flags")
          .upsert({ user_id: user.id, is_pro: !isPro });
        if (!error) {
          setIsPro(!isPro);
          toast.success(`Dev toggle: Pro ${!isPro ? "enabled" : "disabled"}`);
        }
      }}
      className={`px-3 py-1 rounded-lg text-xs font-medium ${
        isPro
          ? "bg-emerald-600 hover:bg-emerald-500 text-white"
          : "bg-gray-700 hover:bg-gray-600 text-gray-200"
      }`}
    >
      Dev: {isPro ? "Pro ON" : "Pro OFF"}
    </button>
  )}

  {/* Profile link */}
  <Link
    href="/dashboard/profile"
    className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-800 hover:bg-gray-700 text-gray-200"
  >
    Profile
  </Link>

  {/* Logout */}
  <button
    onClick={handleLogout}
    className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200"
    aria-label="Logout"
  >
    <LogOut className="w-5 h-5" />
  </button>
</div>
) : (
  <div className="flex items-center gap-2">
    <button
      onClick={() => setIsLoginOpen(true)}
      className={`p-2 rounded-md ${neutralButton}`}
      aria-label="Login"
    >
      <LogIn className="w-4 h-4" /> Log In
    </button>
    <button
      onClick={() => setIsSignUpOpen(true)}
      className={`p-2 rounded-md ${accentButton("violet")}`}
      aria-label="Sign Up"
    >
      <UserPlus className="w-4 h-4" /> Sign Up
    </button>
  </div>
)}
          </div>
        </div>
      </header>

      {/* ===== Main ===== */}
      <main className="max-w-6xl mx-auto px-4 py-6 flex-1">
        {userEmail ? (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <StatCard title="Total Subscriptions" value={totalSubscriptions.toString()} colour="violet" statTextColours={statTextColours} cardBg={cardBg} cardBorder={cardBorder} />
              <StatCard title="Active Services" value={activeServices.toString()} colour="blue" statTextColours={statTextColours} cardBg={cardBg} cardBorder={cardBorder} />
              <StatCard title="Monthly Spending" value={`${monthlySpending.toFixed(2)}`} colour="emerald" statTextColours={statTextColours} cardBg={cardBg} cardBorder={cardBorder} />
              <StatCard title="Yearly Projection" value={`${yearlyProjection.toFixed(2)}`} colour="rose" statTextColours={statTextColours} cardBg={cardBg} cardBorder={cardBorder} />
            </div>

            {/* Subscriptions + Upcoming */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Subscriptions List */}
              <section className={`lg:col-span-2 rounded-xl shadow-sm p-4 ${cardBg} ${cardBorder}`}>
                <h2 className="text-lg font-semibold mb-3">Your Subscriptions</h2>
                {subscriptions.length > 0 && (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                    <input
                      type="text"
                      placeholder="Search subscriptions..."
                      value={filterTerm}
                      onChange={(e) => setFilterTerm(e.target.value)}
                      className={`flex-1 px-3 py-2 rounded-md text-sm border ${isDark ? "bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-400" : "bg-gray-100 border-gray-300 text-gray-800 placeholder-gray-500"}`}
                    />
                    <select
                      value={sortOption}
                      onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                        setSortOption(e.target.value as SortOption)
                      }
                      className={`px-3 py-2 rounded-md text-sm border ${isDark ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-gray-100 border-gray-300 text-gray-800"}`}
                    >
                      <option value="name">Sort by Name</option>
                      <option value="amountAsc">Amount (Low → High)</option>
                      <option value="amountDesc">Amount (High → Low)</option>
                      <option value="renewalAsc">Renewal (Soonest)</option>
                      <option value="renewalDesc">Renewal (Farthest)</option>
                    </select>
                  </div>
                )}
                {subscriptions.length === 0 ? (
                  <p className="text-sm">
                    You have no subscriptions yet.{" "}
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className={`underline ${isDark ? "text-violet-400 hover:text-violet-300" : "text-indigo-600 hover:text-indigo-500"}`}
                    >
                      Add your first subscription →
                    </button>
                  </p>
                ) : (
                  <ul className={`divide-y ${isDark ? "divide-gray-800" : "divide-gray-200"}`}>
                    {displaySubscriptions.map((sub) => {
                      const meta = renewalMeta(sub);
                      return (
                        <li key={sub.id} className="py-3 flex justify-between items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <h3 className={`${isDark ? "text-violet-300" : "text-indigo-600"} font-medium`}>{sub.name}</h3>
                            <p className={`${isDark ? "text-gray-400" : "text-gray-500"} text-xs capitalize`}>
                              {sub.cadence} • {meta.dueLabel}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`${isDark ? "text-emerald-400" : "text-green-600"} font-semibold whitespace-nowrap`}>
                              {sub.currency} {sub.amount.toFixed(2)}
                            </span>
                            <button onClick={() => handleEditSubscription(sub)} className={`p-2 rounded-md ${neutralButton}`} aria-label={`Edit ${sub.name}`}>
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleInitiateDelete(sub)}
                              disabled={deletingId === sub.id}
                              className={`p-2 rounded-md ${
                                isDark ? "bg-rose-900/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40" : "bg-red-100 hover:bg-red-200 text-red-700 border border-red-300"
                              }`}
                              aria-label={`Delete ${sub.name}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>

              {/* Upcoming Payments */}
              <aside className={`rounded-xl shadow-sm p-4 ${cardBg} ${cardBorder}`}>
                <h3 className="text-lg font-semibold mb-3">Upcoming Payments</h3>
                {upcoming.length === 0 ? (
                  <p className="text-sm">No upcoming payments.</p>
                ) : (
                  <>
                    <ul className={`divide-y ${isDark ? "divide-gray-800" : "divide-gray-200"}`}>
                      {upcoming.map((item) => (
                        <li key={`${item.name}-${item.next.toISOString()}`} className="py-3">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className={`${isDark ? "text-violet-300" : "text-indigo-600"} text-sm font-medium`}>{item.name}</p>
                              <p className={`${isDark ? "text-gray-400" : "text-gray-500"} text-xs`}>{item.dueLabel}</p>
                            </div>
                            <div className={`${isDark ? "text-emerald-400" : "text-green-600"} text-sm font-semibold`}>
                              {item.currency} {item.amount.toFixed(2)}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                    {next30DaysSpending > 0 && (
                      <div className={`mt-4 text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                        Total due next 30 days:
                        <span className={`${isDark ? "text-emerald-400" : "text-green-600"} font-semibold ml-1`}>${next30DaysSpending.toFixed(2)}</span>
                      </div>
                    )}
                  </>
                )}
              </aside>
            </div>

            {/* Suggestions */}
            {duplicateServices.length > 0 && (
              <div className={`mt-6 rounded-xl shadow-sm p-4 ${cardBg} ${cardBorder}`}>
                <h3 className="text-lg font-semibold mb-3">Suggestions</h3>
                {duplicateServices.map(([name]) => (
                  <div key={name} className="mb-3 flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium">Duplicate subscriptions for {name}</p>
                      <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>You have more than one {name} subscription. Consider cancelling duplicates.</p>
                    </div>
                    <button onClick={() => handleCancelDuplicates(name)} className={`px-3 py-1.5 rounded-md text-sm ${accentButton("rose")}`}>
                      Cancel duplicates
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Charts */}
            <div className="flex justify-end my-4">
              <button onClick={() => setSideBySide(!sideBySide)} className={`px-4 py-2 rounded-lg transition ${accentButton("violet")}`}>
                Toggle Charts {sideBySide ? "(Stacked)" : "(Side-by-Side)"}
              </button>
            </div>
            <div className={`${sideBySide ? "grid grid-cols-1 md:grid-cols-2 gap-6" : "flex flex-col gap-6"}`}>
              {/* Spending by Service */}
              <div className={`rounded-xl shadow-sm p-4 ${cardBg} ${cardBorder}`}>
                <h3 className="text-lg font-semibold mb-3">Spending by Service</h3>
                <div className="h-64">
  {ready && !loading && (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 30, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#374151" : "#E5E7EB"} />
        <XAxis dataKey="name" stroke={isDark ? "#9CA3AF" : "#6B7280"} />
        <YAxis domain={[0, barYAxisMax]} ticks={barYAxisTicks} stroke={isDark ? "#9CA3AF" : "#6B7280"} />
        <Tooltip contentStyle={{ backgroundColor: isDark ? "#111827" : "#FFFFFF" }} />
        <Bar dataKey="amount" fill={isDark ? "#8b5cf6" : "#6366F1"} radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )}
</div>

              </div>

              {/* Monthly Projection */}
              <div className={`rounded-xl shadow-sm p-4 ${cardBg} ${cardBorder}`}>
                <h3 className="text-lg font-semibold mb-3">Monthly Projection</h3>
                <div className="h-64">
  {ready && !loading && (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={projectionData} margin={{ top: 5, right: 20, bottom: 30, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#374151" : "#E5E7EB"} />
        <XAxis dataKey="month" stroke={isDark ? "#9CA3AF" : "#6B7280"} />
        <YAxis domain={[0, lineYAxisMax]} ticks={lineYAxisTicks} stroke={isDark ? "#9CA3AF" : "#6B7280"} />
        <Tooltip contentStyle={{ backgroundColor: isDark ? "#111827" : "#FFFFFF" }} />
        <Legend />
        <Line type="monotone" dataKey="spending" stroke={isDark ? "#10B981" : "#047857"} strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  )}
</div>

              </div>
            </div>

            {/* Feature Cards */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className={`rounded-xl shadow-sm p-4 ${cardBg} ${cardBorder}`}>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <LinkIcon className="w-5 h-5" /> Account Linking &amp; Import
                </h3>
                <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"} mb-4`}>Connect your bank accounts or upload a CSV to automatically detect recurring charges.</p>
                <div className="flex flex-col gap-2">
                  <button onClick={() => setIsLinkModalOpen(true)} className={`px-3 py-2 rounded-md flex items-center gap-2 ${accentButton("emerald")}`}>
                    <LinkIcon className="w-4 h-4" /> Link Account
                  </button>
                  <button onClick={() => setIsUploadModalOpen(true)} className={`px-3 py-2 rounded-md flex items-center gap-2 ${accentButton("violet")}`}>
                    <UploadCloud className="w-4 h-4" /> Import CSV
                  </button>
                </div>
                {linkedAccounts.length > 0 && (
                  <ul className="mt-3 text-xs list-disc pl-4">
                    {linkedAccounts.map((acc, idx) => (
                      <li key={idx} className={isDark ? "text-gray-400" : "text-gray-600"}>
                        {acc}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className={`rounded-xl shadow-sm p-4 ${cardBg} ${cardBorder}`}>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Bell className="w-5 h-5" /> Alerts &amp; Notifications
                </h3>
                <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"} mb-4`}>Stay on top of renewals, overspending and free trials with customizable alerts.</p>
                <button onClick={() => setIsAlertsModalOpen(true)} className={`px-3 py-2 rounded-md flex items-center gap-2 ${accentButton("violet")}`}>
                  <Bell className="w-4 h-4" /> Manage Alerts
                </button>
              </div>
              <div className={`rounded-xl shadow-sm p-4 ${cardBg} ${cardBorder}`}>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5" /> Account Sharing
                </h3>
                <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"} mb-4`}>Invite family members or housemates to share your dashboard and collaborate.</p>
                <button onClick={() => setIsShareModalOpen(true)} className={`px-3 py-2 rounded-md flex items-center gap-2 ${accentButton("violet")}`}>
                  <Users className="w-4 h-4" /> Share Dashboard
                </button>
              </div>
              <div className={`rounded-xl shadow-sm p-4 ${cardBg} ${cardBorder}`}>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Download className="w-5 h-5" /> Data Export
                </h3>
                <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"} mb-4`}>Export your subscription data for budgeting or record keeping.</p>
                <button onClick={() => setIsExportModalOpen(true)} className={`px-3 py-2 rounded-md flex items-center gap-2 ${accentButton("emerald")}`}>
                  <Download className="w-4 h-4" /> Export
                </button>
              </div>
            </div>
          </>
        ) : (
          // Logged out landing
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <h2 className="text-2xl font-semibold mb-4">Welcome to CashDuezy</h2>
            <p className="mb-6 max-w-md">Please log in to view and manage your subscriptions. Once logged in, you can add services, track spending, and see upcoming payments.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 max-w-4xl mx-auto">
              {features.map((feat) => {
                const IconComp = feat.icon;
                return (
                  <div key={feat.title} className={`p-4 rounded-lg shadow-sm ${cardBg} ${cardBorder}`}>
                    <IconComp className={`w-5 h-5 mb-2 ${isDark ? "text-violet-300" : "text-indigo-600"}`} />
                    <h4 className="text-lg font-semibold mb-2">{feat.title}</h4>
                    <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>{feat.description}</p>
                  </div>
                );
              })}
            </div>
            <button onClick={() => setIsLoginOpen(true)} className={`px-6 py-3 rounded-lg ${accentButton("violet")}`}>
              Log In
            </button>
          </div>
        )}
      </main>

      {/* ===== Modals ===== */}

      {/* Add Subscription Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className={`rounded-xl shadow-lg p-6 w-full max-w-md ${cardBg} ${cardBorder}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Add Subscription</h2>
              <button onClick={() => setIsModalOpen(false)} className={`${isDark ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"}`}>
                ✕
              </button>
            </div>
            <div className="flex flex-col gap-3">
              <select value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={`px-3 py-2 rounded-md border ${isDark ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-gray-100 border-gray-300 text-gray-800"}`}>
                <option value="">Select a service</option>
                <option value="Netflix">Netflix</option>
                <option value="Hulu">Hulu</option>
                <option value="Disney+">Disney+</option>
                <option value="Spotify">Spotify</option>
                <option value="Amazon Prime">Amazon Prime</option>
                <option value="Apple TV+">Apple TV+</option>
                <option value="HBO Max">HBO Max</option>
                <option value="Custom">Other (custom)</option>
              </select>
              {form.name === "Custom" && (
                <input
                  type="text"
                  placeholder="Name of service"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className={`px-3 py-2 rounded-md border ${isDark ? "bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-400" : "bg-gray-100 border-gray-300 text-gray-800 placeholder-gray-500"}`}
                />
              )}
              <input
                type="number"
                placeholder="Amount"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className={`px-3 py-2 rounded-md border ${isDark ? "bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-400" : "bg-gray-100 border-gray-300 text-gray-800 placeholder-gray-500"}`}
              />
              <select
                value={form.cadence}
                onChange={(e) => setForm({ ...form, cadence: e.target.value as "monthly" | "yearly" })}
                className={`px-3 py-2 rounded-md border ${isDark ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-gray-100 border-gray-300 text-gray-800"}`}
              >
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
              <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className={`px-3 py-2 rounded-md border ${isDark ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-gray-100 border-gray-300 text-gray-800"}`}>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="JPY">JPY (¥)</option>
                <option value="INR">INR (₹)</option>
                <option value="CNY">CNY (¥)</option>
              </select>
              <input type="date" value={form.next_charge_date} onChange={(e) => setForm({ ...form, next_charge_date: e.target.value })} className={`px-3 py-2 rounded-md border ${isDark ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-gray-100 border-gray-300 text-gray-800"}`} />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setIsModalOpen(false)} className={`px-4 py-2 rounded-md ${neutralButton}`}>
                Cancel
              </button>
              <button onClick={handleAddSubscription} disabled={saving} className={`px-4 py-2 rounded-md ${saving ? "bg-gray-600 cursor-not-allowed text-white" : accentButton("violet")}`}>
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
            {!isPro && hasFreeLimitReached && (
              <p className={`mt-4 text-sm ${isDark ? "text-rose-300" : "text-red-600"}`}>You&apos;ve reached your free subscription limit. Please upgrade to Pro to add more subscriptions.</p>
            )}
          </div>
        </div>
      )}

      {/* Edit Subscription Modal */}
      {isEditModalOpen && editingSubscription && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className={`rounded-xl shadow-lg p-6 w-full max-w-md ${cardBg} ${cardBorder}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Edit {editingSubscription.name}</h2>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingSubscription(null);
                }}
                className={`${isDark ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"}`}
              >
                ✕
              </button>
            </div>
            <div className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Service Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={`px-3 py-2 rounded-md border ${isDark ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-gray-100 border-gray-300 text-gray-800"}`}
              />
              <input
                type="number"
                placeholder="Amount"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className={`px-3 py-2 rounded-md border ${isDark ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-gray-100 border-gray-300 text-gray-800"}`}
              />
              <select
                value={form.cadence}
                onChange={(e) => setForm({ ...form, cadence: e.target.value as "monthly" | "yearly" })}
                className={`px-3 py-2 rounded-md border ${isDark ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-gray-100 border-gray-300 text-gray-800"}`}
              >
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
              <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className={`px-3 py-2 rounded-md border ${isDark ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-gray-100 border-gray-300 text-gray-800"}`}>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="JPY">JPY (¥)</option>
                <option value="INR">INR (₹)</option>
                <option value="CNY">CNY (¥)</option>
              </select>
              <input type="date" value={form.next_charge_date} onChange={(e) => setForm({ ...form, next_charge_date: e.target.value })} className={`px-3 py-2 rounded-md border ${isDark ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-gray-100 border-gray-300 text-gray-800"}`} />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingSubscription(null);
                }}
                className={`px-4 py-2 rounded-md ${neutralButton}`}
              >
                Cancel
              </button>
              <button onClick={handleUpdateSubscription} className={`px-4 py-2 rounded-md ${accentButton("emerald")}`}>
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Subscription Modal */}
      {isDeleteModalOpen && subscriptionToDelete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className={`rounded-xl shadow-lg p-6 w-full max-w-md ${cardBg} ${cardBorder}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Cancel {subscriptionToDelete.name}?</h2>
              <button onClick={handleCancelDelete} className={`${isDark ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"}`}>
                ✕
              </button>
            </div>
            <p className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"} mb-4`}>This will permanently cancel your {subscriptionToDelete.name} subscription. You can&apos;t undo this action.</p>
            <div className="flex justify-end gap-3">
              <button onClick={handleCancelDelete} className={`px-4 py-2 rounded-md ${neutralButton}`}>
                Keep
              </button>
              <button onClick={handleConfirmDelete} className={`px-4 py-2 rounded-md ${accentButton("rose")}`}>
                Cancel Subscription
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      {isLoginOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className={`rounded-xl shadow-lg p-6 w-full max-w-md ${cardBg} ${cardBorder}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Log In</h2>
              <button onClick={() => setIsLoginOpen(false)} className={`${isDark ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"}`}>
                ✕
              </button>
            </div>
            <div className="flex flex-col gap-3">
              <input
  type="email"
  placeholder="Email"
  value={loginForm.email}
  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
  onKeyDown={(e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  }}
  className={`px-3 py-2 rounded-md border ${isDark ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-gray-100 border-gray-300 text-gray-800"}`}
/>

              <div className="relative">
                <input
                  type={showLoginPassword ? "text" : "password"}
                  placeholder="Password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleLogin();
                    }
                  }}
                  className={`w-full px-3 py-2 rounded-md border ${isDark ? "bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-400" : "bg-gray-100 border-gray-300 text-gray-800 placeholder-gray-500"}`}
                />
                <button type="button" onClick={() => setShowLoginPassword(!showLoginPassword)} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700">
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotOpen(true);
                    setForgotEmail(loginForm.email);
                  }}
                  className={`text-sm underline ${isDark ? "text-violet-400 hover:text-violet-300" : "text-indigo-600 hover:text-indigo-500"}`}
                >
                  Forgot your password?
                </button>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setIsLoginOpen(false)} className={`px-4 py-2 rounded-md ${neutralButton}`}>
                Cancel
              </button>
              <button onClick={handleLogin} disabled={loginSaving} className={`px-4 py-2 rounded-md ${loginSaving ? "bg-gray-600 cursor-not-allowed text-white" : accentButton("violet")}`}>
                {loginSaving ? "Logging in..." : "Log In"}
              </button>
            </div>
            <div className="text-sm text-center mt-4">
              Don&apos;t have an account?{" "}
              <button
                onClick={() => {
                  setIsLoginOpen(false);
                  setIsSignUpOpen(true);
                }}
                className={`underline ${isDark ? "text-violet-400 hover:text-violet-300" : "text-indigo-600 hover:text-indigo-500"}`}
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Signup Modal */}
      {isSignUpOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className={`rounded-xl shadow-lg p-6 w-full max-w-md ${cardBg} ${cardBorder}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Create your account</h2>
              <button onClick={() => setIsSignUpOpen(false)} className={`${isDark ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"}`}>
                ✕
              </button>
            </div>
            <div className="flex flex-col gap-3">
              <input
  type="email"
  placeholder="Email"
  value={signUpForm.email}
  onChange={(e) => setSignUpForm({ ...signUpForm, email: e.target.value })}
  onKeyDown={(e) => {
    if (e.key === "Enter") {
      handleSignUp();
    }
  }}
  className={`px-3 py-2 rounded-md border ${
    isDark
      ? "bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-400"
      : "bg-gray-100 border-gray-300 text-gray-800 placeholder-gray-500"
  }`}
/>

              <div className="relative">
                <input
  type={showSignUpPassword ? "text" : "password"}
  placeholder="Password"
  value={signUpForm.password}
  onChange={(e) => setSignUpForm({ ...signUpForm, password: e.target.value })}
  onKeyDown={(e) => {
    if (e.key === "Enter") {
      handleSignUp();
    }
  }}
  className={`w-full px-3 py-2 rounded-md border ${
    isDark
      ? "bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-400"
      : "bg-gray-100 border-gray-300 text-gray-800 placeholder-gray-500"
  }`}
/>
                <button type="button" onClick={() => setShowSignUpPassword(!showSignUpPassword)} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700">
                  {showSignUpPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Password must be at least 6 characters.</p>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setIsSignUpOpen(false)} className={`px-4 py-2 rounded-md ${neutralButton}`}>
                Cancel
              </button>
              <button onClick={handleSignUp} disabled={signUpSaving} className={`px-4 py-2 rounded-md ${signUpSaving ? "bg-gray-600 cursor-not-allowed text-white" : accentButton("emerald")}`}>
                {signUpSaving ? "Creating..." : "Sign Up"}
              </button>
            </div>
            <div className="text-sm text-center mt-4">
              Already have an account?{" "}
              <button
                onClick={() => {
                  setIsSignUpOpen(false);
                  setIsLoginOpen(true);
                }}
                className={`underline ${isDark ? "text-violet-400 hover:text-violet-300" : "text-indigo-600 hover:text-indigo-500"}`}
              >
                Log In
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {isForgotOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className={`rounded-xl shadow-lg p-6 w-full max-w-md ${cardBg} ${cardBorder}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Reset your password</h2>
              <button onClick={() => setIsForgotOpen(false)} className={`${isDark ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"}`}>
                ✕
              </button>
            </div>
            <p className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"} mb-4`}>
              Enter your email address and we&apos;ll send you a link to reset your password. If an account with that email exists, you&apos;ll receive a message shortly.
            </p>
            <input
              type="email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              placeholder="Email"
              className={`w-full px-3 py-2 rounded-md mb-4 border ${isDark ? "bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-400" : "bg-gray-100 border-gray-300 text-gray-800 placeholder-gray-500"}`}
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setIsForgotOpen(false)} className={`px-4 py-2 rounded-md ${neutralButton}`}>
                Cancel
              </button>
              <button onClick={handleForgotPassword} disabled={forgotSaving} className={`px-4 py-2 rounded-md ${forgotSaving ? "bg-gray-600 cursor-not-allowed text-white" : accentButton("violet")}`}>
                {forgotSaving ? "Sending..." : "Send Reset Link"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Modals */}
      {activeFooterModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className={`rounded-xl shadow-lg p-6 w-full max-w-2xl ${cardBg} ${cardBorder} overflow-y-auto max-h-[80vh]`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">
                {activeFooterModal === "about"
                  ? "About CashDuezy"
                  : activeFooterModal === "contact"
                  ? "Contact"
                  : activeFooterModal === "privacy"
                  ? "Privacy Policy"
                  : "Terms of Service"}
              </h2>
            <button onClick={() => setActiveFooterModal(null)} className={`${isDark ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"}`}>✕</button>
            </div>
            {activeFooterModal === "about" && aboutContent}
            {activeFooterModal === "contact" && contactContent}
            {activeFooterModal === "privacy" && privacyContent}
            {activeFooterModal === "terms" && termsContent}
          </div>
        </div>
      )}

      {/* Link Modal */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className={`rounded-xl shadow-lg p-6 w-full max-w-md ${cardBg} ${cardBorder}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Link a Bank Account</h2>
              <button onClick={() => setIsLinkModalOpen(false)} className={`${isDark ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"}`}>
                ✕
              </button>
            </div>
            <p className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"} mb-4`}>
              Securely connect your bank or credit account to automatically detect recurring charges. This feature is in beta – linking is simulated.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setIsLinkModalOpen(false)} className={`px-4 py-2 rounded-md ${neutralButton}`}>
                Cancel
              </button>
              <button onClick={handleLinkBank} className={`px-4 py-2 rounded-md ${accentButton("emerald")}`}>
                Link Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className={`rounded-xl shadow-lg p-6 w-full max-w-md ${cardBg} ${cardBorder}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Import CSV</h2>
              <button onClick={() => setIsUploadModalOpen(false)} className={`${isDark ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"}`}>
                ✕
              </button>
            </div>
            <p className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"} mb-4`}>
              Upload a CSV file with columns: name, amount, currency (optional), cadence (optional). Each line should represent one subscription.
            </p>
            <input type="file" accept=".csv,text/csv" onChange={(e) => handleImportCSV(e.target.files)} className={`w-full ${isDark ? "text-gray-300" : "text-gray-700"} mb-4`} />
            <div className="flex justify-end">
              <button onClick={() => setIsUploadModalOpen(false)} className={`px-4 py-2 rounded-md ${neutralButton}`}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alerts Modal */}
      {isAlertsModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className={`rounded-xl shadow-lg p-6 w-full max-w-md ${cardBg} ${cardBorder}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Manage Alerts</h2>
              <button onClick={() => setIsAlertsModalOpen(false)} className={`${isDark ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"}`}>
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={alertSettings.renewal} onChange={(e) => setAlertSettings({ ...alertSettings, renewal: e.target.checked })} />
                Notify me before upcoming renewals
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={alertSettings.freeTrial} onChange={(e) => setAlertSettings({ ...alertSettings, freeTrial: e.target.checked })} />
                Remind me when free trials are about to end
              </label>
              <div className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={alertSettings.overspending} onChange={(e) => setAlertSettings({ ...alertSettings, overspending: e.target.checked })} />
                <span>Alert me if I spend more than</span>
                <input
                  type="number"
                  disabled={!alertSettings.overspending}
                  className={`px-2 py-1 rounded-md w-20 border ${isDark ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-gray-100 border-gray-300 text-gray-800"}`}
                  value={alertSettings.overspendingThreshold}
                  onChange={(e) => setAlertSettings({ ...alertSettings, overspendingThreshold: Number(e.target.value) })}
                />
                <span>per month</span>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setIsAlertsModalOpen(false)} className={`px-4 py-2 rounded-md ${neutralButton}`}>
                Cancel
              </button>
              <button onClick={handleSaveAlerts} className={`px-4 py-2 rounded-md ${accentButton("violet")}`}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className={`rounded-xl shadow-lg p-6 w-full max-w-md ${cardBg} ${cardBorder}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Share Dashboard</h2>
              <button onClick={() => setIsShareModalOpen(false)} className={`${isDark ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"}`}>
                ✕
              </button>
            </div>
            <p className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"} mb-4`}>Invite a family member, partner, roommate or trusted friend to view your subscriptions. You can revoke access at any time.</p>
            <input
              type="email"
              placeholder="Enter email address"
              value={shareEmail}
              onChange={(e) => setShareEmail(e.target.value)}
              className={`w-full px-3 py-2 rounded-md mb-4 border ${isDark ? "bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-400" : "bg-gray-100 border-gray-300 text-gray-800 placeholder-gray-500"}`}
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setIsShareModalOpen(false)} className={`px-4 py-2 rounded-md ${neutralButton}`}>
                Cancel
              </button>
              <button onClick={handleInviteUser} className={`px-4 py-2 rounded-md ${accentButton("violet")}`}>
                Invite
              </button>
            </div>
          </div>
        </div>
      )}

{/* Export Modal */}
{isExportModalOpen && (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
    <div className={`rounded-xl shadow-lg p-6 w-full max-w-sm ${cardBg} ${cardBorder}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Export Data</h2>
        <button onClick={() => setIsExportModalOpen(false)} className={`${isDark ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"}`}>
          ✕
        </button>
      </div>

      {isPro ? (
        <>
          <p className={`text-sm ${isDark ? "text-gray-300" : "text-gray-600"} mb-4`}>
            Choose a format to download your data.
          </p>
          <div className="flex flex-col gap-3">
            <button onClick={handleExportCSV} className={`px-4 py-2 rounded-md flex items-center gap-2 ${accentButton("emerald")}`}>
              <Download className="w-4 h-4" /> CSV
            </button>
            <button onClick={handleExportPDF} className={`px-4 py-2 rounded-md flex items-center gap-2 ${accentButton("violet")}`}>
              <Download className="w-4 h-4" /> PDF
            </button>
          </div>
        </>
      ) : (
        <p className="text-sm text-center text-gray-400">
          Data export is a <span className="font-semibold">Pro feature</span>.{" "}
          <Link href="/pricing" className="underline text-violet-400">
            Upgrade to Pro
          </Link>{" "}
          to enable downloads.
        </p>
      )}
    </div>
  </div>
)}

      <Toaster position="top-right" />
    </div>
  );
}

// Stat card helper
interface StatCardProps {
  title: string;
  value: string;
  colour: "violet" | "blue" | "emerald" | "rose";
  statTextColours: Record<string, string>;
  cardBg: string;
  cardBorder: string;
}
function StatCard({ title, value, colour, statTextColours, cardBg, cardBorder }: StatCardProps) {
  const colourClass = statTextColours[colour];
  return (
    <div className={`rounded-xl shadow-sm p-4 flex flex-col border ${cardBg} ${cardBorder}`}>
      <span className={`text-3xl font-bold mb-1 ${colourClass}`}>{value}</span>
      <span className="text-sm text-gray-500 dark:text-gray-400">{title}</span>
    </div>
  );
}