import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, MailCheck } from "lucide-react";
import { notifyError, notifySuccess } from "@/lib/errors";
import { signInSchema, signUpSchema, forgotPasswordSchema } from "@/lib/validation/schemas";

type Mode = "signin" | "signup" | "forgot";

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [userType, setUserType] = useState<"customer" | "provider">("customer");
  const [checkEmail, setCheckEmail] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const rawNext = searchParams.get("next") ?? "";
  const nextPath = /^\/(?!\/)/.test(rawNext) ? rawNext : "/dashboard";

  const collectErrors = (issues: { path: (string | number)[]; message: string }[]) => {
    const next: Record<string, string> = {};
    for (const issue of issues) next[String(issue.path[0])] = issue.message;
    setErrors(next);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = signUpSchema.safeParse({ fullName, email, password, userType });
    if (!parsed.success) {
      collectErrors(parsed.error.issues);
      return;
    }
    setErrors({});
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: parsed.data.email,
        password: parsed.data.password,
        options: {
          emailRedirectTo: `${window.location.origin}${nextPath}`,
          data: { full_name: parsed.data.fullName, user_type: parsed.data.userType },
        },
      });
      if (error) throw error;

      if (data.session) {
        notifySuccess("Account created", "You're signed in.");
        navigate(nextPath);
        return;
      }
      setCheckEmail(parsed.data.email);
    } catch (error) {
      notifyError(error, "Sign up failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = signInSchema.safeParse({ email, password });
    if (!parsed.success) {
      collectErrors(parsed.error.issues);
      return;
    }
    setErrors({});
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword(parsed.data);
      if (error) throw error;
      notifySuccess("Welcome back");
      navigate(nextPath);
    } catch (error) {
      notifyError(error, "Sign in failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = forgotPasswordSchema.safeParse({ email });
    if (!parsed.success) {
      collectErrors(parsed.error.issues);
      return;
    }
    setErrors({});
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      notifySuccess("Reset link sent", "Check your inbox for a password reset email.");
      setMode("signin");
    } catch (error) {
      notifyError(error, "Could not send reset email");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogle = async () => {
    setIsLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) throw new Error(result.error.message ?? "Google sign-in failed");
      if (result.redirected) return;
      navigate(nextPath);
    } catch (error) {
      notifyError(error, "Google sign-in failed");
    } finally {
      setIsLoading(false);
    }
  };

  if (checkEmail) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <MailCheck className="mx-auto h-10 w-10 text-primary" aria-hidden="true" />
            <CardTitle>Confirm your email</CardTitle>
            <CardDescription>
              We sent a confirmation link to {checkEmail}. Click it to activate your account, then
              sign in.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" onClick={() => setCheckEmail(null)}>
              Back to sign in
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-center text-2xl font-bold">Fetan</CardTitle>
          <CardDescription className="text-center">
            Book trusted home renovation and maintenance experts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {mode === "forgot" ? (
            <form className="space-y-4" onSubmit={handleForgotPassword}>
              <Alert>
                <AlertTitle>Reset your password</AlertTitle>
                <AlertDescription>
                  Enter your email and we'll send you a reset link.
                </AlertDescription>
              </Alert>
              <div className="space-y-2">
                <Label htmlFor="forgot-email">Email</Label>
                <Input
                  id="forgot-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={Boolean(errors.email)}
                  required
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send reset link
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setMode("signin")}
              >
                Back to sign in
              </Button>
            </form>
          ) : (
            <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      autoComplete="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      aria-invalid={Boolean(errors.email)}
                      required
                    />
                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="h-11 w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Sign In
                  </Button>
                  <Button
                    type="button"
                    variant="link"
                    className="w-full"
                    onClick={() => setMode("forgot")}
                  >
                    Forgot your password?
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      autoComplete="name"
                      placeholder="Abebe Kebede"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      aria-invalid={Boolean(errors.fullName)}
                      required
                    />
                    {errors.fullName && (
                      <p className="text-sm text-destructive">{errors.fullName}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      autoComplete="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      aria-invalid={Boolean(errors.email)}
                      required
                    />
                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      aria-invalid={Boolean(errors.password)}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      At least 12 characters with uppercase, lowercase, and numbers.
                    </p>
                    {errors.password && (
                      <p className="text-sm text-destructive">{errors.password}</p>
                    )}
                  </div>
                  <fieldset className="space-y-2">
                    <legend className="text-sm font-medium">I am a</legend>
                    <RadioGroup
                      value={userType}
                      onValueChange={(value) => setUserType(value as "customer" | "provider")}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="customer" id="customer" />
                        <Label htmlFor="customer" className="font-normal">
                          Customer
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="provider" id="provider" />
                        <Label htmlFor="provider" className="font-normal">
                          Service Provider
                        </Label>
                      </div>
                    </RadioGroup>
                  </fieldset>
                  <Button type="submit" className="h-11 w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Account
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          )}

          {mode !== "forgot" && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">or</span>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                className="h-11 w-full"
                disabled={isLoading}
                onClick={handleGoogle}
              >
                Continue with Google
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
