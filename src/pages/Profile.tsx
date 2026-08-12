import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, Upload, Trash2, ArrowLeft } from "lucide-react";
import { notifyError, notifySuccess } from "@/lib/errors";
import { profileSchema, passwordSchema } from "@/lib/validation/schemas";
import {
  getMyProfile,
  upsertMyProfile,
  uploadAvatar,
  removeAvatar,
  getAvatarSignedUrl,
} from "@/services/profiles";
import { ListSkeleton, ErrorState } from "@/components/states/PageState";

export default function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({ full_name: "", phone: "", address: "" });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const profileQuery = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: () => getMyProfile(user!.id),
    enabled: Boolean(user?.id),
  });

  useEffect(() => {
    const profile = profileQuery.data;
    if (!profile) return;
    setForm({
      full_name: profile.full_name ?? "",
      phone: profile.phone ?? "",
      address: profile.address ?? "",
    });
    void getAvatarSignedUrl(profile.avatar_url).then(setAvatarUrl);
  }, [profileQuery.data]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const parsed = profileSchema.safeParse(form);
      if (!parsed.success) {
        const errors: Record<string, string> = {};
        for (const issue of parsed.error.issues) errors[String(issue.path[0])] = issue.message;
        setFieldErrors(errors);
        throw new Error("Please fix the highlighted fields.");
      }
      setFieldErrors({});
      return upsertMyProfile(user!.id, parsed.data);
    },
    onSuccess: () => {
      notifySuccess("Profile updated", "Your details have been saved.");
      void queryClient.invalidateQueries({ queryKey: ["profile", user?.id] });
    },
    onError: (error) => notifyError(error, "Could not save profile"),
  });

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !user) return;
    setUploading(true);
    try {
      const path = await uploadAvatar(user.id, file);
      setAvatarUrl(await getAvatarSignedUrl(path));
      notifySuccess("Photo updated");
      void queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
    } catch (error) {
      notifyError(error, "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleAvatarRemove = async () => {
    if (!user) return;
    setUploading(true);
    try {
      await removeAvatar(user.id, profileQuery.data?.avatar_url ?? null);
      setAvatarUrl(null);
      notifySuccess("Photo removed");
      void queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
    } catch (error) {
      notifyError(error, "Could not remove photo");
    } finally {
      setUploading(false);
    }
  };

  const handlePasswordChange = async (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = passwordSchema.safeParse(newPassword);
    if (!parsed.success) {
      notifyError(new Error(parsed.error.issues[0].message), "Password not strong enough");
      return;
    }
    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setNewPassword("");
      notifySuccess("Password changed", "Use your new password next time you sign in.");
    } catch (error) {
      notifyError(error, "Could not change password");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const { error } = await supabase.functions.invoke("delete-account");
      if (error) throw error;
      await signOut();
      notifySuccess("Account deleted", "Your account and data have been removed.");
      navigate("/");
    } catch (error) {
      notifyError(error, "Could not delete account");
    } finally {
      setDeleting(false);
    }
  };

  const initials = (form.full_name || user?.email || "?").charAt(0).toUpperCase();

  return (
    <main className="min-h-screen bg-background pb-24 pt-6 md:pb-10">
      <div className="container mx-auto max-w-3xl space-y-6 px-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" aria-label="Go back" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Your profile</h1>
        </div>

        {profileQuery.isLoading && <ListSkeleton rows={2} />}
        {profileQuery.isError && (
          <ErrorState onRetry={() => void profileQuery.refetch()} />
        )}

        {!profileQuery.isLoading && !profileQuery.isError && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Photo</CardTitle>
                <CardDescription>JPG, PNG, or WebP up to 2 MB.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={avatarUrl ?? undefined} alt="Your profile photo" />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="flex flex-wrap gap-2">
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    onChange={handleAvatarChange}
                    aria-label="Upload profile photo"
                  />
                  <Button
                    variant="outline"
                    disabled={uploading}
                    onClick={() => fileRef.current?.click()}
                  >
                    {uploading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="mr-2 h-4 w-4" />
                    )}
                    {profileQuery.data?.avatar_url ? "Replace photo" : "Upload photo"}
                  </Button>
                  {profileQuery.data?.avatar_url && (
                    <Button variant="ghost" disabled={uploading} onClick={handleAvatarRemove}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Remove
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Personal details</CardTitle>
                <CardDescription>Signed in as {user?.email}</CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    saveMutation.mutate();
                  }}
                >
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full name</Label>
                    <Input
                      id="full_name"
                      value={form.full_name}
                      onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                      aria-invalid={Boolean(fieldErrors.full_name)}
                      required
                    />
                    {fieldErrors.full_name && (
                      <p className="text-sm text-destructive">{fieldErrors.full_name}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      inputMode="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      aria-invalid={Boolean(fieldErrors.phone)}
                    />
                    {fieldErrors.phone && (
                      <p className="text-sm text-destructive">{fieldErrors.phone}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <Button type="submit" disabled={saveMutation.isPending}>
                    {saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save changes
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Change password</CardTitle>
                <CardDescription>
                  At least 12 characters with uppercase, lowercase, and a number.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handlePasswordChange}>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      autoComplete="new-password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" variant="outline" disabled={changingPassword}>
                    {changingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Update password
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="border-destructive/40">
              <CardHeader>
                <CardTitle>Delete account</CardTitle>
                <CardDescription>
                  This permanently removes your account and personal data. It cannot be undone.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" disabled={deleting}>
                      {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Delete my account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Your profile and account will be permanently deleted. This cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteAccount}>
                        Yes, delete it
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </main>
  );
}
