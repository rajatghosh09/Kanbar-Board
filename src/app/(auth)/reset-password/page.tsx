"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  resetPasswordSchema,
  ResetPasswordFormData,
} from "@/service/validation/registervalidation";
import { useUserAuth } from "@/zustand/userAuth";
import { supabaseClient } from "@/lib/supabaseclient";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Lock, Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { loading, setLoading } = useUserAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // In Supabase password recovery flows, the user receives an email with a link.
  // When clicked, it assigns an active session, allowing them to directly update their details.
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (!session) {
        toast.error("Invalid or expired session. Please request a new recovery email.");
        router.replace("/forgot-password");
      }
    };
    checkSession();
  }, [router]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: yupResolver(resetPasswordSchema),
  });

  const onSubmit = async (values: ResetPasswordFormData) => {
    try {
      setLoading(true);

      const { error } = await supabaseClient.auth.updateUser({
        password: values.password,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Password updated successfully! Please login with your new password.");
      
      // Clear session so they must log in manually
      await supabaseClient.auth.signOut();
      localStorage.removeItem("loginTime");
      
      reset();
      router.replace("/login");
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4 bg-background/95 relative overflow-hidden">
      {/* Soft background glow circles */}
      <div className="absolute top-[-20%] left-[-15%] w-[60%] h-[60%] rounded-full bg-primary/5 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-15%] w-[60%] h-[60%] rounded-full bg-primary/5 blur-[130px] pointer-events-none" />

      <Card className="w-full max-w-md border-border/60 bg-card/75 backdrop-blur-md shadow-xl rounded-2xl relative z-10 p-2">
        <CardHeader className="flex flex-col items-center pb-2 pt-6">
          <div className="bg-primary text-primary-foreground p-3 rounded-2xl font-black text-xl tracking-wider flex items-center justify-center w-12 h-12 shadow-lg mb-3 transform hover:rotate-6 transition-transform">
            KF
          </div>
          <CardTitle className="text-2xl font-extrabold text-center tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
            New Password
          </CardTitle>
          <CardDescription className="text-center text-xs text-muted-foreground/90 mt-1">
            Choose a strong, secure new password for your account
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* New Password */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground/85">New Password</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/80" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10 pr-10 h-10 border-border/60 focus-visible:ring-1 focus-visible:ring-primary/30 rounded-xl"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground/80 hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive mt-1 pl-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground/85">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/80" />
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10 pr-10 h-10 border-border/60 focus-visible:ring-1 focus-visible:ring-primary/30 rounded-xl"
                  {...register("confirmPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground/80 hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-destructive mt-1 pl-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-10 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-200 mt-6"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating password...
                </>
              ) : (
                "Update Password"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
