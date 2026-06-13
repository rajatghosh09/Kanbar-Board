"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  forgotPasswordSchema,
  ForgotPasswordFormData,
} from "@/service/validation/registervalidation";
import { useUserAuth } from "@/zustand/userAuth";
import { supabaseClient } from "@/lib/supabaseclient";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Mail, ArrowLeft } from "lucide-react";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const { loading, setLoading } = useUserAuth();
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: yupResolver(forgotPasswordSchema),
  });

  const onSubmit = async (values: ForgotPasswordFormData) => {
    try {
      setLoading(true);

      const { error } = await supabaseClient.auth.resetPasswordForEmail(
        values.email,
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Password recovery email sent!");
      setEmailSent(true);
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
            Reset Password
          </CardTitle>
          <CardDescription className="text-center text-xs text-muted-foreground/90 mt-1">
            {emailSent
              ? "We sent a password recovery link to your inbox"
              : "Enter your email to receive a recovery link"}
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-4">
          {emailSent ? (
            <div className="space-y-4">
              <div className="bg-muted/30 border border-border/40 p-4 rounded-xl text-xs text-center text-muted-foreground leading-relaxed">
                Check your email for a link to reset your password. If it
                doesn't appear within a few minutes, check your spam folder.
              </div>

              <Link href="/login" className="w-full">
                <Button variant="outline" className="w-full h-10 rounded-xl gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Login
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground/85">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/80" />
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    className="pl-10 h-10 border-border/60 focus-visible:ring-1 focus-visible:ring-primary/30 rounded-xl"
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-destructive mt-1 pl-1">
                    {errors.email.message}
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
                    Sending link...
                  </>
                ) : (
                  "Send Recovery Link"
                )}
              </Button>

              {/* Back to Login link */}
              <p className="text-center text-xs text-muted-foreground mt-4 pt-2 border-t border-border/40">
                <Link
                  href="/login"
                  className="font-semibold text-foreground hover:underline inline-flex items-center gap-1.5"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Back to Login
                </Link>
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
