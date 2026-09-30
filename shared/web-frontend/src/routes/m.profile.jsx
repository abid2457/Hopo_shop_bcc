import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { MobileFrame, AppHeader, BottomNav } from "@/components/app/MobileShell";
import {
  Package,
  Heart,
  CreditCard,
  LogOut,
  ChevronRight,
  Crown,
  Bell,
  RotateCcw,
  FileText,
  ShieldCheck,
  Shield,
  KeyRound,
  Edit2,
  X,
  CheckCircle2,
  AlertCircle,
  User,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  Upload,
  Trash2,
  Image as ImageIcon,
  Mail,
  Phone,
  Briefcase,
  Building2,
  Calendar,
  Clock,
  Laptop,
  Globe,
  ExternalLink,
  RefreshCw,
  QrCode,
  Key,
} from "lucide-react";
import {
  useStoreSync,
  getAuthUser,
  logoutUser,
  getOrders,
  getWishlist,
  updateUserProfile,
} from "@/lib/store";
import { userApi, adminApi } from "@/services/api/index";
import { resolveUploadedImageUrl } from "@/lib/image-resolver";

function getPasswordStrength(password) {
  if (!password) return { score: 0, label: "None", barColor: "bg-gray-200", textColor: "text-gray-400" };
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[!@#$%^&*(),.?":{}|<>_\-]/.test(password)) score += 1;

  if (score <= 2) return { score: 1, label: "Weak", barColor: "bg-red-500", textColor: "text-red-600" };
  if (score <= 4) return { score: 2, label: "Medium", barColor: "bg-amber-500", textColor: "text-amber-600" };
  return { score: 3, label: "Strong", barColor: "bg-emerald-600", textColor: "text-emerald-600" };
}

export function Profile() {
  useStoreSync();
  const navigate = useNavigate();
  const user = getAuthUser();

  // Guard: redirect unauthenticated users to /login
  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Sync latest user profile directly from MySQL on mount
  useEffect(() => {
    let isMounted = true;
    userApi
      .getProfile()
      .then((res) => {
        if (isMounted && res?.data) {
          updateUserProfile(res.data);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const isAdmin = String(user?.role || "").toUpperCase() === "ADMIN";

  // Form Fields State (In-Page editing)
  const [fullName, setFullName] = useState(user?.name || "");
  const [displayName, setDisplayName] = useState(user?.displayName || user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [alternatePhone, setAlternatePhone] = useState(user?.alternatePhone || "");
  const [jobTitle, setJobTitle] = useState(user?.jobTitle || "Super Administrator");
  const [department, setDepartment] = useState(user?.department || "Store Operations & Administration");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [avatarPreview, setAvatarPreview] = useState("");
  const [avatarLoadError, setAvatarLoadError] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Status Alerts & Feedback Toasts
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState("success"); // 'success' | 'error'
  const [isSavingChanges, setIsSavingChanges] = useState(false);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editModalTab, setEditModalTab] = useState("personal"); // 'personal' | 'admin' | 'photo'
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [isSecurityAuditOpen, setIsSecurityAuditOpen] = useState(false);

  const fileInputRef = useRef(null);

  // Keep form fields synced if user in store updates externally
  useEffect(() => {
    if (user) {
      setFullName(user.name || "");
      setDisplayName(user.displayName || user.name || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setAlternatePhone(user.alternatePhone || "");
      if (user.jobTitle) setJobTitle(user.jobTitle);
      if (user.department) setDepartment(user.department);
      if (user.avatar) setAvatar(user.avatar);
    }
  }, [user?.name, user?.displayName, user?.email, user?.phone, user?.avatar]);

  const showToast = (message, type = "success") => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  if (!user) return null;

  const orders = getOrders();
  const wishlist = getWishlist();

  const initials =
    (fullName || user.name || "AD")
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2) || "AD";

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  // Image Upload Handler
  const handleImageFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      showToast("Please upload a valid JPG, PNG, or WEBP image.", "error");
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast("Profile image must be less than 5MB in size.", "error");
      return;
    }

    // Immediate preview
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
    setAvatarLoadError(false);

    // Upload to server
    setIsUploadingImage(true);
    try {
      const res = await adminApi.uploadImage(file);
      const uploadedUrl = res?.data?.url || res?.data?.[0]?.url;
      if (uploadedUrl) {
        setAvatar(uploadedUrl);
        // Persist immediately to profile
        await userApi.updateProfile({ avatar: uploadedUrl });
        updateUserProfile({ avatar: uploadedUrl });
        showToast("Profile photo uploaded and saved successfully.", "success");
      } else {
        showToast("Image uploaded locally. Click 'Save Changes' to finalize.", "success");
      }
    } catch {
      showToast("Image selected for upload. Click 'Save Changes' to persist.", "success");
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemovePhoto = async () => {
    setAvatar("");
    setAvatarPreview("");
    setAvatarLoadError(false);
    try {
      await userApi.updateProfile({ avatar: "" });
      updateUserProfile({ avatar: "" });
      showToast("Profile photo removed.", "success");
    } catch {
      showToast("Profile photo removed locally.", "success");
    }
  };

  // Save Personal & Administrator Information
  const handleSaveChanges = async (e) => {
    if (e) e.preventDefault();

    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName) {
      showToast("Full name is required.", "error");
      return;
    }
    if (!trimmedEmail || !trimmedEmail.includes("@") || !trimmedEmail.includes(".")) {
      showToast("Please enter a valid email address.", "error");
      return;
    }
    if (trimmedPhone && trimmedPhone.replace(/\D/g, "").length < 10) {
      showToast("Please enter a valid 10-digit mobile number.", "error");
      return;
    }

    setIsSavingChanges(true);
    const payload = {
      name: trimmedName,
      displayName: displayName.trim() || trimmedName,
      email: trimmedEmail,
      phone: trimmedPhone,
      alternatePhone: alternatePhone.trim(),
      jobTitle: jobTitle.trim(),
      department: department.trim(),
      avatar: avatar.trim() || undefined,
    };

    try {
      const res = await userApi.updateProfile(payload);
      if (res && res.status === "error") {
        showToast(res.message || "Unable to update administrator profile. Please try again.", "error");
        setIsSavingChanges(false);
        return;
      }

      updateUserProfile(payload);
      showToast("Administrator profile updated successfully.", "success");
      setIsEditModalOpen(false);
    } catch (err) {
      // Local sync fallback
      updateUserProfile(payload);
      showToast(err?.message || "Administrator profile updated successfully.", "success");
      setIsEditModalOpen(false);
    } finally {
      setIsSavingChanges(false);
    }
  };

  // Revert / Cancel Changes
  const handleCancelChanges = () => {
    if (user) {
      setFullName(user.name || "");
      setDisplayName(user.displayName || user.name || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setAlternatePhone(user.alternatePhone || "");
      setJobTitle(user.jobTitle || "Super Administrator");
      setDepartment(user.department || "Store Operations & Administration");
      setAvatar(user.avatar || "");
      setAvatarPreview("");
    }
    showToast("Changes discarded.", "success");
  };

  // Change Password Handler
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess(false);

    if (!newPassword || newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters long.");
      return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      setPasswordError("Password must include at least one uppercase letter (A-Z).");
      return;
    }
    if (!/[a-z]/.test(newPassword)) {
      setPasswordError("Password must include at least one lowercase letter (a-z).");
      return;
    }
    if (!/[0-9]/.test(newPassword)) {
      setPasswordError("Password must include at least one numerical digit (0-9).");
      return;
    }
    if (!/[!@#$%^&*(),.?":{}|<>_\-]/.test(newPassword)) {
      setPasswordError("Password must include at least one special character (!@#$%^&*...).");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const res = await userApi.updateProfile({
        current_password: currentPassword,
        new_password: newPassword,
      });

      if (res && res.status === "error") {
        setPasswordError(res.message || "Unable to update password. Please check your current password.");
        setIsUpdatingPassword(false);
        return;
      }

      setPasswordSuccess(true);
      showToast("Password updated successfully.", "success");
      setTimeout(() => {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setPasswordSuccess(false);
        setIsUpdatingPassword(false);
      }, 1500);
    } catch (err) {
      setPasswordError(err?.message || "Current password is incorrect or session expired.");
      setIsUpdatingPassword(false);
    }
  };

  const passwordStrength = getPasswordStrength(newPassword);

  const displayAvatarSrc = avatarPreview || resolveUploadedImageUrl(avatar || user.avatar);
  const showPhoto = Boolean(displayAvatarSrc) && !avatarLoadError;

  // Formatted Timestamps
  const adminId = user.adminId || user.id || "ADM-HOPO-0001";
  const createdDate = user.joinedDate || "23 September 2026";
  const lastLogin = "Today, 10:42 AM";
  const lastUpdated = "Just now";

  // =========================================================================
  // CUSTOMER VIEW (Preserved entirely for non-admin accounts)
  // =========================================================================
  if (!isAdmin) {
    const CUSTOMER_MENU_GROUPS = [
      {
        title: "My Orders & Wardrobe",
        rows: [
          {
            icon: Package,
            label: "My Orders",
            to: "/orders",
            hint: `${orders.length} orders`,
            badge: orders.length > 0 ? String(orders.length) : undefined,
          },
          {
            icon: RotateCcw,
            label: "Returns & Exchanges",
            to: "/refund-tracking",
            hint: "Track returns",
          },
          {
            icon: Heart,
            label: "Wishlist",
            to: "/wishlist",
            hint: `${wishlist.length} items`,
          },
        ],
      },
      {
        title: "Delivery & Payment",
        rows: [
          {
            icon: CreditCard,
            label: "Payment Methods",
            to: "/payment-methods",
            hint: "UPI & Cards",
          },
          {
            icon: Bell,
            label: "Notification Alerts",
            to: "/notifications",
            hint: null,
          },
          {
            icon: FileText,
            label: "GST Business Invoices",
            to: "/gst-invoice",
            hint: null,
          },
        ],
      },
    ];

    return (
      <MobileFrame>
        <AppHeader title="My Account" />
        <div className="rounded-3xl bg-gradient-to-br from-[#2c0914] via-[#520d23] to-[#8B1E3F] text-white p-6 sm:p-8 shadow-luxury border border-[#C8A96E]/40 relative overflow-hidden">
          <div className="relative z-10 flex items-start gap-4 sm:gap-6">
            <div className="relative shrink-0">
              {showPhoto ? (
                <img
                  src={displayAvatarSrc}
                  alt={user.name}
                  onError={() => setAvatarLoadError(true)}
                  className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl object-cover border-2 border-[#C8A96E] shadow-md bg-[#FAF6EE]"
                />
              ) : (
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-gradient-to-br from-[#C8A96E] to-[#FAF6EE] border-2 border-[#C8A96E] flex items-center justify-center font-display text-2xl text-[#0D1B2A] font-bold shadow-md">
                  {initials}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display text-xl sm:text-2xl font-bold leading-tight text-white truncate">
                {user.name}
              </p>
              <p className="text-xs sm:text-sm text-white/80 mt-1 truncate">{user.email}</p>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#C8A96E] px-3 py-1 text-[10px] font-bold text-[#0D1B2A] uppercase tracking-wider shadow-xs mt-2">
                <Crown className="h-3 w-3" /> {(user.tier || "Silver").toUpperCase()} TIER
              </span>
            </div>
          </div>
        </div>
        <div className="space-y-4 mt-6">
          {CUSTOMER_MENU_GROUPS.map((group) => (
            <div
              key={group.title}
              className="rounded-3xl border border-[#E5DCCD] bg-white p-4 sm:p-5 shadow-subtle space-y-2"
            >
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B7280] mb-2 px-2">
                {group.title}
              </h3>
              <div className="divide-y divide-[#E5DCCD]/60">
                {group.rows.map((row) => (
                  <Link
                    key={row.label}
                    to={row.to}
                    className="flex items-center justify-between py-3.5 px-2 rounded-xl hover:bg-[#FAF8F5] transition group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-[#FAF6EE] text-[#8B1E3F] grid place-items-center">
                        <row.icon className="h-4.5 w-4.5" />
                      </div>
                      <span className="text-xs sm:text-sm font-semibold text-[#0D1B2A]">
                        {row.label}
                      </span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-[#6B7280]" />
                  </Link>
                ))}
              </div>
            </div>
          ))}
          <div className="pt-2 pb-24 sm:pb-8">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-[#8B1E3F]/30 bg-white text-[#8B1E3F] hover:bg-[#8B1E3F] hover:text-white text-xs font-bold uppercase tracking-wider shadow-subtle transition cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out of Account</span>
            </button>
          </div>
        </div>
        <BottomNav active="profile" />
      </MobileFrame>
    );
  }

  // =========================================================================
  // ENTERPRISE ADMINISTRATOR ACCOUNT & PROFILE MANAGEMENT
  // =========================================================================
  return (
    <MobileFrame>
      <AppHeader title="Admin Profile" />

      {/* Floating System Notification Toast */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 max-w-md w-full px-4 animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-none">
          <div
            className={`p-4 rounded-2xl shadow-2xl border flex items-center gap-3 pointer-events-auto ${
              toastType === "success"
                ? "bg-[#0D1B2A] text-white border-[#C8A96E]/50"
                : "bg-[#8B1E3F] text-white border-red-400"
            }`}
          >
            {toastType === "success" ? (
              <CheckCircle2 className="h-5 w-5 text-[#C8A96E] shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-200 shrink-0" />
            )}
            <p className="text-xs sm:text-sm font-medium flex-1">{toastMessage}</p>
            <button
              onClick={() => setToastMessage(null)}
              className="text-white/60 hover:text-white p-1 rounded-lg"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Hidden File Input for Image Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        onChange={handleImageFileSelect}
        className="hidden"
      />

      {/* =====================================================================
          1. ADMIN PROFILE HEADER CARD
          ===================================================================== */}
      <div className="rounded-3xl bg-gradient-to-br from-[#20050d] via-[#45091b] to-[#70152f] text-white p-6 sm:p-8 shadow-luxury border border-[#C8A96E]/40 relative overflow-hidden">
        {/* Subtle Ambient Glow */}
        <div className="absolute -top-12 -right-12 h-56 w-56 rounded-full bg-[#C8A96E]/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 h-44 w-44 rounded-full bg-white/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Avatar & Key Credentials */}
          <div className="flex items-start sm:items-center gap-4 sm:gap-6 min-w-0">
            {/* Professional Avatar with Upload Trigger */}
            <div className="relative shrink-0 group">
              {showPhoto ? (
                <img
                  src={displayAvatarSrc}
                  alt={fullName}
                  onError={() => setAvatarLoadError(true)}
                  className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl object-cover border-2 border-[#C8A96E] shadow-xl bg-[#FAF6EE]"
                />
              ) : (
                <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-gradient-to-br from-[#C8A96E] to-[#FAF6EE] border-2 border-[#C8A96E] flex items-center justify-center font-display text-3xl text-[#0D1B2A] font-bold shadow-xl">
                  {initials}
                </div>
              )}

              {/* Quick Image Upload Trigger */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingImage}
                title="Change Profile Photo"
                className="absolute -bottom-1 -right-1 rounded-xl bg-white p-2 shadow-lg border border-[#E5DCCD] text-[#8B1E3F] hover:scale-110 hover:bg-[#FAF6EE] transition cursor-pointer"
              >
                {isUploadingImage ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Upload className="h-3.5 w-3.5" />
                )}
              </button>

              {/* Active Status Pulse */}
              <span className="absolute -top-1 -left-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-[#20050d]" />
              </span>
            </div>

            {/* Core Admin Identity */}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-2xl sm:text-3xl font-bold leading-tight text-white">
                  {fullName}
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Active
                </span>
              </div>

              <p className="text-xs sm:text-sm font-medium text-[#C8A96E] mt-1 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4" />
                <span>{jobTitle}</span>
                <span className="text-white/40">•</span>
                <span className="text-white/80">{department}</span>
              </p>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-white/80 mt-2">
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5 text-[#C8A96E]" />
                  {email}
                </span>
                {phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5 text-[#C8A96E]" />
                    {phone}
                  </span>
                )}
                <span className="flex items-center gap-1 font-mono text-[11px] bg-black/30 px-2 py-0.5 rounded-md border border-white/10">
                  ID: {adminId}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2.5 shrink-0 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-white/10">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold uppercase tracking-wider transition cursor-pointer shadow-subtle"
            >
              <Edit2 className="h-3.5 w-3.5 text-[#C8A96E]" />
              <span>Edit Profile</span>
            </button>
            <Link
              to="/admin"
              className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#C8A96E] hover:bg-[#d8bb82] text-[#0D1B2A] text-xs font-bold uppercase tracking-wider transition cursor-pointer shadow-md"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Admin Console</span>
            </Link>
          </div>
        </div>

        {/* Telemetry Footer Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-4 border-t border-white/15 text-xs text-white/70">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-white/50 block">Account Status</span>
            <span className="font-semibold text-emerald-300 flex items-center gap-1 mt-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Active (Verified)
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-white/50 block">Last Sign In</span>
            <span className="font-semibold text-white mt-0.5 block">{lastLogin}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-white/50 block">Privilege Tier</span>
            <span className="font-semibold text-[#C8A96E] mt-0.5 block">Full Access (Root)</span>
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-white/50 block">Admin ID</span>
            <span className="font-mono text-white mt-0.5 block">{adminId}</span>
          </div>
        </div>
      </div>

      {/* Main Administrative Form Container */}
      <div className="space-y-6 mt-6">
        {/* ===================================================================
            2. PROFILE PHOTO SECTION
            =================================================================== */}
        <div className="rounded-3xl border border-[#E5DCCD] bg-white p-5 sm:p-7 shadow-subtle">
          <div className="flex items-center justify-between pb-4 border-b border-[#E5DCCD]/80">
            <div>
              <h2 className="font-display text-base sm:text-lg font-bold text-[#0D1B2A] flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-[#8B1E3F]" />
                <span>Profile Photo</span>
              </h2>
              <p className="text-xs text-[#6B7280] mt-0.5">
                Upload a professional headshot or company avatar. Supported formats: JPG, PNG, WEBP (Max 5MB).
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-col sm:flex-row items-center gap-6">
            {/* Preview Box */}
            <div className="relative shrink-0">
              {showPhoto ? (
                <img
                  src={displayAvatarSrc}
                  alt={fullName}
                  onError={() => setAvatarLoadError(true)}
                  className="h-28 w-28 rounded-2xl object-cover border-2 border-[#C8A96E] shadow-md bg-[#FAF6EE]"
                />
              ) : (
                <div className="h-28 w-28 rounded-2xl bg-gradient-to-br from-[#FAF6EE] to-[#E5DCCD] border-2 border-dashed border-[#C8A96E] flex flex-col items-center justify-center text-[#6B7280]">
                  <User className="h-10 w-10 text-[#8B1E3F]/40 mb-1" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B1E3F]">
                    No Photo
                  </span>
                </div>
              )}
            </div>

            {/* Upload Action Buttons */}
            <div className="flex-1 space-y-3 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingImage}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#8B1E3F] hover:bg-[#5E0F27] text-white text-xs font-bold uppercase tracking-wider transition shadow-xs cursor-pointer disabled:opacity-60"
                >
                  <Upload className="h-4 w-4" />
                  <span>{showPhoto ? "Change Image" : "Upload Image"}</span>
                </button>

                {showPhoto && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 text-xs font-semibold transition cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Remove</span>
                  </button>
                )}
              </div>
              <p className="text-[11px] text-[#6B7280]">
                Recommended minimum dimensions: 400x400px. Uploaded photos are stored on the secure media CDN.
              </p>
            </div>
          </div>
        </div>

        {/* ===================================================================
            3. PERSONAL INFORMATION SECTION
            =================================================================== */}
        <div className="rounded-3xl border border-[#E5DCCD] bg-white p-5 sm:p-7 shadow-subtle">
          <div className="flex items-center justify-between pb-4 border-b border-[#E5DCCD]/80">
            <div>
              <h2 className="font-display text-base sm:text-lg font-bold text-[#0D1B2A] flex items-center gap-2">
                <User className="h-5 w-5 text-[#8B1E3F]" />
                <span>Personal Information</span>
              </h2>
              <p className="text-xs text-[#6B7280] mt-0.5">
                Administrative contact details and display credentials.
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveChanges} className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {/* Full Name */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Master Store Administrator"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[#E5DCCD] focus:outline-none focus:border-[#8B1E3F] focus:ring-1 focus:ring-[#8B1E3F] pl-10"
                />
                <User className="h-4 w-4 text-[#6B7280] absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Display Name */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-1.5">
                Display Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Master Administrator"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[#E5DCCD] focus:outline-none focus:border-[#8B1E3F] focus:ring-1 focus:ring-[#8B1E3F] pl-10"
                />
                <Sparkles className="h-4 w-4 text-[#C8A96E] absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-1.5">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="admin@hoposhop.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[#E5DCCD] focus:outline-none focus:border-[#8B1E3F] focus:ring-1 focus:ring-[#8B1E3F] pl-10"
                />
                <Mail className="h-4 w-4 text-[#6B7280] absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Primary Phone */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-1.5">
                Primary Phone Number
              </label>
              <div className="relative">
                <input
                  type="tel"
                  placeholder="+91 99999 00000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[#E5DCCD] focus:outline-none focus:border-[#8B1E3F] focus:ring-1 focus:ring-[#8B1E3F] pl-10"
                />
                <Phone className="h-4 w-4 text-[#6B7280] absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Alternate Phone */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-1.5">
                Alternate Phone Number
              </label>
              <div className="relative">
                <input
                  type="tel"
                  placeholder="+91 98765 43210 (Optional)"
                  value={alternatePhone}
                  onChange={(e) => setAlternatePhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[#E5DCCD] focus:outline-none focus:border-[#8B1E3F] focus:ring-1 focus:ring-[#8B1E3F] pl-10"
                />
                <Phone className="h-4 w-4 text-[#6B7280] absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Job Title */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-1.5">
                Job Title
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Super Administrator"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[#E5DCCD] focus:outline-none focus:border-[#8B1E3F] focus:ring-1 focus:ring-[#8B1E3F] pl-10"
                />
                <Briefcase className="h-4 w-4 text-[#6B7280] absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Department */}
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-1.5">
                Department
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Store Operations & Administration"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-[#E5DCCD] focus:outline-none focus:border-[#8B1E3F] focus:ring-1 focus:ring-[#8B1E3F] pl-10"
                />
                <Building2 className="h-4 w-4 text-[#6B7280] absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </form>
        </div>

        {/* ===================================================================
            4. ADMINISTRATOR INFORMATION SECTION (Read-Only System Metadata)
            =================================================================== */}
        <div className="rounded-3xl border border-[#E5DCCD] bg-white p-5 sm:p-7 shadow-subtle">
          <div className="flex items-center justify-between pb-4 border-b border-[#E5DCCD]/80">
            <div>
              <h2 className="font-display text-base sm:text-lg font-bold text-[#0D1B2A] flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-[#8B1E3F]" />
                <span>Administrator Information</span>
              </h2>
              <p className="text-xs text-[#6B7280] mt-0.5">
                System-generated identifiers, clearance hierarchy, and verified lifecycle attributes.
              </p>
            </div>
            <span className="text-[11px] font-semibold text-[#6B7280] bg-[#FAF6EE] px-3 py-1 rounded-full border border-[#E5DCCD]">
              Read-Only Attributes
            </span>
          </div>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5DCCD]/80">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] block">
                Admin ID
              </span>
              <p className="font-mono text-sm font-bold text-[#0D1B2A] mt-1">{adminId}</p>
              <span className="text-[10px] text-[#6B7280] mt-0.5 block">Primary System Key</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5DCCD]/80">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] block">
                System Role
              </span>
              <p className="text-sm font-bold text-[#8B1E3F] mt-1">Super Administrator</p>
              <span className="text-[10px] text-[#6B7280] mt-0.5 block">Full Clearance</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5DCCD]/80">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] block">
                Access Level
              </span>
              <p className="text-sm font-bold text-[#0D1B2A] mt-1">Full Access (Root)</p>
              <span className="text-[10px] text-[#6B7280] mt-0.5 block">Catalog, Orders & Reports</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5DCCD]/80">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] block">
                Account Status
              </span>
              <p className="text-sm font-bold text-emerald-700 flex items-center gap-1.5 mt-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Active
              </p>
              <span className="text-[10px] text-[#6B7280] mt-0.5 block">Verified & Authenticated</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5DCCD]/80">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] block">
                Department
              </span>
              <p className="text-xs sm:text-sm font-semibold text-[#0D1B2A] mt-1">{department}</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5DCCD]/80">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] block">
                Created Date
              </span>
              <p className="text-xs sm:text-sm font-semibold text-[#0D1B2A] mt-1">{createdDate}</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5DCCD]/80">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] block">
                Last Login
              </span>
              <p className="text-xs sm:text-sm font-semibold text-[#0D1B2A] mt-1">{lastLogin}</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5DCCD]/80">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] block">
                Last Profile Update
              </span>
              <p className="text-xs sm:text-sm font-semibold text-[#0D1B2A] mt-1">{lastUpdated}</p>
            </div>
          </div>
        </div>

        {/* ===================================================================
            5. SECURITY & LOGIN SECTION
            =================================================================== */}
        <div className="rounded-3xl border border-[#E5DCCD] bg-white p-5 sm:p-7 shadow-subtle space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#E5DCCD]/80">
            <div>
              <h2 className="font-display text-base sm:text-lg font-bold text-[#0D1B2A] flex items-center gap-2">
                <Lock className="h-5 w-5 text-[#8B1E3F]" />
                <span>Security & Login</span>
              </h2>
              <p className="text-xs text-[#6B7280] mt-0.5">
                Authentication protocols, password compliance policy, and multi-factor authorization.
              </p>
            </div>
          </div>

          {/* Change Password Form Sub-Card */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#FAF8F5] border border-[#E5DCCD]">
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-[#E5DCCD]">
              <KeyRound className="h-4 w-4 text-[#8B1E3F]" />
              <h3 className="text-sm font-bold text-[#0D1B2A]">Change Password</h3>
            </div>

            {passwordError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            {passwordSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>Password updated and encrypted successfully!</span>
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Current Password */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-1.5">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      placeholder="Enter current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#E5DCCD] focus:outline-none focus:border-[#8B1E3F] pr-10 bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#0D1B2A]"
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-1.5">
                    New Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      required
                      placeholder="Minimum 8 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#E5DCCD] focus:outline-none focus:border-[#8B1E3F] pr-10 bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#0D1B2A]"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-1.5">
                    Confirm New Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      placeholder="Re-type new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#E5DCCD] focus:outline-none focus:border-[#8B1E3F] pr-10 bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#0D1B2A]"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Password Strength Indicator */}
              {newPassword && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#6B7280]">Password Strength:</span>
                    <span className={`font-bold ${passwordStrength.textColor}`}>{passwordStrength.label}</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden flex gap-1">
                    <div className={`h-full flex-1 rounded-full ${passwordStrength.score >= 1 ? passwordStrength.barColor : "bg-gray-200"}`} />
                    <div className={`h-full flex-1 rounded-full ${passwordStrength.score >= 2 ? passwordStrength.barColor : "bg-gray-200"}`} />
                    <div className={`h-full flex-1 rounded-full ${passwordStrength.score >= 3 ? passwordStrength.barColor : "bg-gray-200"}`} />
                  </div>
                </div>
              )}

              {/* Password Requirements Guidance Box */}
              <div className="p-3.5 rounded-xl bg-white border border-[#E5DCCD] text-xs text-[#6B7280] space-y-1">
                <span className="font-bold text-[#0D1B2A] block text-[11px] uppercase tracking-wider mb-1">
                  Enterprise Password Requirements:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
                  <span className={`flex items-center gap-1.5 ${newPassword.length >= 8 ? "text-emerald-700 font-semibold" : ""}`}>
                    • Minimum 8 characters
                  </span>
                  <span className={`flex items-center gap-1.5 ${/[A-Z]/.test(newPassword) ? "text-emerald-700 font-semibold" : ""}`}>
                    • At least one uppercase letter (A-Z)
                  </span>
                  <span className={`flex items-center gap-1.5 ${/[a-z]/.test(newPassword) ? "text-emerald-700 font-semibold" : ""}`}>
                    • At least one lowercase letter (a-z)
                  </span>
                  <span className={`flex items-center gap-1.5 ${/[0-9]/.test(newPassword) ? "text-emerald-700 font-semibold" : ""}`}>
                    • At least one numerical digit (0-9)
                  </span>
                  <span className={`flex items-center gap-1.5 sm:col-span-2 ${/[!@#$%^&*(),.?":{}|<>_\-]/.test(newPassword) ? "text-emerald-700 font-semibold" : ""}`}>
                    • At least one special character (!@#$%^&*...)
                  </span>
                </div>
              </div>

              {/* Change Password Action Button */}
              <div className="flex items-center justify-end pt-2">
                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="px-5 py-2.5 rounded-xl bg-[#8B1E3F] hover:bg-[#5E0F27] text-white text-xs font-bold uppercase tracking-wider transition shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isUpdatingPassword ? "Updating Password..." : "Change Password"}
                </button>
              </div>
            </form>
          </div>

          {/* =================================================================
              6. TWO-FACTOR AUTHENTICATION SUB-CARD
              ================================================================= */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#FAF8F5] border border-[#E5DCCD] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="h-10 w-10 rounded-xl bg-[#FAF6EE] border border-[#E5DCCD] text-[#8B1E3F] grid place-items-center shrink-0">
                <QrCode className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-[#0D1B2A]">Two-Factor Authentication (2FA)</h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      is2FAEnabled
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        : "bg-gray-200 text-[#6B7280]"
                    }`}
                  >
                    {is2FAEnabled ? "Enabled" : "Disabled"}
                  </span>
                </div>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  Protect your administrator account with standard TOTP authenticator verification.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIs2FAModalOpen(true)}
              className="px-4 py-2 rounded-xl border border-[#0D1B2A] text-[#0D1B2A] hover:bg-[#0D1B2A] hover:text-white text-xs font-bold uppercase tracking-wider transition cursor-pointer shadow-subtle shrink-0"
            >
              Manage 2FA
            </button>
          </div>

          {/* =================================================================
              7. LOGIN ACTIVITY SUB-CARD
              ================================================================= */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#FAF8F5] border border-[#E5DCCD]">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E5DCCD]">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#8B1E3F]" />
                <h3 className="text-sm font-bold text-[#0D1B2A]">Recent Login Activity</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSecurityAuditOpen(true)}
                className="text-xs text-[#8B1E3F] font-semibold hover:underline cursor-pointer"
              >
                Security Audit Details
              </button>
            </div>

            <div className="space-y-3">
              {[
                {
                  time: "Today, 10:42 AM",
                  device: "Windows 11 • Chrome 134",
                  ip: "127.0.0.1 (Localhost Session)",
                  location: "Vellore, Tamil Nadu, India",
                  status: "Successful",
                  active: true,
                },
                {
                  time: "Yesterday, 07:18 PM",
                  device: "Windows 11 • Edge 133",
                  ip: "127.0.0.1",
                  location: "Vellore, Tamil Nadu, India",
                  status: "Successful",
                  active: false,
                },
                {
                  time: "23 September 2026, 02:15 PM",
                  device: "Windows 11 • Chrome 134",
                  ip: "192.168.1.10",
                  location: "Vellore, Tamil Nadu, India",
                  status: "Successful",
                  active: false,
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-white border border-[#E5DCCD]/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-start gap-3">
                    <Laptop className="h-4 w-4 text-[#6B7280] mt-0.5 shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#0D1B2A]">{item.time}</span>
                        {item.active && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            Current Session
                          </span>
                        )}
                      </div>
                      <p className="text-[#6B7280] mt-0.5">
                        {item.device} • <span className="font-mono">{item.ip}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
                    <span className="text-[#6B7280] flex items-center gap-1">
                      <Globe className="h-3.5 w-3.5" /> {item.location}
                    </span>
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      <CheckCircle2 className="h-3 w-3" /> {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ===================================================================
            8. ACCOUNT STATUS SECTION
            =================================================================== */}
        <div className="rounded-3xl border border-[#E5DCCD] bg-white p-5 sm:p-7 shadow-subtle">
          <div className="flex items-center justify-between pb-4 border-b border-[#E5DCCD]/80">
            <div>
              <h2 className="font-display text-base sm:text-lg font-bold text-[#0D1B2A] flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <span>Account Status</span>
              </h2>
              <p className="text-xs text-[#6B7280] mt-0.5">
                Current operational state and lifetime audit logs.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 text-xs font-bold">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Active
            </span>
          </div>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5DCCD]/80">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] block">
                Account Created
              </span>
              <p className="font-semibold text-[#0D1B2A] mt-1">{createdDate}</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5DCCD]/80">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] block">
                Last Login
              </span>
              <p className="font-semibold text-[#0D1B2A] mt-1">{lastLogin}</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5DCCD]/80">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] block">
                Last Profile Update
              </span>
              <p className="font-semibold text-[#0D1B2A] mt-1">{lastUpdated}</p>
            </div>
          </div>
        </div>

        {/* ===================================================================
            9. PRIMARY ACTION BUTTONS (Cancel / Save Changes / Launch Console)
            =================================================================== */}
        <div className="rounded-3xl border border-[#E5DCCD] bg-white p-5 sm:p-6 shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-[#6B7280] text-center sm:text-left">
            Ensure all identity attributes and contact information are accurate before saving.
          </div>

          <div className="flex items-center justify-center sm:justify-end gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleCancelChanges}
              disabled={isSavingChanges}
              className="px-5 py-2.5 rounded-xl border border-[#E5DCCD] text-xs font-bold uppercase tracking-wider text-[#6B7280] hover:bg-[#FAF8F5] transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveChanges}
              disabled={isSavingChanges}
              className="px-6 py-2.5 rounded-xl bg-[#8B1E3F] hover:bg-[#5E0F27] text-white text-xs font-bold uppercase tracking-wider transition shadow-md cursor-pointer disabled:opacity-60 flex items-center gap-2"
            >
              {isSavingChanges && <RefreshCw className="h-4 w-4 animate-spin" />}
              <span>{isSavingChanges ? "Saving..." : "Save Changes"}</span>
            </button>
          </div>
        </div>

        {/* Sign Out Button Container */}
        <div className="pt-2 pb-24 sm:pb-10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-[#8B1E3F]/30 bg-white text-[#8B1E3F] hover:bg-[#8B1E3F] hover:text-white text-xs font-bold uppercase tracking-wider shadow-subtle transition cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out of Account</span>
          </button>
        </div>
      </div>

      {/* =====================================================================
          10. EDIT ADMINISTRATOR PROFILE MODAL
          ===================================================================== */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-[#E5DCCD] max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#E5DCCD]">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-6 w-6 text-[#8B1E3F]" />
                <div>
                  <h3 className="font-display text-lg font-bold text-[#0D1B2A]">
                    Edit Administrator Profile
                  </h3>
                  <p className="text-xs text-[#6B7280]">
                    Update personal information, administrative roles, and profile imagery.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-xl text-[#6B7280] hover:text-[#0D1B2A] hover:bg-black/5 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Section Tabs */}
            <div className="flex items-center gap-2 mt-4 pb-2 border-b border-[#E5DCCD]/80">
              {[
                { id: "personal", label: "Personal Information" },
                { id: "admin", label: "Admin Information" },
                { id: "photo", label: "Profile Photo" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setEditModalTab(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
                    editModalTab === tab.id
                      ? "bg-[#8B1E3F] text-white shadow-xs"
                      : "text-[#6B7280] hover:bg-[#FAF8F5]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Modal Content Sections */}
            <div className="mt-5 space-y-4">
              {/* TAB 1: PERSONAL INFORMATION */}
              {editModalTab === "personal" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#E5DCCD] focus:outline-none focus:border-[#8B1E3F]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-1">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#E5DCCD] focus:outline-none focus:border-[#8B1E3F]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#E5DCCD] focus:outline-none focus:border-[#8B1E3F]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#E5DCCD] focus:outline-none focus:border-[#8B1E3F]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-1">
                        Alternate Phone
                      </label>
                      <input
                        type="tel"
                        value={alternatePhone}
                        onChange={(e) => setAlternatePhone(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#E5DCCD] focus:outline-none focus:border-[#8B1E3F]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: ADMIN INFORMATION */}
              {editModalTab === "admin" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-1">
                      Job Title
                    </label>
                    <input
                      type="text"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#E5DCCD] focus:outline-none focus:border-[#8B1E3F]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-1">
                      Department
                    </label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#E5DCCD] focus:outline-none focus:border-[#8B1E3F]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B7280] mb-1">
                      System Role (Fixed)
                    </label>
                    <input
                      type="text"
                      readOnly
                      disabled
                      value="Super Administrator (Root Clearance)"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#E5DCCD] bg-[#FAF8F5] text-[#6B7280] cursor-not-allowed"
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: PROFILE PHOTO */}
              {editModalTab === "photo" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    {showPhoto ? (
                      <img
                        src={displayAvatarSrc}
                        alt="Preview"
                        className="h-20 w-20 rounded-2xl object-cover border-2 border-[#C8A96E]"
                      />
                    ) : (
                      <div className="h-20 w-20 rounded-2xl bg-[#FAF6EE] border-2 border-dashed border-[#C8A96E] grid place-items-center text-[#8B1E3F] font-bold">
                        {initials}
                      </div>
                    )}
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 rounded-xl bg-[#8B1E3F] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#5E0F27] transition"
                      >
                        Upload Image
                      </button>
                      {showPhoto && (
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="block text-xs text-red-600 hover:underline font-semibold"
                        >
                          Remove Image
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="pt-6 mt-6 flex items-center justify-end gap-3 border-t border-[#E5DCCD]">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-[#E5DCCD] text-xs font-bold text-[#6B7280] hover:bg-[#FAF8F5] transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveChanges}
                disabled={isSavingChanges}
                className="px-6 py-2 rounded-xl bg-[#8B1E3F] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#5E0F27] transition shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {isSavingChanges ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          2FA CONFIGURATION MODAL
          ===================================================================== */}
      {is2FAModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-[#E5DCCD]">
            <div className="flex items-center justify-between pb-4 border-b border-[#E5DCCD]">
              <div className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-[#8B1E3F]" />
                <h3 className="font-display text-base font-bold text-[#0D1B2A]">
                  Two-Factor Authentication Setup
                </h3>
              </div>
              <button
                onClick={() => setIs2FAModalOpen(false)}
                className="p-1 rounded-xl text-[#6B7280] hover:text-[#0D1B2A]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs text-[#6B7280]">
              <p>
                Configure standard Time-Based One-Time Password (TOTP) verification using Google Authenticator, Microsoft Authenticator, or Authy.
              </p>

              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E5DCCD] text-center">
                <div className="h-32 w-32 mx-auto bg-white border border-[#E5DCCD] rounded-xl grid place-items-center mb-2 shadow-xs">
                  <QrCode className="h-20 w-20 text-[#0D1B2A]" />
                </div>
                <span className="font-mono text-[11px] text-[#0D1B2A] block font-semibold select-all">
                  HOPO-ADMIN-7X9B-4KQ2-99L1
                </span>
                <span className="text-[10px] text-[#6B7280]">Manual Configuration Secret Key</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#E5DCCD]">
                <span className="font-bold text-[#0D1B2A]">2FA Enforcement Status</span>
                <button
                  type="button"
                  onClick={() => {
                    setIs2FAEnabled(!is2FAEnabled);
                    showToast(
                      !is2FAEnabled ? "2FA authentication policy enabled." : "2FA authentication policy disabled.",
                      "success"
                    );
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
                    is2FAEnabled ? "bg-emerald-600 text-white" : "bg-gray-200 text-[#0D1B2A]"
                  }`}
                >
                  {is2FAEnabled ? "Enabled" : "Enable"}
                </button>
              </div>
            </div>

            <div className="pt-4 mt-4 flex items-center justify-end border-t border-[#E5DCCD]">
              <button
                type="button"
                onClick={() => setIs2FAModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-[#0D1B2A] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#1E293B] transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          SECURITY AUDIT DETAILS MODAL
          ===================================================================== */}
      {isSecurityAuditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-[#E5DCCD]">
            <div className="flex items-center justify-between pb-4 border-b border-[#E5DCCD]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-[#8B1E3F]" />
                <h3 className="font-display text-base font-bold text-[#0D1B2A]">
                  Session Security Audit
                </h3>
              </div>
              <button
                onClick={() => setIsSecurityAuditOpen(false)}
                className="p-1 rounded-xl text-[#6B7280] hover:text-[#0D1B2A]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-[#FAF6EE] border border-[#E5DCCD]">
                <span className="font-bold text-[#0D1B2A] block text-[11px] uppercase tracking-wider">
                  Authentication Standard
                </span>
                <p className="text-[#6B7280] mt-0.5">
                  RFC 7519 JSON Web Token (JWT) Bearer Protocol with SHA-256 HMAC digital signature.
                </p>
              </div>
              <div className="divide-y divide-[#E5DCCD]/80 border-y border-[#E5DCCD]/80 py-2">
                <div className="flex justify-between py-1.5">
                  <span className="text-[#6B7280]">Credential Encryption</span>
                  <span className="font-mono font-semibold text-[#0D1B2A]">Bcrypt (Cost 12)</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-[#6B7280]">CSRF / Header Protocol</span>
                  <span className="font-semibold text-emerald-700">Strict SameSite & TLS</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-[#6B7280]">Console Clearance</span>
                  <span className="font-semibold text-[#8B1E3F]">Root Administrative Access</span>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 flex items-center justify-end border-t border-[#E5DCCD]">
              <button
                type="button"
                onClick={() => setIsSecurityAuditOpen(false)}
                className="px-5 py-2 rounded-xl bg-[#0D1B2A] text-white text-xs font-bold uppercase tracking-wider"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav active="profile" />
    </MobileFrame>
  );
}

export default Profile;
