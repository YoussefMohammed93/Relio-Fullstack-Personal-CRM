import { useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Avatar } from "@/components/avatar";
import { Button } from "@/components/button";
import { ConfirmationDialog } from "@/components/confirmation-dialog";
import { Input } from "@/components/input";
import { Switch } from "@/components/switch";
import { Tabs } from "@/components/tabs";
import { authApi, type ProfileInput } from "@/features/auth/auth.api";
import { useAuth } from "@/features/auth/auth-state";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { ImagePlus, Trash2 } from "lucide-react";
import { useNotifications } from "@/providers/notification-provider";

const profileSchema = z.object({
  username: z.string().trim().min(3, "Use at least 3 characters.").max(50),
  displayName: z.string().trim().max(100),
  firstName: z.string().trim().max(80),
  lastName: z.string().trim().max(80),
  bio: z.string().trim().max(500),
  avatarUrl: z
    .string()
    .refine(
      (value) =>
        value === "" ||
        /^https:\/\/\S+$/i.test(value) ||
        value.startsWith("data:image/svg+xml,"),
      "Use an HTTPS image URL.",
    ),
});

type ProfileFields = z.infer<typeof profileSchema>;

function FormNotice({
  message,
  tone = "error",
}: {
  message: string | null;
  tone?: "success" | "error";
}) {
  if (!message) return null;
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={
        tone === "success" ? "text-sm text-success" : "text-sm text-destructive"
      }
    >
      {message}
    </p>
  );
}

function ProfileSettings() {
  const { user, updateProfile } = useAuth();
  const { notify } = useNotifications();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const form = useForm<ProfileFields>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user?.username ?? "",
      displayName: user?.displayName ?? "",
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      bio: user?.bio ?? "",
      avatarUrl: user?.avatarUrl ?? "",
    },
  });

  const submit = form.handleSubmit(async (values) => {
    try {
      const changed = Object.fromEntries(
        Object.entries(values).filter(
          ([key, value]) => value !== user?.[key as keyof typeof user],
        ),
      ) as ProfileInput;
      if (!Object.keys(changed).length) {
        notify({
          title: "Profile is up to date",
          variant: "info",
        });
        return;
      }
      await updateProfile(changed);
      notify({
        title: "Profile saved",
        description: "Your profile changes are now in effect.",
        variant: "success",
      });
    } catch (error) {
      notify({
        title: "Profile could not be saved",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "error",
      });
    }
  });

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    setIsUploadingAvatar(true);
    try {
      const uploaded = await authApi.uploadAvatar(file);
      await updateProfile({ avatarUrl: uploaded.secureUrl });
      form.setValue("avatarUrl", uploaded.secureUrl, { shouldDirty: true });
      notify({
        title: "Profile image updated",
        variant: "success",
      });
    } catch (error) {
      notify({
        title: "Profile image could not be uploaded",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "error",
      });
    } finally {
      setIsUploadingAvatar(false);
      input.value = "";
    }
  };

  const removeAvatar = async () => {
    try {
      await updateProfile({ avatarUrl: "" });
      form.setValue("avatarUrl", "", { shouldDirty: true });
      notify({ title: "Profile image removed", variant: "success" });
    } catch (error) {
      notify({
        title: "Profile image could not be removed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "error",
      });
    }
  };

  return (
    <form
      noValidate
      onSubmit={(event) => void submit(event)}
      className="flex max-w-2xl flex-col gap-5"
    >
      <div className="flex items-center gap-4 border-b border-border pb-5">
        <Avatar
          name={user?.displayName || user?.username || "Relio user"}
          src={form.watch("avatarUrl") || undefined}
          size="lg"
        />
        <div className="min-w-0">
          <p className="text-sm font-medium">Profile image</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Upload a JPEG, PNG, or WebP image up to 5 MB.
          </p>
        </div>
      </div>
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        aria-label="Upload profile image"
        onChange={(event) => void uploadAvatar(event)}
      />
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          loading={isUploadingAvatar}
          disabled={isUploadingAvatar}
          icon={<ImagePlus />}
          className="rounded-md"
          onClick={() => avatarInputRef.current?.click()}
        >
          Upload image
        </Button>
        {form.watch("avatarUrl") ? (
          <Button
            type="button"
            variant="ghost"
            icon={<Trash2 />}
            className="rounded-md"
            onClick={() => void removeAvatar()}
          >
            Remove image
          </Button>
        ) : null}
      </div>
      <Input
        id="profile-avatar-url"
        label="Avatar image URL"
        type="url"
        placeholder="https://example.com/photo.jpg"
        error={form.formState.errors.avatarUrl?.message}
        {...form.register("avatarUrl")}
      />
      <Input
        id="profile-username"
        label="Username"
        autoComplete="username"
        error={form.formState.errors.username?.message}
        {...form.register("username")}
      />
      <Input
        id="profile-email"
        label="Email address"
        type="email"
        value={user?.email ?? ""}
        disabled
        hint="Email changes are not available."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          id="profile-first-name"
          label="First name"
          autoComplete="given-name"
          error={form.formState.errors.firstName?.message}
          {...form.register("firstName")}
        />
        <Input
          id="profile-last-name"
          label="Last name"
          autoComplete="family-name"
          error={form.formState.errors.lastName?.message}
          {...form.register("lastName")}
        />
      </div>
      <Input
        id="profile-display-name"
        label="Display name"
        autoComplete="name"
        error={form.formState.errors.displayName?.message}
        {...form.register("displayName")}
      />
      <label
        htmlFor="profile-bio"
        className="flex flex-col gap-1.5 text-[13px] font-medium"
      >
        About
        <textarea
          id="profile-bio"
          rows={3}
          maxLength={500}
          aria-invalid={form.formState.errors.bio ? true : undefined}
          className="min-h-24 resize-y rounded-md border border-input bg-background px-3 py-2 text-sm font-normal outline-none transition focus-visible:ring-2 focus-visible:ring-ring/40"
          {...form.register("bio")}
        />
        {form.formState.errors.bio?.message ? (
          <span className="text-xs font-normal text-destructive">
            {form.formState.errors.bio.message}
          </span>
        ) : null}
      </label>
      <div>
        <Button
          type="submit"
          loading={form.formState.isSubmitting}
          statusLabels={{ pending: "Saving profile" }}
          className="w-40 rounded-md"
        >
          Save profile
        </Button>
      </div>
    </form>
  );
}

function SecuritySettings() {
  const { user, logout } = useAuth();
  const { notify } = useNotifications();
  const navigate = useNavigate();
  const [notice, setNotice] = useState<{
    message: string;
    tone: "success" | "error";
  } | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);

  const changePassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice(null);
    if (newPassword.length < 8) {
      setNotice({
        message: "Use at least 8 characters for your new password.",
        tone: "error",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      setNotice({ message: "Passwords do not match.", tone: "error" });
      return;
    }
    try {
      await authApi.changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setNotice({ message: "Password updated.", tone: "success" });
      notify({ title: "Password updated", variant: "success" });
    } catch (error) {
      setNotice({
        message: error instanceof Error ? error.message : "Unable to change password.",
        tone: "error",
      });
      notify({
        title: "Password could not be updated",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "error",
      });
    }
  };

  const deleteAccount = async () => {
    if (!deletePassword && !confirmEmail.trim()) {
      throw new Error("Enter your password or confirm your account email.");
    }
    await authApi.deleteAccount({
      ...(deletePassword ? { currentPassword: deletePassword } : {}),
      ...(confirmEmail ? { confirmEmail } : {}),
    });
    await logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="max-w-2xl">
      <form
        onSubmit={(event) => void changePassword(event)}
        className="flex flex-col gap-4"
      >
        <div>
          <h3 className="text-base font-semibold">Change password</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose a unique password with at least 8 characters.
          </p>
        </div>
        <Input
          id="current-password"
          label="Current password"
          type="password"
          autoComplete="current-password"
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
          required
        />
        <Input
          id="new-password"
          label="New password"
          type="password"
          autoComplete="new-password"
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
          required
          minLength={8}
        />
        <Input
          id="confirm-new-password"
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          required
        />
        {notice ? <FormNotice {...notice} /> : null}
        <div>
          <Button type="submit" className="rounded-md">
            Update password
          </Button>
        </div>
      </form>
      <section className="mt-10 border-t border-border pt-6">
        <h3 className="text-base font-semibold text-destructive">Delete account</h3>
        <p className="my-2 text-sm leading-6 text-muted-foreground">
          Permanently delete your account and its private workspace data.
        </p>
        <ConfirmationDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          trigger={
            <Button type="button" variant="destructive" className="rounded-md">
              <span>Delete account</span>
              <Trash2 className="size-4 ml-2" />
            </Button>
          }
          title="Delete your account?"
          description="This permanently removes your account and all records in your private workspace. This action cannot be undone."
          confirmLabel="Delete account"
          tone="destructive"
          errorMessage="Account deletion failed. Check your confirmation and try again."
          onConfirm={deleteAccount}
        >
          <div className="flex flex-col gap-3">
            <Input
              id="delete-current-password"
              label="Current password"
              type="password"
              autoComplete="current-password"
              value={deletePassword}
              onChange={(event) => setDeletePassword(event.target.value)}
              hint="For email and password accounts."
            />
            <Input
              id="delete-confirm-email"
              label="Confirm account email"
              type="email"
              autoComplete="email"
              value={confirmEmail}
              onChange={(event) => setConfirmEmail(event.target.value)}
              hint={`For Google accounts: ${user?.email ?? ""}`}
            />
          </div>
        </ConfirmationDialog>
      </section>
    </div>
  );
}

function PreferencesSettings() {
  const { user, updateProfile } = useAuth();
  const { notify } = useNotifications();
  const [saveError, setSaveError] = useState<string | null>(null);
  if (!user) return null;

  const updateNotification = async (
    key: keyof typeof user.notificationPreferences,
    checked: boolean,
  ) => {
    setSaveError(null);
    try {
      await updateProfile({
        notificationPreferences: { ...user.notificationPreferences, [key]: checked },
      });
      notify({ title: "Notification preference saved", variant: "success" });
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : "Unable to save notification preference.",
      );
      notify({
        title: "Notification preference could not be saved",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "error",
      });
      throw error;
    }
  };

  const notifications = [
    ["taskReminders", "Task reminders", "One day before a task is due."],
    ["overdueTasks", "Overdue tasks", "When an open task passes its due date."],
    ["upcomingFollowUps", "Upcoming follow-ups", "Reminders for scheduled follow-ups."],
    ["dealWon", "Deals won", "When a deal is marked as won."],
    ["dealLost", "Deals lost", "When a deal is marked as lost."],
    [
      "approachingDealClosingDates",
      "Closing dates",
      "When an open deal’s expected close date is approaching.",
    ],
  ] as const;

  return (
    <div className="max-w-2xl">
      <section>
        <h3 className="text-base font-semibold">Appearance</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose a theme for your workspace.
        </p>
        <div className="mt-4 inline-flex max-w-full overflow-x-auto">
          <ThemeSwitcher />
        </div>
      </section>
      <section className="mt-8 border-t border-border pt-6">
        <h3 className="text-base font-semibold">Notifications</h3>
        {saveError ? <FormNotice message={saveError} /> : null}
        <div className="mt-3 divide-y divide-border">
          {notifications.map(([key, label, description]) => (
            <div key={key} className="flex items-center justify-between gap-5 py-4">
              <div className="min-w-0">
                <p className="text-sm font-medium">{label}</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {description}
                </p>
              </div>
              <Switch
                checked={user.notificationPreferences[key]}
                onCheckedChange={(checked) => updateNotification(key, checked)}
                aria-label={label}
              />
            </div>
          ))}
        </div>
      </section>
      <section className="mt-8 border-t border-border pt-6">
        <h3 className="text-base font-semibold">Default currency</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Relio stores monetary values in US dollars. Currency conversion isn’t
          supported.
        </p>
        <div className="mt-4 max-w-xs">
          <Input
            id="default-currency"
            label="Currency"
            value="USD — US Dollar"
            disabled
          />
        </div>
      </section>
    </div>
  );
}

export function AccountSettingsPage() {
  const items = [
    { value: "profile", label: "Profile", content: <ProfileSettings /> },
    { value: "security", label: "Security", content: <SecuritySettings /> },
    { value: "preferences", label: "Preferences", content: <PreferencesSettings /> },
  ];

  return (
    <section className="max-w-4xl">
      <Tabs items={items} defaultValue="profile" label="Account settings" />
    </section>
  );
}
