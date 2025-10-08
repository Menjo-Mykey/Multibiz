import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Scissors, Droplets, KeyRound, Mail } from "lucide-react";
import { PinPad } from "@/components/auth/PinPad";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

export const Auth: React.FC = () => {
  const [loginMode, setLoginMode] = useState<"pin" | "email">("pin");
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [forgotEmail, setForgotEmail] = useState("");
  const [showForgotPin, setShowForgotPin] = useState(false);
  const [resetPhone, setResetPhone] = useState("");

  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      redirectBasedOnRole();
    }
  }, [user, navigate]);

  const redirectBasedOnRole = async () => {
    if (!user) return;

    try {
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (roleData) {
        switch (roleData.role) {
          case "manager":
            navigate("/dashboard");
            break;
          case "barber":
            navigate("/clock");
            break;
          case "accountant":
            navigate("/pos");
            break;
          default:
            navigate("/dashboard");
        }
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      navigate("/dashboard");
    }
  };

  const handlePinLogin = async () => {
    if (pin.length < 4) return;

    setLoading(true);
    try {
      // In a real app, this would verify PIN against the database
      // For now, we'll show a mock implementation
      const { data: profiles } = await supabase
        .from("profiles")
        .select(
          "id, full_name, photo_url, email, failed_login_attempts, locked_until"
        )
        .eq("pin_hash", pin) // In production, hash the PIN before comparing
        .maybeSingle();

      if (profiles) {
        // Check if account is locked
        if (
          profiles.locked_until &&
          new Date(profiles.locked_until) > new Date()
        ) {
          const minutesLeft = Math.ceil(
            (new Date(profiles.locked_until).getTime() - Date.now()) / 60000
          );
          alert(`Account locked. Try again in ${minutesLeft} minutes.`);
          setLoading(false);
          return;
        }

        setUserProfile(profiles);
        // Here you would sign in with the user's credentials
        // This is a simplified version - in production, implement proper PIN authentication
      } else {
        alert("Invalid PIN");
      }
    } catch (error) {
      console.error("PIN login error:", error);
      alert("Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail) return;
    setLoading(true);
    try {
      const redirectTo = `${window.location.origin}/auth`;
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo,
      });
      if (error) throw error;
      alert("Password reset email sent. Please check your inbox.");
      setForgotEmail("");
    } catch (e: any) {
      alert(e.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  const submitPinResetRequest = async () => {
    if (!resetPhone) return;
    setLoading(true);
    try {
      await supabase.from("notifications").insert({
        user_id: null,
        title: "PIN Reset Request",
        message: `PIN reset requested for phone ${resetPhone}`,
        type: "pin_reset",
      });
      alert(
        "Reset request sent. Manager will approve and you will receive a temporary PIN."
      );
      setShowForgotPin(false);
      setResetPhone("");
    } catch (e: any) {
      alert(e.message || "Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isLogin) {
      await signIn(email, password);
    } else {
      await signUp(email, password, fullName);
      setIsLogin(true); // Switch to login after successful signup
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center gap-4 mb-4">
            <div className="flex items-center gap-2 text-triplek">
              <Scissors className="h-6 w-6" />
              <span className="font-semibold">TrippleK</span>
            </div>
            <div className="flex items-center gap-2 text-swan">
              <Droplets className="h-6 w-6" />
              <span className="font-semibold">Swan</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Multibiz</CardTitle>
          <CardDescription>
            Your all-in-one POS for every part of your business
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Login Mode Toggle */}
          <div className="flex gap-2 mb-4">
            <Button
              variant={loginMode === "pin" ? "default" : "outline"}
              className="flex-1"
              onClick={() => setLoginMode("pin")}
            >
              <KeyRound className="h-4 w-4 mr-2" />
              PIN Login
            </Button>
            <Button
              variant={loginMode === "email" ? "default" : "outline"}
              className="flex-1"
              onClick={() => setLoginMode("email")}
            >
              <Mail className="h-4 w-4 mr-2" />
              Email Login
            </Button>
          </div>

          {loginMode === "pin" ? (
            /* PIN Login */
            <div className="space-y-4">
              {userProfile ? (
                /* Show user confirmation */
                <div className="text-center space-y-4">
                  {userProfile.photo_url && (
                    <img
                      src={userProfile.photo_url}
                      alt={userProfile.full_name}
                      className="w-24 h-24 rounded-full mx-auto object-cover"
                    />
                  )}
                  <div>
                    <p className="text-lg font-semibold">
                      {userProfile.full_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {userProfile.email}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setUserProfile(null);
                        setPin("");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={() => {
                        // Proceed with login
                        signIn(userProfile.email, pin);
                      }}
                      disabled={loading}
                    >
                      {loading ? "Logging in..." : "Confirm & Login"}
                    </Button>
                  </div>
                </div>
              ) : (
                /* Show PIN pad */
                <>
                  <div className="text-center mb-4">
                    <p className="text-sm text-muted-foreground">
                      Enter your 4-6 digit PIN
                    </p>
                  </div>
                  <PinPad pin={pin} onPinChange={setPin} />
                  <Button
                    className="w-full"
                    disabled={pin.length < 4 || loading}
                    onClick={handlePinLogin}
                  >
                    {loading ? "Verifying..." : "Continue"}
                  </Button>
                  <button
                    className="block w-full text-center text-xs text-muted-foreground underline"
                    onClick={() => setShowForgotPin(true)}
                  >
                    Forgot PIN?
                  </button>
                </>
              )}
            </div>
          ) : (
            /* Email/Password Login */
            <Tabs
              value={isLogin ? "login" : "signup"}
              onValueChange={(v) => setIsLogin(v === "login")}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Forgot password? Enter email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleForgotPassword}
                      disabled={loading}
                    >
                      Send Reset Link
                    </Button>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>

      {/* PIN Reset Request Modal */}
      <Dialog open={showForgotPin} onOpenChange={setShowForgotPin}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request PIN Reset</DialogTitle>
            <DialogDescription>
              Enter your registered phone number or employee ID. Manager will
              approve your request.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Label htmlFor="resetPhone">Phone or Employee ID</Label>
            <Input
              id="resetPhone"
              placeholder="07xx xxx xxx or EMP123"
              value={resetPhone}
              onChange={(e) => setResetPhone(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowForgotPin(false)}>
                Cancel
              </Button>
              <Button onClick={submitPinResetRequest} disabled={loading}>
                Request Reset
              </Button>
            </div>
          </div>
          <Separator />
          <p className="text-xs text-muted-foreground">
            You'll receive a temporary PIN via SMS once approved. It expires in
            24 hours.
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
};
