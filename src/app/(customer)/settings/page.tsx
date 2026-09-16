"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useSkinProfile } from "@/context/skin-profile-context";
import { useTheme } from "@/context/theme-context";
import { useToast } from "@/context/toast-context";
import { AuthService } from "@/services/auth.service";
import { DataExportService } from "@/services/data-export.service";
import type { NotificationPreferences, DataExportRequest } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import {
  Settings,
  User,
  Shield,
  Bell,
  Sun,
  Moon,
  Laptop,
  Download,
  Trash2,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  Sparkles,
  Heart,
  Save,
} from "lucide-react";

export default function CustomerSettingsPage() {
  const router = useRouter();
  const { user, deleteAccount, logout } = useAuth();
  const { profile } = useSkinProfile();
  const { theme, setTheme } = useTheme();
  const { addToast } = useToast();

  const [activeSection, setActiveSection] = React.useState<"account" | "profile" | "appearance" | "notifications" | "privacy">("account");

  // Account details state
  const [name, setName] = React.useState(user?.name || "");
  const [email, setEmail] = React.useState(user?.email || "");
  const [savingAccount, setSavingAccount] = React.useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [changingPassword, setChangingPassword] = React.useState(false);

  // Notification preferences state
  const [notifPrefs, setNotifPrefs] = React.useState<NotificationPreferences>({
    reminders: user?.notificationPreferences?.reminders ?? true,
    progressUpdates: user?.notificationPreferences?.progressUpdates ?? true,
    newRecommendations: user?.notificationPreferences?.newRecommendations ?? true,
    productAlerts: user?.notificationPreferences?.productAlerts ?? true,
    educationalContent: user?.notificationPreferences?.educationalContent ?? false,
  });
  const [savingNotifs, setSavingNotifs] = React.useState(false);

  // Privacy & Data export state
  const [exportRequest, setExportRequest] = React.useState<DataExportRequest | null>(null);
  const [exportLoading, setExportLoading] = React.useState(false);

  // Account deletion modal state
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [deleteConfirmInput, setDeleteConfirmInput] = React.useState("");
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Load export status
  React.useEffect(() => {
    if (user) {
      setExportRequest(DataExportService.getExportStatus(user.id));
    }
  }, [user]);

  // Update Account Info
  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingAccount(true);
    const res = await AuthService.updateAccountDetails(user.id, name, email);
    setSavingAccount(false);
    if (res.success) {
      addToast({ type: "success", title: "Account Updated", description: "Your basic profile details were saved." });
    } else {
      addToast({ type: "error", title: "Update Failed", description: res.error?.message || "Could not update account." });
    }
  };

  // Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (newPassword !== confirmPassword) {
      addToast({ type: "error", title: "Validation Error", description: "New password and confirmation do not match." });
      return;
    }
    if (newPassword.length < 8) {
      addToast({ type: "error", title: "Validation Error", description: "Password must be at least 8 characters long." });
      return;
    }

    setChangingPassword(true);
    const res = await AuthService.changePassword(user.id, currentPassword, newPassword);
    setChangingPassword(false);

    if (res.success) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      addToast({ type: "success", title: "Password Changed", description: "Your security credentials have been updated." });
    } else {
      addToast({ type: "error", title: "Password Change Failed", description: res.error?.message || "Current password incorrect." });
    }
  };

  // Save Notification Preferences
  const handleTogglePref = (key: keyof NotificationPreferences) => {
    setNotifPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveNotifPrefs = async () => {
    if (!user) return;
    setSavingNotifs(true);
    const res = await AuthService.updateNotificationPreferences(user.id, notifPrefs);
    setSavingNotifs(false);
    if (res.success) {
      addToast({ type: "success", title: "Preferences Saved", description: "Notification preferences updated." });
    }
  };

  // Request Data Export
  const handleRequestExport = async () => {
    if (!user) return;
    setExportLoading(true);
    const req = await DataExportService.requestExport(user.id);
    setExportRequest(req);
    setExportLoading(false);
    addToast({
      type: "info",
      title: "Data Export Requested",
      description: "Preparing your customer profile, wishlist, and activity archive JSON...",
    });

    // Check ready state after delay
    setTimeout(() => {
      setExportRequest(DataExportService.getExportStatus(user.id));
    }, 2000);
  };

  // Download Generated Data Export
  const handleDownloadExport = () => {
    if (!user) return;
    const data = DataExportService.generateExportData(user.id);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `beautyiq_data_export_${user.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast({ type: "success", title: "Export Downloaded", description: "JSON data archive saved to your device." });
  };

  // Delete Account
  const handleConfirmDelete = async () => {
    if (deleteConfirmInput.trim() !== "DELETE") {
      addToast({ type: "error", title: "Confirmation Error", description: "Please type DELETE to proceed." });
      return;
    }

    setIsDeleting(true);
    await deleteAccount();
    setIsDeleting(false);
    setShowDeleteModal(false);

    addToast({
      type: "info",
      title: "Account Permanently Deleted",
      description: "Your BeautyIQ profile, history, and preferences have been purged.",
    });

    router.push("/");
  };

  return (
    <div className="space-y-8 max-w-5xl pb-16">
      {/* Header */}
      <div className="border-b border-line pb-6">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="sage" className="flex items-center gap-1 font-semibold text-xs">
            <Settings className="h-3.5 w-3.5" /> Customer Management
          </Badge>
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
          Account &amp; System Settings
        </h1>
        <p className="text-sm text-foreground-muted mt-1">
          Manage your account credentials, skin profile preferences, theme appearance, in-app notification controls, and data privacy.
        </p>
      </div>

      {/* Section Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-line pb-3 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveSection("account")}
          className={`px-4 py-2 rounded-full font-semibold transition-colors flex items-center gap-2 shrink-0 ${
            activeSection === "account"
              ? "bg-sage-deep text-white shadow-xs"
              : "bg-background-card border border-line text-foreground-muted hover:text-foreground"
          }`}
        >
          <User className="h-3.5 w-3.5" /> Account Details
        </button>

        <button
          onClick={() => setActiveSection("profile")}
          className={`px-4 py-2 rounded-full font-semibold transition-colors flex items-center gap-2 shrink-0 ${
            activeSection === "profile"
              ? "bg-sage-deep text-white shadow-xs"
              : "bg-background-card border border-line text-foreground-muted hover:text-foreground"
          }`}
        >
          <Sliders className="h-3.5 w-3.5" /> Skin Profile Summary
        </button>

        <button
          onClick={() => setActiveSection("appearance")}
          className={`px-4 py-2 rounded-full font-semibold transition-colors flex items-center gap-2 shrink-0 ${
            activeSection === "appearance"
              ? "bg-sage-deep text-white shadow-xs"
              : "bg-background-card border border-line text-foreground-muted hover:text-foreground"
          }`}
        >
          <Sun className="h-3.5 w-3.5" /> Appearance &amp; Theme
        </button>

        <button
          onClick={() => setActiveSection("notifications")}
          className={`px-4 py-2 rounded-full font-semibold transition-colors flex items-center gap-2 shrink-0 ${
            activeSection === "notifications"
              ? "bg-sage-deep text-white shadow-xs"
              : "bg-background-card border border-line text-foreground-muted hover:text-foreground"
          }`}
        >
          <Bell className="h-3.5 w-3.5" /> Notification Preferences
        </button>

        <button
          onClick={() => setActiveSection("privacy")}
          className={`px-4 py-2 rounded-full font-semibold transition-colors flex items-center gap-2 shrink-0 ${
            activeSection === "privacy"
              ? "bg-sage-deep text-white shadow-xs"
              : "bg-background-card border border-line text-foreground-muted hover:text-foreground"
          }`}
        >
          <Shield className="h-3.5 w-3.5" /> Privacy &amp; Data
        </button>
      </div>

      {/* SECTION 1: ACCOUNT DETAILS & PASSWORD */}
      {activeSection === "account" && (
        <div className="space-y-8 max-w-2xl">
          {/* Basic Account Info */}
          <div className="rounded-lg border border-line bg-background-card p-6 space-y-6 shadow-subtle">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <h3 className="font-display text-lg font-bold text-foreground">Basic Profile Information</h3>
                <p className="text-xs text-foreground-muted">Update your display name and registered email address.</p>
              </div>
              <Badge variant="sage" className="font-mono text-xs">
                Active Member
              </Badge>
            </div>

            <form onSubmit={handleSaveAccount} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Full Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aanya Sharma"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Email Address</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. customer@beautyiq.com"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end">
                <Button type="submit" variant="accent" size="sm" disabled={savingAccount} leftIcon={<Save className="h-3.5 w-3.5" />}>
                  {savingAccount ? "Saving..." : "Save Account Details"}
                </Button>
              </div>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="rounded-lg border border-line bg-background-card p-6 space-y-6 shadow-subtle">
            <div className="border-b border-line pb-3">
              <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                <Lock className="h-4 w-4 text-sage-deep" /> Change Account Password
              </h3>
              <p className="text-xs text-foreground-muted">
                Ensure your account is using a secure password of at least 8 characters.
              </p>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Current Password</label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">New Password</label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Confirm New Password</label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end">
                <Button type="submit" variant="outline" size="sm" disabled={changingPassword}>
                  {changingPassword ? "Updating..." : "Update Password"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SECTION 2: SKIN PROFILE SUMMARY */}
      {activeSection === "profile" && (
        <div className="space-y-6 max-w-3xl">
          <div className="rounded-lg border border-line bg-background-card p-6 space-y-6 shadow-subtle">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-4">
              <div>
                <h3 className="font-display text-lg font-bold text-foreground">Active Skin Parameters</h3>
                <p className="text-xs text-foreground-muted">
                  These parameters feed directly into recommendation scoring, sensitivity filters, and concern matches.
                </p>
              </div>

              <Link href="/profile">
                <Button variant="accent" size="sm" leftIcon={<Sliders className="h-3.5 w-3.5" />}>
                  Edit Skin Parameters
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded bg-background-elevated space-y-1">
                <span className="text-foreground-faint text-[0.7rem] uppercase font-bold block">Skin Type</span>
                <strong className="text-foreground text-sm font-semibold">{profile.skinType || "Not specified"}</strong>
              </div>

              <div className="p-3.5 rounded bg-background-elevated space-y-1">
                <span className="text-foreground-faint text-[0.7rem] uppercase font-bold block">Sensitivity Level</span>
                <strong className="text-foreground text-sm font-semibold">{profile.sensitivityLevel || "Low"}</strong>
              </div>

              <div className="p-3.5 rounded bg-background-elevated space-y-1 sm:col-span-2">
                <span className="text-foreground-faint text-[0.7rem] uppercase font-bold block">Target Concerns</span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {profile.concerns.length > 0 ? (
                    profile.concerns.map((c) => (
                      <Badge key={c} variant="clay">{c}</Badge>
                    ))
                  ) : (
                    <span className="text-foreground-muted">None specified</span>
                  )}
                </div>
              </div>

              <div className="p-3.5 rounded bg-background-elevated space-y-1 sm:col-span-2">
                <span className="text-foreground-faint text-[0.7rem] uppercase font-bold block">Skincare Goals</span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {profile.goals.length > 0 ? (
                    profile.goals.map((g) => (
                      <Badge key={g} variant="sage">{g}</Badge>
                    ))
                  ) : (
                    <span className="text-foreground-muted">Maintain healthy skin</span>
                  )}
                </div>
              </div>

              <div className="p-3.5 rounded bg-background-elevated space-y-1">
                <span className="text-foreground-faint text-[0.7rem] uppercase font-bold block">Target Budget</span>
                <strong className="text-foreground font-mono">
                  ₹{profile.budget?.min || 300} – ₹{profile.budget?.max || 1200}
                </strong>
              </div>

              <div className="p-3.5 rounded bg-background-elevated space-y-1">
                <span className="text-foreground-faint text-[0.7rem] uppercase font-bold block">Texture Preference</span>
                <strong className="text-foreground font-semibold">{profile.texturePreference || "Gel"}</strong>
              </div>
            </div>

            <div className="pt-2 border-t border-line flex items-center justify-between text-xs">
              <span className="text-foreground-muted">Prefer taking a full guided questionnaire?</span>
              <Link href="/onboarding" className="font-semibold text-sage-deep hover:underline">
                Launch Skincare Questionnaire →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: APPEARANCE & THEME */}
      {activeSection === "appearance" && (
        <div className="space-y-6 max-w-2xl">
          <div className="rounded-lg border border-line bg-background-card p-6 space-y-6 shadow-subtle">
            <div>
              <h3 className="font-display text-lg font-bold text-foreground">Theme Preference</h3>
              <p className="text-xs text-foreground-muted">
                Customize how BeautyIQ appears on your device. Choose between sleek dark mode, clear light mode, or match system preference.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => setTheme("light")}
                className={`p-4 rounded-lg border flex flex-col items-center gap-2 text-center transition-all ${
                  theme === "light"
                    ? "border-sage-deep bg-sage-tint/20 text-foreground font-bold shadow-xs"
                    : "border-line bg-background-card text-foreground-muted hover:border-line-strong"
                }`}
              >
                <Sun className="h-6 w-6 text-amber-500" />
                <span className="text-xs">Light Mode</span>
              </button>

              <button
                onClick={() => setTheme("dark")}
                className={`p-4 rounded-lg border flex flex-col items-center gap-2 text-center transition-all ${
                  theme === "dark"
                    ? "border-sage-deep bg-sage-tint/20 text-foreground font-bold shadow-xs"
                    : "border-line bg-background-card text-foreground-muted hover:border-line-strong"
                }`}
              >
                <Moon className="h-6 w-6 text-sage-deep" />
                <span className="text-xs">Dark Mode</span>
              </button>

              <button
                onClick={() => setTheme("system")}
                className={`p-4 rounded-lg border flex flex-col items-center gap-2 text-center transition-all ${
                  theme === "system"
                    ? "border-sage-deep bg-sage-tint/20 text-foreground font-bold shadow-xs"
                    : "border-line bg-background-card text-foreground-muted hover:border-line-strong"
                }`}
              >
                <Laptop className="h-6 w-6 text-foreground-muted" />
                <span className="text-xs">System Default</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: NOTIFICATION PREFERENCES */}
      {activeSection === "notifications" && (
        <div className="space-y-6 max-w-2xl">
          <div className="rounded-lg border border-line bg-background-card p-6 space-y-6 shadow-subtle">
            <div className="border-b border-line pb-3">
              <h3 className="font-display text-lg font-bold text-foreground">In-App Notification Controls</h3>
              <p className="text-xs text-foreground-muted">
                Control which alerts trigger in-app updates in your notification bell. (Notice: External email/SMS notifications are disabled in V1).
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between p-3 rounded bg-background-elevated">
                <div>
                  <span className="font-semibold text-foreground block">Routine Reminders &amp; Tips</span>
                  <span className="text-foreground-muted text-[0.7rem]">Daily cadence reminders for morning/night steps.</span>
                </div>
                <input
                  type="checkbox"
                  checked={notifPrefs.reminders}
                  onChange={() => handleTogglePref("reminders")}
                  className="h-4 w-4 rounded border-line text-sage-deep focus:ring-sage-deep"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded bg-background-elevated">
                <div>
                  <span className="font-semibold text-foreground block">Profile Progress Updates</span>
                  <span className="text-foreground-muted text-[0.7rem]">Audit reminders when skin profiles require periodic review.</span>
                </div>
                <input
                  type="checkbox"
                  checked={notifPrefs.progressUpdates}
                  onChange={() => handleTogglePref("progressUpdates")}
                  className="h-4 w-4 rounded border-line text-sage-deep focus:ring-sage-deep"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded bg-background-elevated">
                <div>
                  <span className="font-semibold text-foreground block">New Recommendations Alerts</span>
                  <span className="text-foreground-muted text-[0.7rem]">Notifies when high-compatibility formulations enter the catalog.</span>
                </div>
                <input
                  type="checkbox"
                  checked={notifPrefs.newRecommendations}
                  onChange={() => handleTogglePref("newRecommendations")}
                  className="h-4 w-4 rounded border-line text-sage-deep focus:ring-sage-deep"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded bg-background-elevated">
                <div>
                  <span className="font-semibold text-foreground block">Product Price Drops &amp; Availability</span>
                  <span className="text-foreground-muted text-[0.7rem]">Alerts when products on your wishlist drop in price or change stock.</span>
                </div>
                <input
                  type="checkbox"
                  checked={notifPrefs.productAlerts}
                  onChange={() => handleTogglePref("productAlerts")}
                  className="h-4 w-4 rounded border-line text-sage-deep focus:ring-sage-deep"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded bg-background-elevated">
                <div>
                  <span className="font-semibold text-foreground block">Curated Skincare Education</span>
                  <span className="text-foreground-muted text-[0.7rem]">INCI ingredient analysis deep dives and scientific studies.</span>
                </div>
                <input
                  type="checkbox"
                  checked={notifPrefs.educationalContent}
                  onChange={() => handleTogglePref("educationalContent")}
                  className="h-4 w-4 rounded border-line text-sage-deep focus:ring-sage-deep"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  onClick={handleSaveNotifPrefs}
                  variant="accent"
                  size="sm"
                  disabled={savingNotifs}
                  leftIcon={<Save className="h-3.5 w-3.5" />}
                >
                  {savingNotifs ? "Saving..." : "Save Notification Preferences"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 5: PRIVACY & DATA EXPORT */}
      {activeSection === "privacy" && (
        <div className="space-y-8 max-w-2xl">
          {/* Data Export Request */}
          <div className="rounded-lg border border-line bg-background-card p-6 space-y-4 shadow-subtle">
            <div>
              <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                <Download className="h-4 w-4 text-sage-deep" /> Data Portability &amp; Export
              </h3>
              <p className="text-xs text-foreground-muted">
                Download a complete JSON archive of your personal skincare profile, saved wishlist, search history, and recommendation sessions.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-background-elevated border border-line space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">Archive Status:</span>
                {exportRequest ? (
                  <Badge variant={exportRequest.status === "READY" ? "sage" : "warning"} className="font-mono text-xs">
                    {exportRequest.status}
                  </Badge>
                ) : (
                  <span className="text-foreground-muted">No active export request</span>
                )}
              </div>

              {exportRequest && (
                <p className="text-[0.72rem] text-foreground-faint font-mono">
                  Requested on: {exportRequest.requestedAt}
                </p>
              )}

              <div className="pt-2 flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRequestExport}
                  disabled={exportLoading}
                >
                  {exportLoading ? "Submitting Request..." : "Request My Skincare Data"}
                </Button>

                {exportRequest?.status === "READY" && (
                  <Button
                    variant="accent"
                    size="sm"
                    leftIcon={<Download className="h-3.5 w-3.5" />}
                    onClick={handleDownloadExport}
                  >
                    Download JSON Archive (~24KB)
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Account Deletion (Destructive Action) */}
          <div className="rounded-lg border border-rose-300 dark:border-rose-950 bg-rose-500/5 p-6 space-y-4 shadow-subtle">
            <div className="flex items-center gap-2 text-status-error font-bold text-base">
              <AlertTriangle className="h-5 w-5" /> Danger Zone: Permanently Delete Account
            </div>

            <p className="text-xs text-foreground-muted leading-relaxed">
              Once deleted, your user profile, skin parameters, saved wishlist, search history, and recommendation sessions will be permanently purged from the database. This action is irreversible.
            </p>

            <Button
              variant="danger"
              size="sm"
              leftIcon={<Trash2 className="h-4 w-4" />}
              onClick={() => {
                setDeleteConfirmInput("");
                setShowDeleteModal(true);
              }}
            >
              Delete My Account
            </Button>
          </div>
        </div>
      )}

      {/* Account Deletion Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm Permanent Account Deletion"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 rounded bg-rose-500/10 border border-rose-300 text-status-error leading-relaxed">
            <strong>Warning:</strong> You are about to permanently delete your BeautyIQ account. All skin profiles, allergies, wishlist items, and search history will be erased immediately.
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-foreground">
              To confirm, type <strong>DELETE</strong> below:
            </label>
            <Input
              value={deleteConfirmInput}
              onChange={(e) => setDeleteConfirmInput(e.target.value)}
              placeholder="DELETE"
              autoFocus
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              disabled={deleteConfirmInput.trim() !== "DELETE" || isDeleting}
              onClick={handleConfirmDelete}
            >
              {isDeleting ? "Purging Account..." : "Permanently Delete Account"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
